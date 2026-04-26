# # core/ner.py
# # Purpose: Extract medical entities from natural patient language.
# # Patients describe symptoms conversationally — not clinically.
# # We use scispaCy for accurate medical term recognition and
# # medspaCy specifically for negation detection (the one genuinely
# # useful clinical NLP feature for our use case).
# # e.g. "no fever" → fever goes to negations not symptoms
# # e.g. "chest pain" → goes to symptoms, triggers HIGH severity

import os
import logging

os.environ["LOGURU_LEVEL"] = "WARNING" # Must stay at the very top
logging.getLogger("PyRuSH").setLevel(logging.ERROR)

import medspacy
from medspacy.ner import TargetRule

# Load medspaCy's clinical pipeline
nlp = medspacy.load()

HIGH_RISK_SYMPTOMS = [
    "chest pain", 
    "difficulty breathing", 
    "shortness of breath", 
    "stiff neck", 
    "unconscious", 
    "seizure", 
    "severe bleeding", 
    "cannot breathe", 
    "stroke", 
    "heart attack",
    "passed out", 
    "meningitis", 
    "sharp pain in chest"
]

# Adding common symptoms
OTHER_SYMPTOMS = ["fever", "headache", "throat hurts", "coughing", "nausea", "migraine", "racing", "sore throat", "stomach really hurts", 
    "dizzy", "cough", "pain"]

target_matcher = nlp.get_pipe("medspacy_target_matcher")
rules = [TargetRule(symptom, "CONDITION") for symptom in (HIGH_RISK_SYMPTOMS + OTHER_SYMPTOMS)]
target_matcher.add(rules)

def extract_entities(text):
    doc = nlp(text)
    entities = {"symptoms": [], "negations": [], "severity": "low"}

    for ent in doc.ents:
        # medspaCy automatically tags if a symptom is negated!
        if ent._.is_negated:
            entities["negations"].append(ent.text)
        else:
            entities["symptoms"].append(ent.text)
            
            # Check severity based on your high-risk list
            if any(s.lower() in HIGH_RISK_SYMPTOMS for s in entities["symptoms"]):
                entities["severity"] = "high"
        
    return entities

def format_for_llm(entities):
    """
    Formats the extracted entities into a clean readable string
    for injection into the LLM prompt.
    Called by preprocessing.py to build the ner_summary field.

    entities: dict from extract_entities()
    Returns: formatted multi-line string
    """
    lines = []

    # Only add sections that have content
    # Empty sections just clutter the prompt
    if entities["symptoms"]:
        lines.append(
            f"Confirmed present symptoms: {', '.join(entities['symptoms'])}"
        )

    if entities["negations"]:
        lines.append(
            f"Explicitly denied symptoms: {', '.join(entities['negations'])}"
        )

    # Always include severity
    lines.append(
        f"Severity assessment: {entities['severity'].upper()}"
    )

    # Join all lines with newlines for clean LLM prompt formatting
    return "\n".join(lines)


if __name__ == "__main__":

    test_cases = [
        "I have a fever and a headache",
        "I have chest pain but no fever",
        "I have a stiff neck and a migraine",
        "My throat hurts but no coughing",
        "I am having a seizure",
        "My heart feels like it is racing but I have no pain",
        "I am worried about meningitis because my brother has it, but I just have a sore throat",
        "I don't have a fever, I don't have a cough, but my stomach really hurts",
        "I'm feeling dizzy and I passed out earlier",
        "I have a sharp pain in my chest when I breathe"
    ]

    for text in test_cases:
        print(f"\nInput: {text}")
        result = extract_entities(text)
        
        print(f"  Symptoms:  {result['symptoms']}")
        print(f"  Negations: {result['negations']}")
        print(f"  Severity:  {result['severity'].upper()}")

        # Test format_for_llm — pass the result directly into it
        llm_summary = format_for_llm(result)
        print(f"  LLM Summary:\n    {llm_summary.replace(chr(10), chr(10) + '    ')}")
        print("-" * 50)

