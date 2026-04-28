"""ASR/translation provider abstraction with graceful fallback.

Priority order:
  1. If ASR_PROVIDER env var + ASR_API_KEY are set → real ASR path (future).
  2. Otherwise → FallbackTextProvider: treats input text as pre-transcribed.

This ensures Mode B (manual text feed) always works without API keys and
the mode switch is a single env-var change when a real provider is wired.
"""

import os
from typing import Protocol, runtime_checkable


@runtime_checkable
class TranscriptionProvider(Protocol):
    """Minimal provider interface for any ASR/translation backend."""

    @property
    def mode(self) -> str:
        """'asr' if a real provider is active, 'fallback' for manual text mode."""
        ...

    def process_chunk(
        self,
        text_or_audio: str,
        source_language: str = "en",
        target_language: str = "en",
    ) -> tuple[str, str]:
        """
        Process an input chunk.

        Args:
            text_or_audio: Pre-transcribed text (fallback) or audio reference (ASR).
            source_language: ISO-639-1 source language code.
            target_language: ISO-639-1 target language code.

        Returns:
            (transcript_text, provider_status)

        provider_status values:
            "processed"              — ASR provider returned a result.
            "fallback_mode"          — No ASR provider; input returned as-is.
            "error:<message>"        — Provider failed; caller should handle.
        """
        ...


class FallbackTextProvider:
    """Pass-through provider: treats the input string as pre-transcribed text.

    Used when no ASR API keys are configured. The doctor pastes or types
    transcript text directly; it flows into the same downstream SOAP pipeline.
    """

    @property
    def mode(self) -> str:
        return "fallback"

    def process_chunk(
        self,
        text_or_audio: str,
        source_language: str = "en",
        target_language: str = "en",
    ) -> tuple[str, str]:
        return text_or_audio.strip(), "fallback_mode"


# ---------------------------------------------------------------------------
# Placeholder for future real ASR provider
# ---------------------------------------------------------------------------

class _StubASRProvider:
    """Stub that signals ASR_PROVIDER is configured but implementation is pending.

    Returns TRANSCRIPTION_PROVIDER_UNAVAILABLE so callers degrade gracefully
    rather than silently losing audio chunks.
    """

    def __init__(self, provider_name: str) -> None:
        self._name = provider_name

    @property
    def mode(self) -> str:
        return "asr_stub"

    def process_chunk(
        self,
        text_or_audio: str,
        source_language: str = "en",
        target_language: str = "en",
    ) -> tuple[str, str]:
        # Return empty text + structured error; API layer will degrade to fallback.
        return "", f"error:TRANSCRIPTION_PROVIDER_UNAVAILABLE:{self._name}_not_yet_integrated"


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

def build_provider() -> TranscriptionProvider:
    """Return the best available transcription provider.

    Reads env vars:
        ASR_PROVIDER  — e.g. "deepgram", "whisper", "azure"
        ASR_API_KEY   — provider-specific API key

    If both are present → _StubASRProvider (real integration deferred post-hackathon).
    Otherwise → FallbackTextProvider.
    """
    provider_name = os.getenv("ASR_PROVIDER", "").lower().strip()
    api_key = os.getenv("ASR_API_KEY", "").strip()

    if provider_name and api_key:
        return _StubASRProvider(provider_name)

    return FallbackTextProvider()
