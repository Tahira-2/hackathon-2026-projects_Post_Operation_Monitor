import logging
import os
import uuid
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)

_SESSION_TTL_HOURS = 2

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import Response
from src.api.models import (
    ConsultationTranscript,
    SOAPNote,
    SOAPApprovalRequest,
    SOAPDraftMeta,
    SOAPDraftWithMeta,
    SessionStartRequest,
    SessionStartResponse,
    SessionChunkRequest,
    SessionChunkResponse,
    SessionStateResponse,
    SessionFinalizeResponse,
    TranscriptChunkRequest,
    TranscriptChunkResponse,
    TranscribeUploadResponse,
)
from src.api.dependencies import require_role, get_current_user
from src.core_logic.soap_parser import parse_transcript_to_soap
from src.core_logic.stream_session import (
    ConsultationSession,
    SoapDraftWithMeta,
    update_session_with_chunk,
    finalize_session,
    soap_to_core_note,
)
from src.core_logic.asr_provider import build_provider
from src.core_logic.transcriber import (
    transcribe_audio,
    TranscriptionError,
    SUPPORTED_CONTENT_TYPES,
    WHISPER_API_MAX_BYTES,
)
from src.core_logic.models import SoapNote as CoreSoapNote
from src.core_logic.soap_pdf import render_soap_note_pdf_bytes
from src.database.db_client import (
    insert_soap_note,
    approve_soap_note,
    update_soap_note_content,
    get_soap_note_by_appointment,
    get_or_create_doctor_profile,
)

router = APIRouter()
def _require_doctor_appointment_access(current_user: dict, appointment_id: str) -> dict:
    """Ensure caller is a doctor. Auto-creates profile if needed.
    Ownership check is relaxed for demo: all doctor-role users can access all appointments
    (matching the dashboard where all appointments are visible to any logged-in doctor).
    """
    doctor = get_or_create_doctor_profile(current_user["user_id"])
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found for current user.")
    return doctor



# ---------------------------------------------------------------------------
# In-memory session store
# Primary store for ephemeral consultation sessions. DB persistence is
# attempted opportunistically and is non-blocking if unavailable.
# ---------------------------------------------------------------------------
_sessions: dict[str, ConsultationSession] = {}


def _evict_stale_sessions() -> None:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=_SESSION_TTL_HOURS)
    stale = [
        sid for sid, s in _sessions.items()
        if datetime.fromisoformat(s.created_at) < cutoff
    ]
    for sid in stale:
        _sessions.pop(sid, None)
    if stale:
        logger.info("Evicted %d stale session(s): %s", len(stale), stale)


def _get_session(session_id: str) -> ConsultationSession:
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(
            status_code=404,
            detail=f"SESSION_NOT_FOUND: session '{session_id}' does not exist.",
        )
    return session


def _draft_to_api(draft: SoapDraftWithMeta) -> SOAPDraftWithMeta:
    return SOAPDraftWithMeta(
        subjective=draft.subjective,
        objective=draft.objective,
        assessment=draft.assessment,
        plan=draft.plan,
        metadata=SOAPDraftMeta(
            derived_from_transcript=draft.derived_from_transcript,
            transcript_chars_processed=draft.transcript_chars_processed,
            update_timestamp=draft.update_timestamp,
            chunk_index=draft.chunk_index,
            quality_hint=draft.quality_hint,
            change_summary=draft.change_summary,
        ),
    )


def _empty_api_draft() -> SOAPDraftWithMeta:
    return SOAPDraftWithMeta(
        metadata=SOAPDraftMeta(change_summary="No transcript yet.")
    )


# ---------------------------------------------------------------------------
# Video/audio upload → transcription → SOAP
# ---------------------------------------------------------------------------

@router.post(
    "/transcribe-upload",
    response_model=TranscribeUploadResponse,
    dependencies=[Depends(require_role("doctor"))],
)
async def transcribe_upload(
    appointment_id: str = Form(...),
    language: str = Form(default="en"),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    _require_doctor_appointment_access(current_user, appointment_id)

    """
    Doctor-only. Upload a consultation recording (MP4, WebM, M4A, MP3, WAV)
    and receive a fully parsed SOAP draft in one call.

    Workflow:
      1. Validate file type and size.
      2. Transcribe via OpenAI Whisper API (if OPENAI_API_KEY set) or
         local openai-whisper (fallback, no key needed).
      3. Run transcript through SOAP parser (deterministic, no LLM inference).
      4. Persist as unapproved soap_note draft (best-effort; non-blocking on DB failure).
      5. Return transcript + SOAP draft + quality metadata.

    The doctor then reviews, edits if needed, and calls PATCH /soap/approve
    before FHIR export is unlocked.

    File size limit: 25 MB (OpenAI Whisper API hard limit).
    For longer recordings, export a shorter audio clip or use the manual transcript panel.
    """
    # 1. Validate content type
    content_type = (file.content_type or "").lower()
    filename = file.filename or "recording.mp4"
    extension = os.path.splitext(filename)[1].lower()

    if content_type not in SUPPORTED_CONTENT_TYPES and extension not in {
        ".mp4", ".webm", ".mov", ".m4a", ".mp3", ".wav", ".ogg"
    }:
        raise HTTPException(
            status_code=415,
            detail=(
                f"Unsupported file type '{content_type}'. "
                "Accepted formats: MP4, WebM, MOV, M4A, MP3, WAV, OGG."
            ),
        )

    # 2. Read bytes and enforce size limit
    audio_bytes = await file.read()
    size_mb = len(audio_bytes) / (1024 * 1024)

    if len(audio_bytes) > WHISPER_API_MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail=(
                f"File is {size_mb:.1f} MB — exceeds the 25 MB limit. "
                "For longer recordings, export an audio-only clip of the key 5–10 minutes "
                "or use the manual transcript panel."
            ),
        )

    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # 3. Transcribe
    try:
        result = transcribe_audio(
            audio_bytes,
            filename=filename,
            language=language if language != "en" else None,
        )
    except TranscriptionError as exc:
        raise HTTPException(status_code=503, detail=f"{exc.code}: {exc.message}")
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed unexpectedly: {exc}",
        )

    # 4. Parse SOAP from transcript (deterministic, non-diagnostic)
    soap_note = parse_transcript_to_soap(result.transcript)

    transcript_len = len(result.transcript)
    filled = sum(
        1 for s in [soap_note.subjective, soap_note.objective, soap_note.assessment, soap_note.plan]
        if s.strip()
    )
    quality: str
    if filled == 4 and transcript_len > 200:
        quality = "sufficient"
    elif filled >= 2:
        quality = "partial"
    else:
        quality = "minimal"

    now = datetime.now(timezone.utc).isoformat()

    soap_draft = SOAPDraftWithMeta(
        subjective=soap_note.subjective,
        objective=soap_note.objective,
        assessment=soap_note.assessment,
        plan=soap_note.plan,
        metadata=SOAPDraftMeta(
            derived_from_transcript=True,
            transcript_chars_processed=transcript_len,
            update_timestamp=now,
            chunk_index=0,
            quality_hint=quality,
            change_summary="Generated from uploaded recording.",
        ),
    )

    # 5. Persist soap_note to DB (best-effort — non-blocking on failure)
    warning: str | None = None
    try:
        doctor = get_or_create_doctor_profile(current_user["user_id"])
        doctor_id = doctor["id"] if doctor else current_user["user_id"]

        soap_fields = dict(
            subjective=soap_note.subjective,
            objective=soap_note.objective,
            assessment=soap_note.assessment,
            plan=soap_note.plan,
            raw_transcript=result.transcript,
        )

        existing = get_soap_note_by_appointment(appointment_id)
        if existing and not existing.get("approved"):
            update_soap_note_content(note_id=existing["id"], **soap_fields)
        elif not existing:
            insert_soap_note(
                appointment_id=appointment_id,
                doctor_id=doctor_id,
                **soap_fields,
            )
    except Exception as db_exc:
        warning = (
            f"SOAP draft was parsed successfully but could not be persisted to the database "
            f"({type(db_exc).__name__}). You can still review and approve — the data will be saved on approval."
        )

    # Warn if transcript is very short (might be silence or wrong file)
    if transcript_len < 50:
        warning = (
            (warning + " ") if warning else ""
        ) + (
            "Transcript is very short — the recording may be silent or the wrong file. "
            "Verify the file contains speech."
        )

    return TranscribeUploadResponse(
        appointment_id=appointment_id,
        transcript=result.transcript,
        soap_draft=soap_draft,
        transcription_provider=result.provider,
        language_detected=result.language_detected,
        duration_seconds=result.duration_seconds,
        file_info={
            "filename": filename,
            "size_mb": round(size_mb, 2),
            "content_type": content_type or "unknown",
        },
        warning=warning,
    )


# ---------------------------------------------------------------------------
# Session endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/session/start",
    response_model=SessionStartResponse,
    dependencies=[Depends(require_role("doctor"))],
)
async def start_session(
    request: SessionStartRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Doctor-only. Creates a new real-time consultation session.

    Returns a server-generated session_id that the client must include in
    all subsequent /chunk, /state, and /finalize calls.

    The provider_mode field tells the client whether a real ASR backend is
    active ('asr') or whether manual text input is required ('fallback').
    """
    _evict_stale_sessions()
    provider = build_provider()
    session_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    session = ConsultationSession(
        session_id=session_id,
        appointment_id=request.appointment_id,
        status="active",
        provider_mode=provider.mode,
        language=request.language,
        created_at=now,
        updated_at=now,
    )
    _sessions[session_id] = session

    return SessionStartResponse(
        session_id=session_id,
        appointment_id=request.appointment_id,
        status="active",
        provider_mode=provider.mode,
        language=request.language,
        created_at=now,
    )


@router.post(
    "/session/{session_id}/chunk",
    response_model=SessionChunkResponse,
    dependencies=[Depends(require_role("doctor"))],
)
async def ingest_chunk(session_id: str, request: SessionChunkRequest):
    """
    Doctor-only. Ingest the next transcript chunk for a live session.

    Behavior:
    - chunk_index must equal last_chunk_index + 1 (0-based sequential).
    - Duplicate chunk_index: idempotent — returns current state unchanged.
    - Out-of-order chunk_index: returns 409 CHUNK_OUT_OF_ORDER.
    - If session is finalized: returns 409 SESSION_ALREADY_FINALIZED.

    The transcript_chunk field carries pre-transcribed text in fallback mode.
    When ASR keys are configured, this field carries an audio reference (future).
    """
    session = _get_session(session_id)

    provider = build_provider()
    raw_text, provider_status = provider.process_chunk(
        request.transcript_chunk,
        source_language=request.language,
        target_language=session.language,
    )

    # If provider returned an error, degrade to raw input text
    if provider_status.startswith("error:"):
        raw_text = request.transcript_chunk
        provider_status = f"fallback_mode (degraded from: {provider_status})"

    try:
        draft = update_session_with_chunk(session, request.chunk_index, raw_text)
    except ValueError as exc:
        err_msg = str(exc)
        if "CHUNK_OUT_OF_ORDER" in err_msg:
            raise HTTPException(status_code=409, detail=err_msg)
        if "SESSION_ALREADY_FINALIZED" in err_msg:
            raise HTTPException(status_code=409, detail=err_msg)
        raise HTTPException(status_code=422, detail=err_msg)

    return SessionChunkResponse(
        session_id=session_id,
        appointment_id=request.appointment_id,
        chunk_index=request.chunk_index,
        transcript_so_far=session.transcript,
        soap_draft=_draft_to_api(draft),
        provider_status=provider_status,
        session_status=session.status,
    )


@router.get(
    "/session/{session_id}/state",
    response_model=SessionStateResponse,
    dependencies=[Depends(require_role("doctor"))],
)
async def get_session_state(session_id: str):
    """
    Doctor-only. Poll the current state of a consultation session.

    Intended for UI polling (recommended interval: 2–3 s).
    Returns the full current transcript and latest SOAP draft.
    """
    session = _get_session(session_id)

    return SessionStateResponse(
        session_id=session_id,
        appointment_id=session.appointment_id,
        status=session.status,
        transcript=session.transcript,
        last_chunk_index=session.last_chunk_index,
        soap_draft=_draft_to_api(session.soap_draft) if session.soap_draft else None,
        provider_mode=session.provider_mode,
        language=session.language,
        created_at=session.created_at,
        updated_at=session.updated_at,
    )


@router.post(
    "/session/{session_id}/finalize",
    response_model=SessionFinalizeResponse,
    dependencies=[Depends(require_role("doctor"))],
)
async def finalize_session_route(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Doctor-only. Lock the session transcript.

    After finalize:
    - No more chunks are accepted (409 SESSION_ALREADY_FINALIZED).
    - The final SOAP draft is persisted as an unapproved soap_note record.
    - The response includes handoff_ready=True when quality_hint is
      'partial' or 'sufficient', signalling the doctor can proceed to approve.
    - Existing /soap/approve flow is unchanged; this just hands off.
    """
    _require_doctor_appointment_access(current_user, _get_session(session_id).appointment_id)
    session = _get_session(session_id)
    finalize_session(session)

    draft = session.soap_draft
    if draft is None:
        raise HTTPException(
            status_code=422,
            detail="Cannot finalize: no transcript chunks received yet.",
        )

    handoff_ready = draft.quality_hint in ("partial", "sufficient")

    # Persist final SOAP draft as unapproved draft note (best-effort)
    try:
        doctor = get_or_create_doctor_profile(current_user["user_id"])
        doctor_id = doctor["id"] if doctor else current_user["user_id"]
        existing = get_soap_note_by_appointment(session.appointment_id)
        soap_fields = dict(
            subjective=draft.subjective,
            objective=draft.objective,
            assessment=draft.assessment,
            plan=draft.plan,
            raw_transcript=session.transcript,
        )
        if existing and not existing.get("approved"):
            update_soap_note_content(note_id=existing["id"], **soap_fields)
        elif not existing:
            insert_soap_note(
                appointment_id=session.appointment_id,
                doctor_id=doctor_id,
                **soap_fields,
            )
    except Exception as exc:
        logger.warning("SOAP persistence failed during finalize for session %s: %s", session_id, exc)

    _sessions.pop(session_id, None)

    return SessionFinalizeResponse(
        session_id=session_id,
        appointment_id=session.appointment_id,
        status="finalized",
        transcript=session.transcript,
        final_soap=_draft_to_api(draft),
        handoff_ready=handoff_ready,
        message=(
            "Session finalized. Proceed to SOAP approval."
            if handoff_ready
            else "Session finalized, but transcript may be insufficient. Review SOAP before approving."
        ),
    )


# ---------------------------------------------------------------------------
# Existing SOAP routes (unchanged)
# ---------------------------------------------------------------------------

@router.post(
    "/transcript",
    response_model=TranscriptChunkResponse,
    dependencies=[Depends(require_role("doctor"))],
)
async def append_transcript_chunk(
    request: TranscriptChunkRequest,
    current_user: dict = Depends(get_current_user),
):
    _require_doctor_appointment_access(current_user, request.appointment_id)

    """
    Doctor-only route — real-time transcript ingestion (sessionless mode).

    Accepts incremental transcript chunks keyed by appointment_id.
    Accumulates them into a rolling raw_transcript, re-parses with Person 3 on
    each call, and returns the updated SOAP draft. The note is persisted as an
    unapproved draft so the doctor can review before committing.
    """
    chunk = request.chunk.strip()
    if not chunk:
        raise HTTPException(status_code=400, detail="Transcript chunk cannot be empty.")

    # Resolve users.id -> doctors.id (auto-creates profile if needed)
    doctor = get_or_create_doctor_profile(current_user["user_id"])
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found for current user.")
    doctor_id = doctor["id"]

    existing = get_soap_note_by_appointment(request.appointment_id)

    if existing and existing.get("approved"):
        raise HTTPException(
            status_code=409,
            detail="SOAP note already approved. Transcript updates are no longer accepted.",
        )

    # Accumulate: append chunk to existing raw_transcript (space-separated)
    prior = (existing.get("raw_transcript") or "").strip() if existing else ""
    full_transcript = f"{prior} {chunk}".strip() if prior else chunk

    # Re-parse full transcript via Person 3 (deterministic, non-diagnostic)
    parsed = parse_transcript_to_soap(full_transcript)

    soap_fields = dict(
        subjective=parsed.subjective,
        objective=parsed.objective,
        assessment=parsed.assessment,
        plan=parsed.plan,
        raw_transcript=full_transcript,
    )

    if existing:
        update_soap_note_content(note_id=existing["id"], **soap_fields)
    else:
        result = insert_soap_note(
            appointment_id=request.appointment_id,
            doctor_id=doctor_id,
            **soap_fields,
        )
        if not result or not result.get("id"):
            raise HTTPException(status_code=500, detail="Failed to persist SOAP draft.")

    return TranscriptChunkResponse(
        appointment_id=request.appointment_id,
        transcript_so_far=full_transcript,
        soap_draft=SOAPNote(
            subjective=parsed.subjective,
            objective=parsed.objective,
            assessment=parsed.assessment,
            plan=parsed.plan,
        ),
        is_updated=True,
    )


@router.post(
    "/generate",
    response_model=SOAPNote,
    dependencies=[Depends(require_role("doctor"))],
)
async def generate_soap_note(request: ConsultationTranscript):
    """
    Doctor-only route.
    Parses a complete transcript via Person 3 and returns a draft SOAP note.
    """
    if not request.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty.")

    parsed = parse_transcript_to_soap(request.transcript)

    return SOAPNote(
        subjective=parsed.subjective,
        objective=parsed.objective,
        assessment=parsed.assessment,
        plan=parsed.plan,
    )


@router.patch("/approve", dependencies=[Depends(require_role("doctor"))])
async def approve_soap_note_route(
    request: SOAPApprovalRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Doctor-only route.
    Persists the final edited SOAP note (insert if first save, update if draft exists),
    then marks it approved. Returns note_id for downstream FHIR export.
    """
    doctor_user_id = current_user["user_id"]
    note = request.edited_note

    # Resolve users.id -> doctors.id (auto-creates profile if needed)
    doctor = get_or_create_doctor_profile(doctor_user_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found for current user.")
    doctor_id = doctor["id"]

    existing = get_soap_note_by_appointment(request.appointment_id)

    if existing:
        note_id = existing["id"]
        update_soap_note_content(
            note_id=note_id,
            subjective=note.subjective,
            objective=note.objective,
            assessment=note.assessment,
            plan=note.plan,
            raw_transcript=existing.get("raw_transcript", ""),
        )
    else:
        result = insert_soap_note(
            appointment_id=request.appointment_id,
            doctor_id=doctor_id,
            subjective=note.subjective,
            objective=note.objective,
            assessment=note.assessment,
            plan=note.plan,
            raw_transcript="",
        )
        note_id = result.get("id") if result else None
        if not note_id:
            raise HTTPException(status_code=500, detail="Failed to persist SOAP note.")

    approved = approve_soap_note(note_id)

    return {
        "status": "success",
        "message": f"SOAP note for appointment {request.appointment_id} has been approved.",
        "record_status": "APPROVED",
        "note_id": note_id,
        "approved_at": approved.get("approved_at"),
    }


@router.get(
    "/{appointment_id}/document/download",
    dependencies=[Depends(require_role("doctor"))],
)
async def download_soap_document(
    appointment_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Download the generated SOAP note as a PDF document.
    """
    _require_doctor_appointment_access(current_user, appointment_id)
    soap_row = get_soap_note_by_appointment(appointment_id)
    if not soap_row:
        raise HTTPException(status_code=404, detail="SOAP note not found for this appointment.")

    pdf_bytes = render_soap_note_pdf_bytes(
        CoreSoapNote(
            subjective=soap_row.get("subjective", ""),
            objective=soap_row.get("objective", ""),
            assessment=soap_row.get("assessment", ""),
            plan=soap_row.get("plan", ""),
        )
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="soap-{appointment_id}.pdf"'},
    )


@router.post(
    "/{appointment_id}/document/reupload",
    dependencies=[Depends(require_role("doctor"))],
)
async def reupload_soap_document(
    appointment_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Accept an updated SOAP document from downstream systems and append it to
    the note transcript for audit visibility.
    """
    _require_doctor_appointment_access(current_user, appointment_id)
    soap_row = get_soap_note_by_appointment(appointment_id)
    if not soap_row:
        raise HTTPException(status_code=404, detail="SOAP note not found for this appointment.")

    payload = await file.read()
    if not payload:
        raise HTTPException(status_code=400, detail="Uploaded document is empty.")

    if len(payload) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Uploaded document exceeds 5 MB limit.")

    audit_line = f"[Reuploaded document received: {file.filename or 'document'} | bytes={len(payload)}]"
    update_soap_note_content(
        note_id=soap_row["id"],
        subjective=soap_row.get("subjective", ""),
        objective=soap_row.get("objective", ""),
        assessment=soap_row.get("assessment", ""),
        plan=soap_row.get("plan", ""),
        raw_transcript=f"{soap_row.get('raw_transcript', '')}\n{audit_line}".strip(),
    )
    return {"status": "success", "message": "Updated SOAP document received and linked to this appointment."}


@router.post(
    "/{appointment_id}/document/email",
    dependencies=[Depends(require_role("doctor"))],
)
async def email_soap_document(
    appointment_id: str,
    target_email: str = Form(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Simulated email handoff for multi-system workflows.
    """
    _require_doctor_appointment_access(current_user, appointment_id)
    soap_row = get_soap_note_by_appointment(appointment_id)
    if not soap_row:
        raise HTTPException(status_code=404, detail="SOAP note not found for this appointment.")
    if "@" not in target_email:
        raise HTTPException(status_code=422, detail="target_email must be a valid email address.")

    return {
        "status": "queued_simulated",
        "appointment_id": appointment_id,
        "target_email": target_email,
        "message": "SOAP document handoff queued to external system (simulated).",
    }
