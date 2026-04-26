"""Red-flag escalation helpers for symptom triage."""

from src.core_logic.models import EscalationResult

RED_FLAG_CUES: dict[str, tuple[str, ...]] = {
    "respiratory_distress": (
        "shortness of breath",
        "cannot breathe",
        "difficulty breathing",
        "chest pain",
        "can't breathe",
    ),
    "severe_abdominal_warning": (
        "severe abdominal pain",
        "blood in stool",
        "vomiting blood",
        "black stool",
        "rigid abdomen",
    ),
    "neurologic_acute_warning": (
        "sudden weakness",
        "slurred speech",
        "face drooping",
        "loss of consciousness",
    ),
}


def detect_red_flag_escalation(symptom_text: str) -> EscalationResult:
    """Return non-diagnostic escalation hints from free-text symptoms."""
    normalized = " ".join(symptom_text.lower().strip().split())
    matched: list[str] = []

    for cues in RED_FLAG_CUES.values():
        matched.extend(cue for cue in cues if cue in normalized)

    if matched:
        return EscalationResult(
            escalation_required=True,
            escalation_reason=(
                "Urgent symptom cues detected. Route for immediate clinical review."
            ),
            matched_red_flags=sorted(set(matched)),
        )

    return EscalationResult(
        escalation_required=False,
        escalation_reason="No urgent red-flag cues detected in symptom text.",
        matched_red_flags=[],
    )
