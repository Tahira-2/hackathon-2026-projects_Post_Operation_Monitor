from fastapi import APIRouter, Depends
from src.api.models import SymptomRequest, TriageResponse
from src.api.dependencies import require_role
from src.core_logic.symptom_mapper import map_symptom_to_specialty
from src.core_logic import detect_red_flag_escalation, SymptomInput

router = APIRouter()


@router.post("/analyze", response_model=TriageResponse, dependencies=[Depends(require_role("patient"))])
async def analyze_symptoms(request: SymptomRequest):
    """
    AI Care Navigator Route.
    Validates the HTTP request, then delegates to Person 3 core logic.
    """
    # Combine primary symptom text with any additional red-flag context
    check_text = request.symptoms
    if request.red_flag_context:
        check_text = f"{request.symptoms} {request.red_flag_context}"

    # 1. Escalation check runs first (Person 3: detect_red_flag_escalation)
    escalation = detect_red_flag_escalation(check_text)
    if escalation.escalation_required:
        return TriageResponse(
            recommended_specialty="Emergency Medicine",
            department="Navigation",
            rationale=escalation.escalation_reason,
            extracted_symptom_cues=escalation.matched_red_flags,
            confidence=0.99,
        )

    # 2. Specialty mapping (Person 3: map_symptom_to_specialty)
    result = map_symptom_to_specialty(SymptomInput(symptom=request.symptoms))

    return TriageResponse(
        recommended_specialty=result.specialty,
        department=result.department,
        rationale=result.rationale,
        extracted_symptom_cues=result.matched_cues,
        confidence=result.confidence,
    )
