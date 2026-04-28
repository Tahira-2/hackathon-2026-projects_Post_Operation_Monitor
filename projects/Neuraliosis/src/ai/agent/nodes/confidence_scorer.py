import logging
from agent.state import HealthState

logger = logging.getLogger(__name__)

def confidence_scorer(state: HealthState) -> dict:
    # If it is a greeting with no symptoms, skip scoring
    if state.get("is_greeting", False):
        return {"confidence": 0.0}

    # If no keywords extracted yet, no point scoring
    if not state.get("keywords"):
        return {"confidence": 0.0}

    messages_text = " ".join(msg.get("content", "") for msg in state.get("messages", [])).lower()
    keywords_text = " ".join(state.get("keywords", [])).lower()
    full_text = f"{messages_text} {keywords_text}"
    
    score = 0.0
    
    groups = [
        (["when", "start", "began", "since", "ago", "long"], 0.20),
        (["severe", "mild", "moderate", "scale", "bad", "pain", "rate"], 0.20),
        (["exercise", "walk", "workout", "rest", "active", "sitting"], 0.15),
        (["constant", "comes and goes", "always", "sometimes", "hours"], 0.15),
        (["chest", "head", "stomach", "arm", "leg", "back", "side"], 0.15),
        (["condition", "medication", "doctor", "diagnosed", "history"], 0.10)
    ]
    
    for keywords, points in groups:
        if any(kw in full_text for kw in keywords):
            score += points
            
    score = min(max(score, 0.0), 1.0)
    logger.info(f"Confidence score: {score}")
    
    return {"confidence": score}
