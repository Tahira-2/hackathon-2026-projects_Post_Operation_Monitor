from __future__ import annotations

from .models import LLMRecommendationPayload, RecommendationCard


SAFETY_NOTE = "This is a wellness recommendation, not a medical diagnosis."
_UNSAFE_TERMS = (
    "diagnose",
    "diagnosis",
    "prescribe",
    "medication",
    "medicine",
    "treatment",
    "emergency",
)


def _contains_unsafe_language(text: str) -> bool:
    lowered = text.lower()
    return any(term in lowered for term in _UNSAFE_TERMS)


def _safe_card(card: RecommendationCard) -> RecommendationCard:
    if not _contains_unsafe_language(f"{card.title} {card.detail}"):
        return card

    return RecommendationCard(
        title="Use a support checkpoint",
        detail="Consider checking in with a supervisor, trusted peer, or available workplace wellness resource if this pattern continues.",
        category="support",
        priority=card.priority,
    )


def apply_safety_filters(payload: LLMRecommendationPayload) -> LLMRecommendationPayload:
    summary = payload.summary
    if _contains_unsafe_language(summary):
        summary = "Your burnout risk reflects the provided work and recovery signals, with wellness steps suggested below."

    cards = [_safe_card(card) for card in payload.recommendations]
    safety_note = payload.safety_note if not _contains_unsafe_language(payload.safety_note) else SAFETY_NOTE

    if "wellness recommendation" not in safety_note.lower():
        safety_note = SAFETY_NOTE

    return LLMRecommendationPayload(summary=summary, recommendations=cards, safety_note=safety_note)

