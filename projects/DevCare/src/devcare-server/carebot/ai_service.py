import google.generativeai as genai
import json
import logging
from django.conf import settings
from rehab.models import ExerciseTemplate

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
Your role is to SUPPORT a licensed doctor, not replace them.
All outputs must be safe, structured, and editable by a doctor.

CONTEXT
A doctor is creating a rehabilitation plan for a patient.
You will generate a suggested therapy schedule based on the provided inputs.

TASK
Generate a structured rehabilitation plan that includes:
Daily exercise schedule (7-day plan)
Each exercise must include:
name, description, repetitions, sets, duration (if applicable)
Safety precautions, Contraindications (what to avoid), Progression guidance (how to increase intensity), Expected outcomes for the week

OUTPUT FORMAT (STRICT JSON)
Return ONLY JSON. No explanations.
{
"plan_name": "",
"duration": "7 days",
"daily_schedule": [
{
"day": "Day 1",
"exercises": [
{
"name": "",
"description": "",
"sets": "",
"reps": "",
"duration": ""
}
]
}
],
"precautions": [],
"contraindications": [],
"progression": "",
"expected_outcomes": ""
}

SAFETY RULES
Do NOT prescribe medication
Do NOT give diagnosis
Keep exercises low-risk and physiotherapy-based
Always include safety precautions
Avoid high-intensity or risky movements
Assume doctor will review and edit
"""

CHATBOT_PROMPT_TEMPLATE = """
Your role is to SUPPORT a licensed doctor by generating a recovery todo list for a patient based on a query.

CRITICAL INSTRUCTIONS:
1. ONLY generate a `todoList` if the user provides clear patient data or asks for a recovery plan.
2. The `todoList` MUST be an array of OBJECTS with 'name', 'metadata', and 'instruction'.
3. 'metadata' MUST be exactly this format: "ID Name Joint Min Max" from the database.
4. 'instruction' MUST include sets, repetitions, frequency, and goal.
5. CLINICAL ADAPTATION: You MUST adjust the intensity (number of sets and reps) based on:
   - AGE: Use more conservative/lower volume for elderly or very young patients.
   - SEVERITY: Decrease sets/reps significantly for "Severe" or "Moderate" injuries. Increase gradually for "Mild" or "Late-stage" recovery.
   - PAIN LEVEL: If pain level is high ( > 6), keep exercises very gentle.

AVAILABLE EXERCISE TEMPLATES IN DATABASE:
{exercise_list}

Example formatting for an item in `todoList`:
{{
  "name": "Ankle Pumps",
  "metadata": "7 Ankle Pumps Ankle -20.0 40.0",
  "instruction": "Perform 2 sets of 10 repetitions twice daily to improve circulation without overstraining."
}}

If the query is a greeting (hi, hello), respond with: "Hello! To help me generate a tailored recovery todo list for your doctor to review, please provide the following details: Condition, Patient, Severity, Recovery stage, Pain level, Medical history, Doctor notes, Rehabilitation goal." Keep `todoList` EMPTY.

OUTPUT FORMAT (STRICT JSON)
Return ONLY JSON. No explanations.
{{
"content": "Your conversational response...",
"todoList": [] 
}}
"""

def clean_json_response(text):
    """Extracts JSON from potential markdown wrappers."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:-3].strip()
    elif text.startswith("```"):
        text = text[3:-3].strip()
    
    # Find first '{' and last '}'
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        text = text[start:end+1]
    return text

def generate_rehab_plan(patient_data):
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"INPUT (JSON FORMAT):\n{json.dumps(patient_data, indent=2)}\n\n{SYSTEM_PROMPT}"
        response = model.generate_content(prompt)
        
        if not response.text:
            return {"error": "AI returned an empty response"}
            
        content = clean_json_response(response.text)
        return json.loads(content)
    except Exception as e:
        print(f"ERROR in generate_rehab_plan: {str(e)}")
        return {"error": str(e)}

def generate_chatbot_response(query):
    try:
        # Fetch current templates with full metadata
        templates = ExerciseTemplate.objects.all().values('id', 'name', 'target_joint', 'min_angle', 'max_angle')
        template_strings = []
        for t in templates:
            template_strings.append(f"ID:{t['id']} Name:{t['name']} Joint:{t['target_joint']} Min:{t['min_angle']} Max:{t['max_angle']}")
        
        exercise_list = "\n".join(template_strings) if template_strings else "No templates available yet."
        
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Inject templates into prompt
        full_prompt = CHATBOT_PROMPT_TEMPLATE.format(exercise_list=exercise_list)
        
        final_query = f"USER QUERY: {query}\n\n{full_prompt}"
        response = model.generate_content(final_query)
        
        if not response.candidates or not response.candidates[0].content.parts:
            return {
                "content": "I apologize, but I cannot process this request due to safety guidelines.",
                "todoList": []
            }
            
        content = clean_json_response(response.text)
        data = json.loads(content)
        
        # Ensure todoList items are objects as requested
        if "todoList" in data and isinstance(data["todoList"], list):
            sanitized = []
            for item in data["todoList"]:
                if isinstance(item, dict):
                    sanitized.append(item)
                else:
                    # Fallback if AI sends a string
                    sanitized.append({"name": "Exercise", "metadata": "", "instruction": str(item)})
            data["todoList"] = sanitized
            
        return data
    except Exception as e:
        print(f"ERROR in generate_chatbot_response: {str(e)}")
        return {
            "content": "I encountered an error while processing your request. Please try again.",
            "todoList": []
        }
