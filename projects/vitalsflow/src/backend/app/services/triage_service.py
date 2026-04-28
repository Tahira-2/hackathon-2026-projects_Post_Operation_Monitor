"""
Triage orchestration service.

Workflow for run_triage():
  1. Fetch Patient, Conditions, Observations from HAPI FHIR
  2. Normalize → compact Clinical Summary string
  3. Run deterministic NEWS2 engine (always succeeds — no LLM dependency)
  4. Call Gemini via score_patient (never raises — fallback on error)
  5. Merge: use LLM's justification/actions, deterministic subscores/score
  6. Return enriched TriageOutput
"""

# Standard library
import logging

# Internal
from app.ai.llm_triage import score_patient
from app.core.config import settings
from app.schemas.triage import TriageOutput, VitalsInput
from app.services.fhir_client import get_conditions, get_observations, get_patient
from app.services.news2 import calculate_news2
from app.services.normalizer import normalize_patient
from app.utils.fhir import Vitals

logger = logging.getLogger(__name__)


async def run_triage(patient_id: str, vitals: VitalsInput) -> TriageOutput:
    """
    Full triage pipeline for a patient.

    Raises RuntimeError if FHIR fetch fails (router converts to 500).
    Never raises from the LLM step — always returns a TriageOutput.
    """
    # --- Step 1: Fetch FHIR data ---
    patient = await get_patient(patient_id)  # raises on 404/error
    conditions = await get_conditions(patient_id)   # returns [] on error
    observations = await get_observations(patient_id)  # returns [] on error

    # --- Step 2: Normalize ---
    clinical_summary = normalize_patient(patient, conditions, observations)
    logger.info("Clinical summary for %s: %s", patient_id, clinical_summary[:100])

    # --- Step 3: Deterministic NEWS2 from VitalsInput ---
    det_vitals = _vitals_input_to_fhir_vitals(vitals)
    det_result = calculate_news2(det_vitals)
    det = det_result.news2

    # --- Step 4: LLM reasoning (never raises) ---
    llm_output: TriageOutput
    if settings.use_llm and settings.gemini_api_key:
        llm_output = await score_patient(clinical_summary, vitals)
        logger.info(
            "LLM triage: tier=%s risk=%s news2=%s",
            llm_output.triage_tier,
            llm_output.risk_score,
            llm_output.news2_score,
        )
    else:
        # No LLM — build a minimal TriageOutput from deterministic result
        llm_output = _det_to_triage_output(det)

    # --- Step 5: Enrich with deterministic data ---
    # Use deterministic score as the authoritative NEWS2 number when available
    authoritative_news2 = det.score if det.score is not None else llm_output.news2_score
    authoritative_tier = _tier_from_det(det) if det.score is not None else llm_output.triage_tier

    return TriageOutput(
        # From LLM (better natural-language quality)
        risk_score=llm_output.risk_score,
        justification=llm_output.justification,
        suggested_actions=llm_output.suggested_actions,
        # Authoritative deterministic values
        news2_score=authoritative_news2,
        triage_tier=authoritative_tier,  # type: ignore[arg-type]
        # Rich bonus fields from deterministic engine
        subscores=det.subscores,
        missing_parameters=list(det.missing_parameters),
        data_confidence=det.data_confidence,
    )


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _vitals_input_to_fhir_vitals(v: VitalsInput) -> Vitals:
    """
    Bridge from the API-contract VitalsInput to the internal Vitals dataclass
    expected by the deterministic NEWS2 engine.
    """
    return Vitals(
        respiratory_rate=float(v.respiratory_rate),
        spo2=float(v.spo2),
        supplemental_o2=v.on_supplemental_o2,
        systolic_bp=float(v.systolic_bp),
        heart_rate=float(v.heart_rate),
        consciousness=v.consciousness,
        temperature=float(v.temperature),
        hypercapnic_rf=False,  # not exposed in VitalsInput; default safe
    )


def _tier_from_det(det) -> str:
    """Map deterministic NEWS2 risk string to the 3-tier frontend enum."""
    mapping = {
        "critical": "critical",
        "high": "critical",
        "medium": "urgent",
        "low_medium": "urgent",
        "low": "routine",
        "insufficient_data": "unknown",
    }
    return mapping.get(det.risk, "unknown")


def _det_to_triage_output(det) -> TriageOutput:
    """Fallback TriageOutput built purely from deterministic NEWS2 result."""
    tier = _tier_from_det(det)
    score = det.score or 0
    # Simple risk_score mapping: NEWS2/2 clamped to 1-10
    risk_score = max(1, min(10, round(score / 2))) if score else 0

    return TriageOutput(
        risk_score=risk_score,
        news2_score=score,
        triage_tier=tier,  # type: ignore[arg-type]
        justification=det.reason,
        suggested_actions=det.actions,
        subscores=det.subscores,
        missing_parameters=list(det.missing_parameters),
        data_confidence=det.data_confidence,
    )

