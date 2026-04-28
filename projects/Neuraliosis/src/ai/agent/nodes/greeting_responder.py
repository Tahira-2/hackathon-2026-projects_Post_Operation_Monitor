from agent.state import HealthState
from openai import OpenAI
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)
client = OpenAI()

SYSTEM_PROMPT = """
You are Neuraliosis AI, a warm, friendly health and wellness assistant
inside a fitness app.

When a user greets you or sends small talk:
- Respond warmly and naturally like a helpful friend
- Introduce yourself specifically as "Neuraliosis AI"
- Briefly introduce what you can help with
- Invite them to share how they are feeling
- Keep it to 2-3 sentences maximum
- Never ask MCQ questions in this step
- Never ask about sleep, steps, or fitness data yet

Examples of good responses:
- "Hi there! I am Neuraliosis AI, your health assistant. 
   Tell me how you are feeling today and 
   I will do my best to help."
- "Hello! I am Neuraliosis AI. Great to see you. What health 
   concern can I help you with today?"
- "Hey! Neuraliosis AI here. I am here to help with any health 
   or wellness questions. How are you feeling?"
"""

def greeting_responder(state: HealthState) -> dict:
    last_msg = state["messages"][-1]["content"] if state["messages"] else "hi"

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": last_msg}
        ],
        max_tokens=100,
        temperature=0.8
    )

    reply = response.choices[0].message.content.strip()
    updated_messages = state["messages"] + [
        {"role": "assistant", "content": reply}
    ]

    logger.info("Greeting response sent")
    return {
        "messages": updated_messages,
        "final_response": reply,
        "is_greeting": False  # reset for next turn
    }
