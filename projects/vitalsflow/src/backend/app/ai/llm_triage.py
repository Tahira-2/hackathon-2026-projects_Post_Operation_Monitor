"""
LLM Triage Agent with multi-provider fallback.

Design rules:
- score_patient() NEVER raises - always returns a TriageOutput
- Provider order: Gemini -> Groq Llama 3.3 70B -> safe static fallback
- Temperature 0.1 for minimal clinical variance
- Strips markdown fences before JSON parsing
"""

# Standard library
import json
import logging
import re

# Internal
from app.ai.client import get_gemini_model, get_groq_client
from app.core.config import settings
from app.ai.prompts import build_triage_system_prompt, build_triage_user_message
from app.schemas.triage import TriageOutput, VitalsInput

logger = logging.getLogger(__name__)

# Safe fallback returned when all providers fail
_FALLBACK = TriageOutput(
    risk_score=0,
    news2_score=0,
    triage_tier="unknown",
    justification="Analysis unavailable. Manual assessment required.",
    suggested_actions=["Manual clinical assessment required"],
    subscores=None,
    missing_parameters=[],
    data_confidence="insufficient",
)


async def score_patient(clinical_summary: str, vitals: VitalsInput) -> TriageOutput:
    """
    Call configured providers to produce a TriageOutput for the given patient.

    Returns the safe _FALLBACK on ANY exception — callers never need to catch.
    """
    system_prompt = build_triage_system_prompt()
    user_message = build_triage_user_message(clinical_summary, vitals)
    prompt = f"{system_prompt}\n\n{user_message}"

    # 1) Gemini primary
    raw_text = _call_gemini(prompt)
    if raw_text:
        parsed = _parse_raw_output(raw_text)
        if parsed is not None:
            return parsed

    # 2) Groq fallback (Llama 3.3 70B by default)
    raw_text = _call_groq(system_prompt, user_message)
    if raw_text:
        parsed = _parse_raw_output(raw_text)
        if parsed is not None:
            return parsed

    logger.warning("All LLM providers failed - using safe static fallback")
    return _FALLBACK


def _call_gemini(prompt: str) -> str:
    """Return Gemini raw text, or an empty string if unavailable/failed."""
    model = get_gemini_model()
    if model is None:
        logger.info("Gemini client unavailable (missing key or init) - skipping")
        return ""

    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.1,
                "max_output_tokens": 512,
            },
        )
        return (response.text or "").strip()
    except Exception as exc:
        logger.warning("Gemini API call failed: %s", exc)
        return ""


def _call_groq(system_prompt: str, user_message: str) -> str:
    """Return Groq raw text, or an empty string if unavailable/failed."""
    client = get_groq_client()
    if client is None:
        logger.info("Groq client unavailable (missing key/package) - skipping")
        return ""

    try:
        completion = client.chat.completions.create(
            model=settings.groq_model,
            temperature=0.1,
            max_tokens=512,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
        )
        message = completion.choices[0].message
        content = message.content
        if isinstance(content, str):
            return content.strip()
        return ""
    except Exception as exc:
        logger.warning("Groq API call failed: %s", exc)
        return ""


def _parse_raw_output(raw_text: str) -> TriageOutput | None:
    """Parse an LLM JSON payload into TriageOutput, else return None."""
    if not raw_text:
        return None

    try:
        clean = _strip_fences(raw_text)
        data = json.loads(clean)
        return _parse_triage_output(data)
    except Exception as exc:
        logger.warning("LLM output parsing failed: %s | raw: %.200s", exc, raw_text)
        return None


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _strip_fences(text: str) -> str:
    """Remove ```json ... ``` markdown fences if present."""
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned.strip())
    return cleaned.strip()


def _parse_triage_output(data: dict) -> TriageOutput:
    """
    Convert the raw LLM JSON dict into a TriageOutput.
    Clamps risk_score to [0, 10] for safety.
    """
    risk_score = max(0, min(10, int(data.get("risk_score", 0))))
    news2_score = max(0, int(data.get("news2_score", 0)))
    raw_tier = str(data.get("triage_tier", "unknown")).lower()

    # Normalise tier — LLM might return "high" but we expose 3 tiers
    triage_tier = raw_tier if raw_tier in {"critical", "urgent", "routine"} else "unknown"

    justification = str(data.get("justification", "")).strip() or _FALLBACK.justification
    actions = data.get("suggested_actions", [])
    if not isinstance(actions, list) or not actions:
        actions = _FALLBACK.suggested_actions

    return TriageOutput(
        risk_score=risk_score,
        news2_score=news2_score,
        triage_tier=triage_tier,  # type: ignore[arg-type]
        justification=justification,
        suggested_actions=[str(a) for a in actions],
        subscores=None,          # enriched by triage_service after deterministic pass
        missing_parameters=[],
        data_confidence="complete",
    )

