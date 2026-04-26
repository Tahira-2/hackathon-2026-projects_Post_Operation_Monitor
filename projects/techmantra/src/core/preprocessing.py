# Purpose: Takes user input (raw symptom text) + extracted NER entities + user profile fetched from database
from core.ner import format_for_llm  # Import the helper from NER
def preprocess(user_input, ner_entities, user_profile):
    # takes in the user input, ner_entities, user_profile and prepares a proper input text for llm
    cleaned_symptoms = user_input.strip()
    
    age = user_profile.get("age", "unknown")

    conditions = user_profile.get("conditions", "none")

    allergies = user_profile.get("allergies", "none")

    payload = {
        # Original unmodified symptom text from user
        "raw_symptoms": cleaned_symptoms,
        
        # List of symptom phrases extracted by NER
        # e.g. ["severe headache", "stiff neck", "high fever"]
        "extracted_symptoms": ner_entities.get("symptoms", []),
        
        # Symptoms the user explicitly said they don't have
        # e.g. ["nausea", "vomiting"] from "no nausea or vomiting"
        "negations": ner_entities.get("negations", []),
        
        # Severity level from NER high-risk keyword check
        # "low" or "high" — used in triage decision
        "severity": ner_entities.get("severity", "low"),
        
        # Patient demographics for context-aware diagnosis
        "patient_age": age,
        
        # Pre-existing conditions that may affect diagnosis
        # e.g. diabetes changes interpretation of many symptoms
        "known_conditions": conditions,
        
        # Allergies that must be checked before suggesting remedies
        "known_allergies": allergies,

        "ner_summary": format_for_llm(ner_entities)
    }

    return payload  

if __name__ == "__main__":
    from ner import extract_entities, format_for_llm
    # Sample user profile — simulates what signup form saves to session state
    # This is a simplified version of the FHIR Patient resource

    def prepare_profile_for_preprocessing(patient_id):
        import sys
        from pathlib import Path

        # This finds the 'src' folder and tells Python to look there for modules
        root_path = Path(__file__).parent.parent
        sys.path.append(str(root_path))
        # Import the function from your database file
        from db.db import get_patient_full_context 
        
        # 1. Get the raw data from your existing DB function
        ctx = get_patient_full_context(patient_id)
        
        # 2. Extract values safely
        patient_data = ctx.get("patient", {})
        print(patient_data)
        
        # 3. Flatten lists of dicts into simple comma-separated strings
        # Converts [{'allergen': 'penicillin', ...}] -> "penicillin"
        allergies_list = [a['allergen'] for a in ctx.get("allergies", [])]
        print("Allergies",allergies_list)
        conditions_list = [c['condition_name'] for c in ctx.get("known_conditions", [])]
        print("conditions",conditions_list)
        
        # 4. Return the format your preprocess() function expects
        return {
            "age": patient_data.get("age", "unknown"),
            "conditions": ", ".join(conditions_list) if conditions_list else "none",
            "allergies": ", ".join(allergies_list) if allergies_list else "none"
        }
    
    user_profile = prepare_profile_for_preprocessing("c9f096e8-5d7c-4073-9890-32f557551995")

    # mock_user_profile = {
    #     "age": 35,
    #     "conditions": "Type 2 Diabetes",
    #     "allergies": "Penicillin"
    # }

    # Test cases — same style as ner.py tests so output is easy to compare
    test_cases = [
        "I have a fever and a headache",
        "I have chest pain but no fever",
        "I have a stiff neck and a migraine",
        "I don't have a fever, I don't have a cough, but my stomach really hurts",
        "I'm feeling dizzy and I passed out earlier",
    ]

    for text in test_cases:
        # Step 1 — run NER exactly as the real pipeline does
        entities = extract_entities(text)
        # Step 2 — run preprocessing with NER output and mock profile
        payload = preprocess(text, entities, user_profile)

        print(f"  raw_symptoms:        {payload['raw_symptoms']}")
        print(f"  extracted_symptoms:  {payload['extracted_symptoms']}")
        print(f"  negations:           {payload['negations']}")
        print(f"  severity:            {payload['severity'].upper()}")
        print(f"  patient_age:         {payload['patient_age']}")
        print(f"  known_conditions:    {payload['known_conditions']}")
        print(f"  known_allergies:     {payload['known_allergies']}")
        print(f"  ner_summary:\n    {payload['ner_summary'].replace(chr(10), chr(10) + '    ')}")
        print("###################")