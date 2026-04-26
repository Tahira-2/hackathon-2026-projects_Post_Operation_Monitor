import json
import logging
import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
from agent.state import HealthState

load_dotenv()
logger = logging.getLogger(__name__)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "dummy_key"))

GREETING_PATTERNS = [
    "hi", "hello", "hey", "hii", "helo",
    "good morning", "good evening", "good afternoon",
    "howdy", "sup", "what's up", "whats up",
    "how are you", "who are you", "what can you do"
]

def is_greeting_message(text: str, keywords: list[str]) -> bool:
    cleaned = text.lower().strip()
    # Check if message is ONLY a greeting
    # with no symptom keywords
    is_short = len(cleaned.split()) <= 4
    is_greeting = any(g in cleaned for g in GREETING_PATTERNS)
    has_symptom = len(keywords) > 0  # keywords from LLM parse
    return is_greeting and is_short and not has_symptom

def intent_parser(state: HealthState) -> dict:
    prompt = Path("prompts/intent_parser.txt").read_text()
    last_user_msg = next((m["content"] for m in reversed(state["messages"]) if m["role"] == "user"), "")
    
    try:
        res = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": prompt}, {"role": "user", "content": last_user_msg}]
        )
        content = res.choices[0].message.content.strip()
        
        if content.startswith("```json"): content = content[7:]
        if content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
            
        parsed_data = json.loads(content.strip())
        topic = parsed_data.get("topic", "general")
        keywords = parsed_data.get("keywords", [])
    except json.JSONDecodeError:
        topic = "general"
        keywords = []
    except Exception as e:
        logger.error(f"Error calling LLM: {e}")
        topic = "general"
        keywords = []
        
    # Preserve existing context when user taps short option-like answers.
    previous_keywords = state.get("keywords", [])
    previous_topic = state.get("topic", "general")
    if not keywords and previous_keywords:
        keywords = previous_keywords
    if (topic == "general" or not topic) and previous_topic and previous_topic != "general":
        topic = previous_topic

    logger.info(f"Detected topic: {topic}, keywords: {keywords}")
    return {
        "topic": topic,
        "keywords": keywords,
        "is_greeting": is_greeting_message(last_user_msg, keywords)
    }
