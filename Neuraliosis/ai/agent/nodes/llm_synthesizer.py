import logging
import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
from agent.state import HealthState

load_dotenv()
logger = logging.getLogger(__name__)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "dummy_key"))

def format_conversation(messages: list) -> str:
    return "\n".join([f"{m.get('role', 'user')}: {m.get('content', '')}" for m in messages])

def llm_synthesizer(state: HealthState) -> dict:
    prompt_path = Path("prompts/synthesizer_system.txt")
    system_prompt = prompt_path.read_text() if prompt_path.exists() else ""

    keywords = ", ".join(state.get('keywords', []))
    conv_summary = format_conversation(state.get('messages', []))
    fitness_data = state.get('fitness_data', {})
    
    heart_rate = fitness_data.get('heart_rate', 'not tracked')
    steps = fitness_data.get('steps', 'not tracked')
    sleep_hours = fitness_data.get('sleep_hours', 'not tracked')
    last_workout = fitness_data.get('last_workout', 'not tracked')
    
    retrieved_ctx = chr(10).join(state.get('retrieved_context', []))

    user_message = f"""
REPORTED SYMPTOMS:
{keywords}

CONVERSATION SUMMARY:
{conv_summary}

USER FITNESS DATA:
- Resting heart rate: {heart_rate} bpm
- Steps today: {steps}
- Sleep last night: {sleep_hours} hours
- Last workout: {last_workout}

WELLNESS KNOWLEDGE BASE (use this as reference):
{retrieved_ctx}

Based on ALL the above, give a wellness-focused response
that specifically connects the user's symptoms to their
fitness data where relevant. For example:
- If sleep < 6 hours and they have fatigue → mention sleep
- If steps < 3000 and they feel sluggish → mention activity
- If heart rate high and they feel anxious → mention stress
"""

    res = client.chat.completions.create(
        model="gpt-4o",
        temperature=0.7,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
    )
    response_text = res.choices[0].message.content.strip()

    SERIOUS_KEYWORDS = [
        "chest pain", "can't breathe", "difficulty breathing",
        "fainting", "fainted", "unconscious", "severe headache",
        "numbness", "arm pain", "jaw pain", "heart attack"
    ]
    
    all_text = " ".join([m.get("content", "").lower() for m in state.get("messages", [])])
    is_serious = any(kw in all_text for kw in SERIOUS_KEYWORDS)

    logger.info(f"Synthesized response. is_serious={is_serious}")

    return {
        "final_response": response_text,
        "is_serious": is_serious
    }
