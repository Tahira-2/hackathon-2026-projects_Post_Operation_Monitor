import time

from fastapi import APIRouter

from app.ai.client import get_gemini_model, get_groq_client
from app.services.fhir_client import search_patients

router = APIRouter()


@router.get("/health")
async def system_health() -> dict:
    """
    Lightweight runtime health checks for dashboard telemetry.
    """
    fhir_start = time.perf_counter()
    fhir_ok = True
    fhir_error = ""
    try:
        await search_patients(name="", count=1)
    except Exception as exc:
        fhir_ok = False
        fhir_error = str(exc)
    fhir_latency_ms = int((time.perf_counter() - fhir_start) * 1000)

    gemini_ready = get_gemini_model() is not None
    groq_ready = get_groq_client() is not None

    return {
        "backend": {"status": "ok"},
        "fhir": {
            "status": "ok" if fhir_ok else "down",
            "latency_ms": fhir_latency_ms,
            "error": fhir_error,
        },
        "llm": {
            "gemini_ready": gemini_ready,
            "groq_ready": groq_ready,
            "status": "ok" if gemini_ready or groq_ready else "degraded",
        },
    }
