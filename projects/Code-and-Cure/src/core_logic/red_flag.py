"""Red-flag escalation helpers for symptom triage."""

from src.core_logic.models import EscalationResult

RED_FLAG_CUES: dict[str, tuple[str, ...]] = {
    "cardiac_emergency": (
        "chest pain", "chest pressure", "crushing chest", "heart pain",
        "heart attack", "cardiac arrest", "heart stopped",
        "pain radiating to arm", "pain in left arm", "jaw pain with chest",
        "palpitations with fainting", "heart racing and dizzy",
    ),
    "respiratory_distress": (
        "shortness of breath", "cannot breathe", "can't breathe",
        "difficulty breathing", "not breathing", "choking",
        "lips turning blue", "oxygen dropping",
    ),
    "stroke_warning": (
        "sudden weakness", "slurred speech", "face drooping",
        "arm weakness", "sudden confusion", "sudden vision loss",
        "sudden severe headache", "worst headache of my life",
        "stroke", "i think i'm having a stroke",
    ),
    "severe_abdominal_warning": (
        "severe abdominal pain", "blood in stool", "vomiting blood",
        "black stool", "rigid abdomen",
    ),
    "loss_of_consciousness": (
        "loss of consciousness", "passed out", "unresponsive",
        "not waking up", "unconscious", "collapsed",
    ),
    "severe_allergic": (
        "anaphylaxis", "throat closing", "throat swelling",
        "epipen", "allergic reaction and can't breathe",
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
                "⚠️ These symptoms may indicate a life-threatening emergency. "
                "Call 911 (or your local emergency number) immediately. "
                "Do not wait — get emergency help right now."
            ),
            matched_red_flags=sorted(set(matched)),
        )

    return EscalationResult(
        escalation_required=False,
        escalation_reason="No urgent red-flag cues detected in symptom text.",
        matched_red_flags=[],
    )
