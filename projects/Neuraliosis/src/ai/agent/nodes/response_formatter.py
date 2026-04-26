from pathlib import Path
from agent.state import HealthState
import logging

logger = logging.getLogger(__name__)

def response_formatter(state: HealthState) -> dict:
    final_response = state.get("final_response", "")
    
    if state.get("is_serious", False):
        referral_text = Path("prompts/referral_trigger.txt").read_text().strip()
        final_response = f"{final_response}\n\n{referral_text}"
        
    updated_messages = state["messages"] + [{"role": "assistant", "content": final_response}]
    
    return {
        "messages": updated_messages,
        "final_response": final_response
    }
