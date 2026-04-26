from agent.state import HealthState
import logging

logger = logging.getLogger(__name__)

def fitness_permission(state: HealthState) -> dict:
    topic = state.get("topic", "general")
    fitness_approved = state.get("fitness_approved", False)
    
    if topic in ["fitness", "cardiac", "sleep"] and not fitness_approved:
        message_content = (
            "I notice your concern may be related to your physical activity or heart rate. "
            "Would you like me to check your fitness data (steps, heart rate, sleep) "
            "to give you a better answer? Reply yes or no."
        )
        updated_messages = state["messages"] + [{"role": "assistant", "content": message_content}]
        return {"messages": updated_messages}
        
    return {}
