from agent.state import HealthState
from typing import Optional

sessions: dict[str, dict] = {}

def get_session(session_id: str) -> dict:
    if session_id not in sessions:
        sessions[session_id] = HealthState(
            messages=[],
            topic='',
            keywords=[],
            confidence=0.0,
            questions_asked=0,
            fitness_approved=False,
            fitness_data={},
            retrieved_context=[],
            is_serious=False,
            is_greeting=False,
            recommended_specialization='',
            final_response='',
            current_options=[]
        )
    return sessions[session_id]

def save_session(session_id: str, state: dict):
    sessions[session_id] = state

def delete_session(session_id: str):
    if session_id in sessions:
        del sessions[session_id]

def list_sessions() -> list[str]:
    return list(sessions.keys())
