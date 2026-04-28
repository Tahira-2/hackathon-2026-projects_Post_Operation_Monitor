"""Tests for real-time consultation session streaming pipeline."""

import pytest
from datetime import datetime, timezone

from src.core_logic.stream_session import (
    ConsultationSession,
    SoapDraftWithMeta,
    merge_transcript_chunk,
    normalize_transcript,
    update_session_with_chunk,
    finalize_session,
    soap_to_core_note,
)
from src.core_logic.asr_provider import (
    FallbackTextProvider,
    build_provider,
)


# ---------------------------------------------------------------------------
# normalize_transcript
# ---------------------------------------------------------------------------

def test_normalize_collapses_whitespace():
    assert normalize_transcript("  hello   world  ") == "hello world"


def test_normalize_empty_string():
    assert normalize_transcript("") == ""


def test_normalize_newlines_and_tabs():
    assert normalize_transcript("hello\n\tworld\n") == "hello world"


# ---------------------------------------------------------------------------
# merge_transcript_chunk
# ---------------------------------------------------------------------------

def test_merge_appends_with_space():
    result = merge_transcript_chunk("Hello.", "World.")
    assert result == "Hello. World."


def test_merge_handles_empty_existing():
    result = merge_transcript_chunk("", "First chunk.")
    assert result == "First chunk."


def test_merge_handles_empty_chunk():
    result = merge_transcript_chunk("Existing text.", "")
    assert result == "Existing text."


def test_merge_collapses_internal_whitespace():
    result = merge_transcript_chunk("  Hello   ", "  World  ")
    assert result == "Hello World"


# ---------------------------------------------------------------------------
# update_session_with_chunk — happy path
# ---------------------------------------------------------------------------

def _make_session(appointment_id="appt-001") -> ConsultationSession:
    return ConsultationSession(
        session_id="sess-001",
        appointment_id=appointment_id,
        created_at=datetime.now(timezone.utc).isoformat(),
        updated_at=datetime.now(timezone.utc).isoformat(),
    )


def test_first_chunk_creates_draft():
    session = _make_session()
    draft = update_session_with_chunk(session, chunk_index=0, transcript_chunk="Patient reports headache.")

    assert isinstance(draft, SoapDraftWithMeta)
    assert session.transcript == "Patient reports headache."
    assert session.last_chunk_index == 0
    assert 0 in session.seen_chunk_indexes
    assert draft.derived_from_transcript is True
    assert draft.transcript_chars_processed > 0
    assert draft.chunk_index == 0


def test_second_chunk_appends_transcript():
    session = _make_session()
    update_session_with_chunk(session, 0, "Subjective: Patient has cough.")
    draft = update_session_with_chunk(session, 1, "Objective: No fever.")

    assert "cough" in session.transcript
    assert "No fever" in session.transcript
    assert session.last_chunk_index == 1
    assert draft.chunk_index == 1


def test_change_summary_reflects_update():
    session = _make_session()
    update_session_with_chunk(session, 0, "Subjective: Headache.")
    draft = update_session_with_chunk(session, 1, "Objective: Blood pressure 130/80.")

    assert "Initial" in session.soap_draft.change_summary or \
           draft.change_summary != ""  # non-empty on any update


def test_metadata_update_timestamp_is_set():
    session = _make_session()
    draft = update_session_with_chunk(session, 0, "Patient reports fatigue.")
    assert draft.update_timestamp != ""
    # Should parse as a valid ISO datetime
    datetime.fromisoformat(draft.update_timestamp.replace("Z", "+00:00"))


# ---------------------------------------------------------------------------
# update_session_with_chunk — idempotency
# ---------------------------------------------------------------------------

def test_duplicate_chunk_index_is_idempotent():
    session = _make_session()
    draft1 = update_session_with_chunk(session, 0, "First chunk.")
    draft2 = update_session_with_chunk(session, 0, "First chunk.")  # repeat

    # Second call must not re-process or change state
    assert session.last_chunk_index == 0
    assert session.transcript == "First chunk."
    assert draft1.transcript_chars_processed == draft2.transcript_chars_processed


def test_duplicate_chunk_different_text_still_idempotent():
    session = _make_session()
    update_session_with_chunk(session, 0, "Original text.")
    # Attempt to re-send index 0 with different text — must be ignored
    update_session_with_chunk(session, 0, "Tampered text.")

    assert session.transcript == "Original text."


# ---------------------------------------------------------------------------
# update_session_with_chunk — ordering
# ---------------------------------------------------------------------------

def test_out_of_order_chunk_raises():
    session = _make_session()
    update_session_with_chunk(session, 0, "First.")

    with pytest.raises(ValueError, match="CHUNK_OUT_OF_ORDER"):
        update_session_with_chunk(session, 5, "Skipped ahead.")


def test_chunk_starting_at_non_zero_raises():
    session = _make_session()

    with pytest.raises(ValueError, match="CHUNK_OUT_OF_ORDER"):
        update_session_with_chunk(session, 1, "Should have been 0.")


def test_sequential_chunks_accepted():
    session = _make_session()
    for i in range(4):
        update_session_with_chunk(session, i, f"Chunk {i}.")
    assert session.last_chunk_index == 3
    assert {0, 1, 2, 3}.issubset(session.seen_chunk_indexes)


# ---------------------------------------------------------------------------
# update_session_with_chunk — finalized session
# ---------------------------------------------------------------------------

def test_chunk_on_finalized_session_raises():
    session = _make_session()
    update_session_with_chunk(session, 0, "First chunk.")
    finalize_session(session)

    with pytest.raises(ValueError, match="SESSION_ALREADY_FINALIZED"):
        update_session_with_chunk(session, 1, "Should fail.")


# ---------------------------------------------------------------------------
# SOAP quality hint
# ---------------------------------------------------------------------------

def test_quality_hint_minimal_for_single_short_chunk():
    session = _make_session()
    draft = update_session_with_chunk(session, 0, "Headache.")
    assert draft.quality_hint == "minimal"


def test_quality_hint_sufficient_for_full_soap_sections():
    transcript = (
        "Subjective: Patient reports persistent cough and mild fever for three days. "
        "Objective: Temperature 38.2C, oxygen saturation 97 percent, lungs clear. "
        "Assessment: Likely viral upper respiratory tract infection. "
        "Plan: Rest, hydration, acetaminophen 500mg q8h, follow up in 5 days."
    )
    session = _make_session()
    draft = update_session_with_chunk(session, 0, transcript)
    assert draft.quality_hint == "sufficient"


def test_quality_hint_partial_for_two_sections():
    transcript = "Subjective: Rash on arms. Plan: Apply hydrocortisone cream."
    session = _make_session()
    draft = update_session_with_chunk(session, 0, transcript)
    assert draft.quality_hint == "partial"


# ---------------------------------------------------------------------------
# finalize_session
# ---------------------------------------------------------------------------

def test_finalize_sets_status():
    session = _make_session()
    update_session_with_chunk(session, 0, "Subjective: Cough.")
    finalize_session(session)
    assert session.status == "finalized"


def test_finalize_preserves_transcript():
    session = _make_session()
    update_session_with_chunk(session, 0, "Some text.")
    finalize_session(session)
    assert session.transcript == "Some text."


# ---------------------------------------------------------------------------
# soap_to_core_note
# ---------------------------------------------------------------------------

def test_soap_to_core_note_converts_correctly():
    draft = SoapDraftWithMeta(
        subjective="S", objective="O", assessment="A", plan="P"
    )
    note = soap_to_core_note(draft)
    assert note.subjective == "S"
    assert note.objective == "O"
    assert note.assessment == "A"
    assert note.plan == "P"


# ---------------------------------------------------------------------------
# FallbackTextProvider
# ---------------------------------------------------------------------------

def test_fallback_provider_returns_input_as_is():
    provider = FallbackTextProvider()
    text, status = provider.process_chunk("Patient says hello.")
    assert text == "Patient says hello."
    assert status == "fallback_mode"


def test_fallback_provider_strips_whitespace():
    provider = FallbackTextProvider()
    text, _ = provider.process_chunk("  padded text  ")
    assert text == "padded text"


def test_fallback_provider_mode():
    provider = FallbackTextProvider()
    assert provider.mode == "fallback"


def test_build_provider_returns_fallback_without_env(monkeypatch):
    monkeypatch.delenv("ASR_PROVIDER", raising=False)
    monkeypatch.delenv("ASR_API_KEY", raising=False)
    provider = build_provider()
    assert provider.mode == "fallback"


def test_build_provider_returns_stub_with_env(monkeypatch):
    monkeypatch.setenv("ASR_PROVIDER", "deepgram")
    monkeypatch.setenv("ASR_API_KEY", "fake-key-123")
    provider = build_provider()
    # With keys set, stub is returned (real integration deferred)
    assert provider.mode == "asr_stub"
    _, status = provider.process_chunk("hello")
    assert status.startswith("error:TRANSCRIPTION_PROVIDER_UNAVAILABLE")


# ---------------------------------------------------------------------------
# Multi-chunk integration: transcript to SOAP
# ---------------------------------------------------------------------------

def test_incremental_chunks_build_complete_soap():
    session = _make_session()
    chunks = [
        "Subjective: Patient is a 35-year-old presenting with chest tightness.",
        "Objective: Blood pressure 150/95, heart rate 92 BPM, no acute distress.",
        "Assessment: Likely hypertensive urgency.",
        "Plan: Start amlodipine 5mg daily, restrict sodium, follow up in 2 weeks.",
    ]
    for i, chunk in enumerate(chunks):
        draft = update_session_with_chunk(session, i, chunk)

    assert "chest tightness" in draft.subjective or "chest tightness" in session.transcript
    assert draft.quality_hint == "sufficient"
    assert draft.transcript_chars_processed == len(session.transcript)
    assert draft.derived_from_transcript is True
