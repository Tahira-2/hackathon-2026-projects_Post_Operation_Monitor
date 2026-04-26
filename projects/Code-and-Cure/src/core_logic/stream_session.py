"""Real-time consultation session management.

Implements the transcript-to-SOAP streaming pipeline:
  idle → active → finalized

All state is pure Python; no HTTP or DB imports allowed here.
"""

import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Literal

from src.core_logic.models import SoapNote
from src.core_logic.soap_parser import parse_transcript_to_soap

SessionStatus = Literal["active", "finalized"]
QualityHint = Literal["minimal", "partial", "sufficient"]


@dataclass
class SoapDraftWithMeta:
    """SOAP draft annotated with provenance and quality metadata."""
    subjective: str
    objective: str
    assessment: str
    plan: str
    derived_from_transcript: bool = True
    transcript_chars_processed: int = 0
    update_timestamp: str = ""
    chunk_index: int = 0
    quality_hint: QualityHint = "minimal"
    change_summary: str = ""


@dataclass
class ConsultationSession:
    """Mutable in-memory representation of one consultation session."""
    session_id: str
    appointment_id: str
    status: SessionStatus = "active"
    transcript: str = ""
    last_chunk_index: int = -1
    seen_chunk_indexes: set = field(default_factory=set)
    soap_draft: SoapDraftWithMeta | None = None
    created_at: str = ""
    updated_at: str = ""
    provider_mode: str = "fallback"
    language: str = "en"


# ---------------------------------------------------------------------------
# Pure helper functions (no side effects, all testable)
# ---------------------------------------------------------------------------

def normalize_transcript(text: str) -> str:
    """Collapse runs of whitespace and strip edges."""
    return re.sub(r"\s+", " ", text).strip()


def merge_transcript_chunk(existing: str, chunk: str) -> str:
    """Append chunk to transcript with a single space separator."""
    existing = normalize_transcript(existing)
    chunk = normalize_transcript(chunk)
    if not existing:
        return chunk
    if not chunk:
        return existing
    return f"{existing} {chunk}"


def _quality_hint(note: SoapNote, transcript_len: int) -> QualityHint:
    filled = sum(
        1 for s in [note.subjective, note.objective, note.assessment, note.plan]
        if s.strip()
    )
    if filled == 4 and transcript_len > 200:
        return "sufficient"
    if filled >= 2:
        return "partial"
    return "minimal"


def _change_summary(prev: SoapDraftWithMeta | None, current: SoapNote) -> str:
    if prev is None:
        return "Initial SOAP draft created."
    changes = []
    if prev.subjective != current.subjective and current.subjective:
        changes.append("Subjective")
    if prev.objective != current.objective and current.objective:
        changes.append("Objective")
    if prev.assessment != current.assessment and current.assessment:
        changes.append("Assessment")
    if prev.plan != current.plan and current.plan:
        changes.append("Plan")
    return f"{', '.join(changes)} updated." if changes else "No change detected."


# ---------------------------------------------------------------------------
# Session lifecycle functions
# ---------------------------------------------------------------------------

def update_session_with_chunk(
    session: ConsultationSession,
    chunk_index: int,
    transcript_chunk: str,
) -> SoapDraftWithMeta:
    """
    Apply a new transcript chunk to a session.

    Returns the updated SoapDraftWithMeta.

    Raises:
      ValueError("SESSION_ALREADY_FINALIZED") if session is finalized.
      ValueError("CHUNK_OUT_OF_ORDER: ...") if chunk_index is not next in sequence.

    Idempotent: duplicate chunk_index returns current draft unchanged.
    """
    if session.status == "finalized":
        raise ValueError("SESSION_ALREADY_FINALIZED: Cannot add chunks to a finalized session.")

    # Idempotency: already processed → return current state
    if chunk_index in session.seen_chunk_indexes:
        if session.soap_draft:
            return session.soap_draft
        return _empty_draft(chunk_index)

    # Sequential guard
    expected = session.last_chunk_index + 1
    if chunk_index != expected:
        raise ValueError(
            f"CHUNK_OUT_OF_ORDER: Expected chunk index {expected}, got {chunk_index}."
        )

    new_transcript = merge_transcript_chunk(session.transcript, transcript_chunk)
    note = parse_transcript_to_soap(new_transcript)
    quality = _quality_hint(note, len(new_transcript))
    summary = _change_summary(session.soap_draft, note)
    now = datetime.now(timezone.utc).isoformat()

    draft = SoapDraftWithMeta(
        subjective=note.subjective,
        objective=note.objective,
        assessment=note.assessment,
        plan=note.plan,
        derived_from_transcript=True,
        transcript_chars_processed=len(new_transcript),
        update_timestamp=now,
        chunk_index=chunk_index,
        quality_hint=quality,
        change_summary=summary,
    )

    # Mutate session in place
    session.transcript = new_transcript
    session.last_chunk_index = chunk_index
    session.seen_chunk_indexes.add(chunk_index)
    session.soap_draft = draft
    session.updated_at = now

    return draft


def finalize_session(session: ConsultationSession) -> ConsultationSession:
    """Lock the session transcript. SOAP draft is ready for doctor approval."""
    session.status = "finalized"
    session.updated_at = datetime.now(timezone.utc).isoformat()
    return session


def soap_to_core_note(draft: SoapDraftWithMeta) -> SoapNote:
    """Convert a SoapDraftWithMeta back to the canonical SoapNote contract."""
    return SoapNote(
        subjective=draft.subjective,
        objective=draft.objective,
        assessment=draft.assessment,
        plan=draft.plan,
    )


def _empty_draft(chunk_index: int) -> SoapDraftWithMeta:
    return SoapDraftWithMeta(
        subjective="",
        objective="",
        assessment="",
        plan="",
        derived_from_transcript=True,
        transcript_chars_processed=0,
        update_timestamp=datetime.now(timezone.utc).isoformat(),
        chunk_index=chunk_index,
        quality_hint="minimal",
        change_summary="No transcript yet.",
    )
