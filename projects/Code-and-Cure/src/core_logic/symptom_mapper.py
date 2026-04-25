"""Symptom-to-specialty mapping."""

from src.core_logic.models import SpecialtyRecommendation
from src.core_logic.models import SymptomInput

DEFAULT_TRIAGE_RULES: dict[str, dict[str, tuple[str, ...]]] = {
    "General Practice": {
        "department": ("Navigation",),
        "cues": (
            "headache",
            "cold",
            "cough",
            "fever",
            "runny nose",
            "sore throat",
            "congestion",
            "body ache",
            "fatigue",
        ),
    },
    "Dermatology": {
        "department": ("Navigation",),
        "cues": (
            "rash",
            "rashes",
            "itch",
            "itchy skin",
            "hives",
            "eczema",
            "skin irritation",
            "red patches",
        ),
    },
    "Gastroenterology": {
        "department": ("Navigation",),
        "cues": (
            "stomach pain",
            "abdominal pain",
            "diarrhea",
            "diarrhoea",
            "vomiting",
            "nausea",
            "bloating",
            "indigestion",
        ),
    },
    "Nephrology": {
        "department": ("Navigation",),
        "cues": (
            "kidney pain",
            "flank pain",
            "painful urination",
            "burning urination",
            "blood in urine",
            "frequent urination",
            "urinary pain",
        ),
    },
    "Neurology": {
        "department": ("Navigation",),
        "cues": (
            "migraine",
            "aura",
            "persistent headache",
            "dizziness",
            "numbness",
        ),
    },
}

DEFAULT_FALLBACK_SPECIALTY = "General Practice"
DEFAULT_FALLBACK_DEPARTMENT = "Navigation"


def _normalize_symptom(raw_symptom: str) -> str:
    """Normalize symptom text for stable dictionary lookups."""
    return " ".join(raw_symptom.strip().lower().split())


def map_symptom_to_specialty(
    symptom_input: SymptomInput,
    triage_rules: dict[str, dict[str, tuple[str, ...]]] | None = None,
    fallback_specialty: str = DEFAULT_FALLBACK_SPECIALTY,
    fallback_department: str = DEFAULT_FALLBACK_DEPARTMENT,
) -> SpecialtyRecommendation:
    """Map symptom text to specialty + department recommendation.

    Args:
        symptom_input: Structured symptom input contract.
        triage_rules: Optional injected cue-based rules by specialty.
        fallback_specialty: Returned when symptom key is not found.
        fallback_department: Department for fallback recommendations.
    """
    normalized = _normalize_symptom(symptom_input.symptom)
    active_rules = triage_rules or DEFAULT_TRIAGE_RULES

    best_specialty = fallback_specialty
    best_department = fallback_department
    best_matched_cues: list[str] = []
    best_score = 0

    for specialty, rule in active_rules.items():
        cues = rule.get("cues", ())
        matched = [cue for cue in cues if cue in normalized]
        score = len(matched)
        if score > best_score:
            best_score = score
            best_specialty = specialty
            best_department = rule.get("department", (fallback_department,))[0]
            best_matched_cues = matched

    if best_score > 0:
        rationale = (
            "Recommendation based on matched symptom cues in free-text triage input."
        )
        confidence = min(0.95, 0.5 + (0.1 * best_score))
    else:
        rationale = "No rule cues matched; used fallback routing."
        confidence = 0.4

    return SpecialtyRecommendation(
        specialty=best_specialty,
        department=best_department,
        rationale=rationale,
        source_symptom=normalized,
        matched_cues=best_matched_cues,
        confidence=round(confidence, 2),
    )

