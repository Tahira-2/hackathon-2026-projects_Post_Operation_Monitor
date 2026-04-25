from fastapi import APIRouter
from src.api.models import SymptomRequest, TriageResponse

router = APIRouter()

# --- MOCK TRIAGE MAP ---
# Person 3 will replace this with their core_logic triage function.
# Each symptom maps to a full triage payload (not just a specialty).
MOCK_TRIAGE_MAP = {
    "headache":      {"specialty": "Neurology",         "department": "Navigation/Coordination", "confidence": 0.92},
    "chest pain":    {"specialty": "Cardiology",        "department": "Navigation/Coordination", "confidence": 0.95},
    "skin rash":     {"specialty": "Dermatology",       "department": "Navigation/Coordination", "confidence": 0.88},
    "back pain":     {"specialty": "Orthopedics",       "department": "Navigation/Coordination", "confidence": 0.85},
    "anxiety":       {"specialty": "Psychiatry",        "department": "Navigation/Coordination", "confidence": 0.90},
    "blurry vision": {"specialty": "Ophthalmology",     "department": "Navigation/Coordination", "confidence": 0.87},
    "toothache":     {"specialty": "Dentistry",         "department": "Navigation/Coordination", "confidence": 0.93},
    "stomach ache":  {"specialty": "Gastroenterology",  "department": "Navigation/Coordination", "confidence": 0.89},
}

@router.post("/analyze", response_model=TriageResponse)
async def analyze_symptoms(request: SymptomRequest):
    """
    AI Care Navigator: Accepts free-text symptom input and returns
    a structured triage payload with specialty, department, and rationale.

    Currently uses mock data. Will be wired to:
    from src.core_logic.triage_engine import run_triage
    """
    # Normalize free-text input for keyword matching
    symptom_text = request.symptoms.strip().lower()

    # Extract symptom cues from the free-text
    extracted_cues = [
        keyword for keyword in MOCK_TRIAGE_MAP.keys()
        if keyword in symptom_text
    ]

    # Red-flag escalation check
    if request.red_flag_context:
        return TriageResponse(
            recommended_specialty="Emergency Medicine",
            department="Clinical/Signer",
            rationale=f"Red flag detected: {request.red_flag_context}. Immediate escalation required.",
            extracted_symptom_cues=extracted_cues or [symptom_text],
            confidence=0.99
        )

    # Match the first recognized symptom
    for cue in extracted_cues:
        result = MOCK_TRIAGE_MAP[cue]
        return TriageResponse(
            recommended_specialty=result["specialty"],
            department=result["department"],
            rationale=f"Symptom '{cue}' suggests {result['specialty']} evaluation",
            extracted_symptom_cues=extracted_cues,
            confidence=result["confidence"]
        )

    # Fallback: no recognized symptoms
    return TriageResponse(
        recommended_specialty="General Practice",
        department="Navigation/Coordination",
        rationale="No specific symptom matched. Routing to General Practice for initial assessment.",
        extracted_symptom_cues=[symptom_text],
        confidence=0.50
    )
