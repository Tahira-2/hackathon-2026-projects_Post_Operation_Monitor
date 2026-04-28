"""LLM clients for Gemini and Groq, both with lazy initialization."""

import google.generativeai as genai
from typing import Any
import logging

try:
    from groq import Groq
except Exception:  # pragma: no cover - optional dependency at runtime
    Groq = None  # type: ignore[assignment]

from app.core.config import settings

logger = logging.getLogger(__name__)

_model: genai.GenerativeModel | None = None
_groq_client: Any | None = None


def get_gemini_model() -> genai.GenerativeModel | None:
    """Return a cached Gemini model, or None if no API key is configured."""
    global _model
    if _model is not None:
        return _model
    if not settings.gemini_api_key:
        return None
    genai.configure(api_key=settings.gemini_api_key)
    _model = genai.GenerativeModel(settings.gemini_model)
    return _model


def get_groq_client() -> Any | None:
    """Return a cached Groq client, or None if unavailable."""
    global _groq_client
    if _groq_client is not None:
        return _groq_client
    if not settings.groq_api_key or Groq is None:
        return None
    try:
        _groq_client = Groq(api_key=settings.groq_api_key)
        return _groq_client
    except Exception as exc:
        logger.warning("Failed to initialize Groq client: %s", exc)
        return None
