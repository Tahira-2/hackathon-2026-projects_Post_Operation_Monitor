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
        
    logger.info(f"Detected topic: {topic}, keywords: {keywords}")
    return {"topic": topic, "keywords": keywords}
