import ollama
import json
import re

# MODEL_NAME = "adrienbrault/biomistral-7b:Q2_K"
MODEL_NAME = "alibayram/medgemma"

SYSTEM_PROMPT = """You are a medical triage assistant helping patients 
understand their symptoms.

STRICT RULES YOU MUST FOLLOW:
1. Answer ONLY based on the retrieved medical documents provided to you
2. If the documents don't contain enough information, respond with a JSON where confidence_score is 0.3 and risk_tier is "medium"
3. Never invent symptoms, treatments or medical facts not in the documents
4. Always include a disclaimer that this is not clinical medical advice
5. You MUST respond ONLY in valid JSON — no text before or after the JSON
6. Do not include markdown code blocks like ```json — just raw JSON

Your response must be a single valid JSON object with EXACTLY these keys:
{{
  "top_conditions": [{"name": "condition name", "probability": 75}],
  "confidence_score": 0.75,
  "risk_tier": "low",
  "warnings": ["warning 1", "warning 2"],
  "remedies": ["remedy 1", "remedy 2"],
  "summary": "plain english summary for the patient",
  "sources": ["source 1", "source 2"],
  "disclaimer": "This is not a substitute for clinical judgment"
}}
"""

def run_inference(payload, context):
    """
    Sends symptoms + RAG context to local Ollama model.
    payload: structured dict from preprocessing.py
    context: dict with docs and sources from rag.py (without context the model will start to hallucinate)
    Returns: parsed dict with diagnosis, risk, remedies etc.
    """
    # Join all retrieved document chunks into one block of text
    # These are the medical articles ChromaDB retrieved
    docs_text = "\n\n".join(context["docs"])
    
    # Pull source names from metadata for attribution
    source_names = [
        s.get("source", "Medical Database") 
        for s in context["sources"]
    ]
    
    # Build the full prompt that combines:
    # - Retrieved medical documents (RAG context)
    # - Patient profile information
    # - Reported symptoms
    user_message = f"""
        RETRIEVED MEDICAL DOCUMENTS (use ONLY these for your answer):
        {docs_text}

        PATIENT INFORMATION:
        - Age: {payload['patient_age']}
        - Known pre-existing conditions: {payload['known_conditions']}
        - Known allergies: {payload['known_allergies']}
        - Symptoms patient does NOT have: {payload['negations']}

        REPORTED SYMPTOMS:
        {payload['raw_symptoms']}

        EXTRACTED SYMPTOM ENTITIES:
        {', '.join(payload['extracted_symptoms'])}

        Available sources: {', '.join(source_names)}

        IMPORTANT: Respond with ONLY a valid JSON object. 
        No explanation, no markdown, no code blocks. Just raw JSON.
        """
    try:
        # ollama.chat() sends a message to the local Ollama server
        # model: which pulled model to use
        # messages: list of message dicts with role and content
        # options: model parameters
        response = ollama.chat(
            model=MODEL_NAME,
            messages=[
                {
                    # System message sets behavior rules
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    # User message contains the actual symptoms + context
                    "role": "user",
                    "content": user_message
                }
            ],
            options={
                # temperature=0 makes output more deterministic
                # Lower = more consistent, less creative
                # For medical diagnosis we want consistency
                "temperature": 0.1,
                
                # Maximum tokens in the response
                # 1000 is enough for our JSON structure
                "num_predict": 1000,
            }
        )   
        # Extract the response text from Ollama's response object
        # response["message"]["content"] contains the LLM's reply
        raw_text = response["message"]["content"].strip()

        print(f"DEBUG: LLM wrote this: {raw_text}") # Add this temporary line
        
        # Clean up response in case LLM added markdown code blocks
        # Some models wrap JSON in ```json ... ``` despite instructions
        raw_text = clean_json_response(raw_text)
        
        # Parse JSON string into Python dict
        result = json.loads(raw_text)
        
        # Validate that required keys exist in the response
        result = validate_and_fix_response(result)


        
        return result
    
    except ollama.ResponseError as e:
        # Ollama server returned an error — usually model not found
        print(f"Ollama error: {e}")
        print(f"Make sure you ran: ollama pull {MODEL_NAME}")
        return get_fallback_response(f"Ollama model error: {e}")
    
def clean_json_response(text):
    """
    Removes markdown code blocks that some models add around JSON.
    e.g. ```json { ... } ``` → { ... }
    text: raw string from LLM
    Returns: cleaned string ready for json.loads()
    """
    # Remove ```json at the start if present
    text = re.sub(r'^```json\s*', '', text, flags=re.MULTILINE)
    
    # Remove ``` at the end if present
    text = re.sub(r'\s*```$', '', text, flags=re.MULTILINE)
    
    # Strip any remaining whitespace
    text = text.strip()
    
    # If the text doesn't start with { find the first {
    # Sometimes models add a sentence before the JSON
    if not text.startswith('{'):
        start_idx = text.find('{')
        if start_idx != -1:
            # Trim everything before the first {
            text = text[start_idx:]
    
    # Find the last } and trim everything after it
    # Handles cases where model adds text after the JSON
    if not text.endswith('}'):
        end_idx = text.rfind('}')
        if end_idx != -1:
            text = text[:end_idx + 1]
    
    return text

def validate_and_fix_response(result):
    """
    Checks that required keys exist in LLM response.
    Adds safe defaults for any missing keys.
    result: parsed dict from json.loads()
    Returns: dict with all required keys guaranteed to exist
    """
    # Define required keys and their safe default values
    # If LLM missed a key we fill it in safely
    defaults = {
        "top_conditions": [{"name": "Unable to determine", "probability": 0}],
        "confidence_score": 0.5,
        "risk_tier": "medium",      # Default to medium — safer than low
        "warnings": [],
        "remedies": [],
        "summary": "Analysis complete. Please consult a doctor for confirmation.",
        "sources": [],
        "disclaimer": "This is not a substitute for clinical judgment"
    }
    
    # For each required key check if it exists in result
    # If not, add the default value
    for key, default_value in defaults.items():
        if key not in result:
            result[key] = default_value
    
    # Validate confidence_score is a float between 0 and 1
    # LLM sometimes returns it as a percentage (75 instead of 0.75)
    confidence = result.get("confidence_score", 0.5)
    if isinstance(confidence, (int, float)) and confidence > 1:
        # Convert percentage to decimal
        result["confidence_score"] = confidence / 100
    
    # Validate risk_tier is one of our expected values
    valid_tiers = ["low", "medium", "high"]
    if result.get("risk_tier", "").lower() not in valid_tiers:
        result["risk_tier"] = "medium"  # Default to medium if invalid
    
    # Normalize risk_tier to lowercase for consistency
    result["risk_tier"] = result["risk_tier"].lower()
    
    return result
    
def get_fallback_response(error_message):
    """
    Returns a safe fallback response when LLM fails completely.
    Ensures the app never crashes due to LLM errors.
    error_message: string describing what went wrong
    """
    return {
        "top_conditions": [
            {"name": "Unable to determine", "probability": 0}
        ],
        # Low confidence triggers UNCERTAIN tier in triage.py
        "confidence_score": 0.0,
        # Medium risk as safe default — not too alarming, not dismissive
        "risk_tier": "medium",
        "warnings": [
            "AI analysis unavailable — please consult a doctor directly"
        ],
        "remedies": [],
        "summary": (
            f"The AI analysis could not be completed ({error_message}). "
            "Please describe your symptoms to a healthcare professional."
        ),
        "sources": [],
        "disclaimer": "This is not a substitute for clinical judgment"
    }

if __name__ == "__main__":
    # 1. Mock Payload (This mimics the output of your preprocessing.py)
    test_payload = {
        "patient_age": 28,
        "known_conditions": "none",
        "known_allergies": "penicillin",
        "negations": ["fever", "coughing"],
        "raw_symptoms": "I have cold and cough",
        "extracted_symptoms": ["chest pain", "racing heart"]
    }

    # 2. Mock Context (This mimics the output of your rag.py)
    # In the real app, these 'docs' would be chunks from MedlinePlus or CDC
    test_context = {
        "docs": [
            "Chest pain can be a sign of many issues. Sharp pain that worsens with breathing might be pleurisy. However, sudden chest pain with a fast heart rate (tachycardia) can indicate a serious cardiac event or pulmonary embolism.",
            "Tachycardia is a heart rate over 100 beats per minute. When combined with chest discomfort, immediate medical evaluation is often required."
        ],
        "sources": [
            {"source": "MedlinePlus - Chest Pain"},
            {"source": "CDC - Heart Health"}
        ]
    }

    print("=" * 60)
    print(f"Testing {MODEL_NAME} Inference...")
    print(f"Input Symptoms: {test_payload['raw_symptoms']}")
    print("=" * 60)

    try:
        # Run the actual inference
        result = run_inference(test_payload, test_context)

        # Print the structured results
        print("\n--- AI ANALYSIS RESULTS ---")
        print(f"Risk Tier: {result['risk_tier'].upper()}")
        print(f"Confidence: {result['confidence_score']}")
        print(f"Top Conditions:")
        for cond in result['top_conditions']:
            print(f" - {cond['name']} ({cond['probability']}%)")
        
        print(f"\nSummary: {result['summary']}")
        print(f"Remedies: {', '.join(result['remedies']) if result['remedies'] else 'None'}")
        print(f"Sources: {', '.join(result['sources'])}")
        print(f"\nDisclaimer: {result['disclaimer']}")

    except Exception as e:
        print(f"Test Failed! Error: {e}")
    
    print("=" * 60)