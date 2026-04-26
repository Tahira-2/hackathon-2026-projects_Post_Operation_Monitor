import logging
import os
import json
import re
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
from agent.state import HealthState

load_dotenv()
logger = logging.getLogger(__name__)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "dummy_key"))


def _sanitize_option_text(value: str) -> str:
    text = (value or "").strip()
    text = re.sub(r"^[A-Da-d][\)\.\-: ]+", "", text).strip()
    return text


def _normalize_options(raw_options: list) -> list[dict]:
    letters = ["a", "b", "c", "d"]
    cleaned: list[dict] = []
    for idx, raw in enumerate(raw_options[:4]):
        if isinstance(raw, dict):
            label = _sanitize_option_text(str(raw.get("label", "")))
            value = _sanitize_option_text(str(raw.get("value", label)))
        else:
            label = _sanitize_option_text(str(raw))
            value = label

        if not label:
            label = f"Option {letters[idx].upper()}"
        if not value:
            value = label

        cleaned.append({"id": letters[idx], "label": label, "value": value})

    while len(cleaned) < 4:
        idx = len(cleaned)
        cleaned.append({
            "id": letters[idx],
            "label": "Other / I am not sure" if idx == 3 else f"Option {letters[idx].upper()}",
            "value": "I am not sure" if idx == 3 else f"Option {letters[idx].upper()}",
        })

    return cleaned


def _parse_structured_question(text: str) -> tuple[str, list[dict]]:
    body = (text or "").strip()
    if body.startswith("```"):
        body = body.strip("`")
        if body.lower().startswith("json"):
            body = body[4:].strip()

    question = ""
    options: list[dict] = []

    try:
        parsed = json.loads(body)
        question = str(parsed.get("question", "")).strip()
        options = _normalize_options(parsed.get("options", []))
        if question:
            return question, options
    except Exception:
        pass

    lines = [line.strip() for line in (text or "").splitlines() if line.strip()]
    if lines:
        question = lines[0]

    option_lines = []
    for line in lines[1:]:
        if re.match(r"^[A-Da-d][\)\.\-: ]+", line):
            option_lines.append(line)

    options = _normalize_options(option_lines)
    if not question:
        question = "Can you share one more detail about your symptoms?"
    return question, options


def _infer_symptom_focus(state: HealthState) -> str:
    keywords = " ".join(state.get("keywords", [])).lower()
    latest_user = next(
        (m.get("content", "") for m in reversed(state.get("messages", [])) if m.get("role") == "user"),
        "",
    ).lower()
    haystack = f"{keywords} {latest_user}"

    if any(t in haystack for t in ["stomach", "abdomen", "nausea", "vomit", "bloating", "acid"]):
        return "digestive"
    if any(t in haystack for t in ["cough", "fever", "sore throat", "breath", "cold", "flu"]):
        return "respiratory"
    if any(t in haystack for t in ["headache", "migraine", "dizzy", "vision"]):
        return "neurological"
    if any(t in haystack for t in ["chest", "palpitation", "left arm", "jaw"]):
        return "cardiac"
    if any(t in haystack for t in ["joint", "back pain", "knee", "muscle", "swelling"]):
        return "musculoskeletal"
    if any(t in haystack for t in ["sleep", "insomnia", "tired", "fatigue"]):
        return "sleep-fatigue"
    return "general"


def _is_baseline_lifestyle_question(question: str) -> bool:
    q = (question or "").lower()
    patterns = [
        "how many hours did you sleep",
        "how much water",
        "how many glasses",
        "sleep yesterday",
    ]
    return any(p in q for p in patterns)


def _generate_question_with_contract(prompt: str, context: str, output_contract: str) -> tuple[str, list[dict]]:
    res = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.7,
        max_tokens=260,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"{context}\n\n{output_contract}"},
        ],
    )

    response_text = res.choices[0].message.content.strip()
    return _parse_structured_question(response_text)

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
    symptom_focus = _infer_symptom_focus(state)
    questions_asked = state.get('questions_asked', 0)

    # Avoid repeating the same first-turn baseline prompts unless symptom focus needs it.
    force_non_lifestyle = symptom_focus not in ["sleep-fatigue", "general"] and questions_asked < 3

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

Symptom focus:
{symptom_focus}

Rules:
- Keep next question tightly relevant to symptom focus.
- Avoid repeating prior topics and question wording.
- {"Do not ask sleep or hydration in this turn." if force_non_lifestyle else "Sleep/hydration allowed only if strongly relevant."}
"""

    output_contract = (
        "Return STRICT JSON only, no prose."
        " JSON schema:"
        " {\"question\": \"...\", \"options\": ["
        "{\"label\": \"...\", \"value\": \"...\"},"
        "{\"label\": \"...\", \"value\": \"...\"},"
        "{\"label\": \"...\", \"value\": \"...\"},"
        "{\"label\": \"Other / I am not sure\", \"value\": \"I am not sure\"}"
        "]}."
        " The question and options must be directly relevant to user's recent symptoms and the existing conversation context."
    )

    question_text, options = _generate_question_with_contract(prompt, context, output_contract)

    # One corrective retry if model still gives baseline lifestyle question too early.
    if force_non_lifestyle and _is_baseline_lifestyle_question(question_text):
        correction = (
            output_contract
            + " IMPORTANT: The next question must NOT be about sleep or hydration."
            + " Ask a symptom-specific clarification based on the current complaint."
        )
        question_text, options = _generate_question_with_contract(prompt, context, correction)

    updated_messages = state.get("messages", []) + [{"role": "assistant", "content": question_text}]
    logger.info("Question generated successfully.")

    return {
        "messages": updated_messages,
        "questions_asked": questions_asked + 1,
        "final_response": question_text,
        "current_options": options,
    }
