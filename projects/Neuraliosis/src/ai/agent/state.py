from typing import TypedDict, Optional

class HealthState(TypedDict):
    messages: list[dict]        # [{role: user/assistant, content: str}]
    topic: str                  # fitness | cardiac | sleep | stress | nutrition | general
    keywords: list[str]         # all extracted symptom keywords
    confidence: float           # 0.0 to 1.0
    questions_asked: int        # max 4 follow-ups allowed
    fitness_approved: bool
    fitness_data: dict          # {heart_rate, steps, sleep_hours, last_workout}
    retrieved_context: list[str]
    is_serious: bool
    is_greeting: bool           # True if last message was greeting
    recommended_specialization: str
    final_response: str
    current_options: list[dict] # [{id: a|b|c|d, label: str, value: str}]
