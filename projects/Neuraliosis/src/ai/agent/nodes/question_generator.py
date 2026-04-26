import logging
import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
from agent.state import HealthState

load_dotenv()
logger = logging.getLogger(__name__)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "dummy_key"))

def get_covered_topics(messages: list) -> str:
    topics_to_detect = ["sleep", "hydration", "eating", "exercise", "stress", "heart rate", "symptom timing"]
    covered = set()
    for m in messages:
        if m.get("role") == "assistant":
            content = m.get("content", "").lower()
            for t in topics_to_detect:
                if t in content:
                    covered.add(t)
    return ", ".join(covered) if covered else "none"

def format_last_6_messages(messages: list) -> str:
    recent = messages[-6:] if len(messages) >= 6 else messages
    return "\n".join([f"{m.get('role', 'user')}: {m.get('content', '')}" for m in recent])

def question_generator(state: HealthState) -> dict:
    prompt_path = Path("prompts/question_generator.txt")
    prompt = prompt_path.read_text() if prompt_path.exists() else ""

    topic = state.get('topic', 'unknown')
    keywords = ", ".join(state.get('keywords', []))
    questions_asked = state.get('questions_asked', 0)
    fitness_data = state.get('fitness_data', {})
    
    heart_rate = fitness_data.get('heart_rate', 'not available')
    steps = fitness_data.get('steps', 'not available')
    sleep_hours = fitness_data.get('sleep_hours', 'not available')
    last_workout = fitness_data.get('last_workout', 'not available')

    covered_topics = get_covered_topics(state.get('messages', []))
    recent_conv = format_last_6_messages(state.get('messages', []))

    context = f"""
Topic: {topic}
All reported symptoms: {keywords}
Questions asked so far: {questions_asked}

Fitness data available:
- Heart rate: {heart_rate} bpm
- Steps today: {steps}
- Sleep last night: {sleep_hours} hours
- Last workout: {last_workout}

Topics already covered in conversation:
{covered_topics}

Recent conversation:
{recent_conv}
"""

    res = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.7,
        max_tokens=150,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": context}
        ]
    )
    
    response_text = res.choices[0].message.content.strip()
    
    updated_messages = state.get("messages", []) + [{"role": "assistant", "content": response_text}]
    logger.info("Question generated successfully.")

    return {
        "messages": updated_messages,
        "questions_asked": questions_asked + 1,
        "final_response": response_text
    }
