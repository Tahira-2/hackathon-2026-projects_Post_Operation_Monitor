# # core/ner.py
# # Purpose: Extract medical entities from natural patient language.
# # Patients describe symptoms conversationally — not clinically.
# # We use scispaCy for accurate medical term recognition and
# # medspaCy specifically for negation detection (the one genuinely
# # useful clinical NLP feature for our use case).
# # e.g. "no fever" → fever goes to negations not symptoms
# # e.g. "chest pain" → goes to symptoms, triggers HIGH severity

# import spacy        # Base spaCy framework
# import scispacy     # Adds biomedical entity recognition
# import medspacy     # Used specifically for negation detection

# # ── LOAD MODELS ───────────────────────────────────────────────────────

# # scispaCy biomedical NER model
# # Trained on medical literature — recognizes disease and symptom names
# # Much better than general spaCy for terms like "dyspnea" or "myalgia"
# sci_nlp = spacy.load("en_ner_bc5cdr_md")

# # medspaCy pipeline — we use this ONLY for negation
# # "no chest pain", "denies fever", "without nausea"
# # The ConText algorithm inside medspaCy handles these patterns well
# med_nlp = medspacy.load()

# # ── HIGH RISK KEYWORDS ────────────────────────────────────────────────
# # If any of these appear in the text → severity = HIGH immediately
# # No NLP needed for this — simple string matching is reliable enough
# # These are the classic emergency red flag symptoms
# HIGH_RISK_KEYWORDS = [
#     # Cardiac
#     "chest pain", "chest tightness", "heart attack", "palpitations",
    
#     # Respiratory  
#     "can't breathe", "cannot breathe", "difficulty breathing",
#     "shortness of breath", "trouble breathing", "dyspnea",
    
#     # Neurological
#     "stiff neck", "neck stiffness", "seizure", "stroke",
#     "unconscious", "passed out", "worst headache",
#     "sudden severe headache", "confused", "slurred speech",
    
#     # Bleeding
#     "coughing blood", "vomiting blood", "severe bleeding",
    
#     # Allergic emergency
#     "throat closing", "face swelling", "anaphylaxis",
    
#     # Other emergencies
#     "meningitis", "appendicitis", "sepsis"
# ]

# def extract_entities(text):
#     """
#     Extracts symptoms from natural conversational patient language.
#     Handles the two things that actually matter:
#     1. What symptoms are present
#     2. What symptoms are NOT present (negation)
#     3. Whether any emergency keywords are present (severity)

#     text: raw string the patient typed or spoke
#     Returns: dict with symptoms, negations, and severity
#     """
#     # Lowercase for consistent matching throughout
#     text_lower = text.lower()

#     # Initialize clean simple results
#     entities = {
#         "symptoms": [],   # Symptoms the patient HAS
#         "negations": [],  # Symptoms the patient does NOT have
#         "severity": "low" # Upgraded to "high" if emergency keywords found
#     }

#     # ── STEP 1: scispaCy — Extract Medical Terms ──────────────────────
#     # Run biomedical NER to find disease and symptom names
#     # This handles medical vocabulary 
#     # e.g. "myalgia" (muscle pain), "dyspnea" (breathing difficulty)
#     sci_doc = sci_nlp(text)

#     for ent in sci_doc.ents:
#         # Only care about DISEASE entities for symptom extraction
#         # CHEMICAL entities = medications — not needed for symptoms
#         if ent.label_ == "DISEASE":
#             symptom = ent.text.lower().strip()
#             # Avoid duplicates
#             if symptom not in entities["symptoms"]:
#                 entities["symptoms"].append(symptom)
#     return entities

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
    "heart attack"
]

target_matcher = nlp.get_pipe("medspacy_target_matcher")
rules = [TargetRule(symptom, "CONDITION") for symptom in HIGH_RISK_SYMPTOMS]
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

if __name__ == "__main__":

    test_cases = [
        "I have a fever and a headache",
        "I have chest pain but no fever",
        "I have a stiff neck and a migraine",
        "My throat hurts but no coughing",
        "I am having a seizure"
    ]

    for text in test_cases:
        print(f"\nInput: {text}")
        result = extract_entities(text)
        
        print(f"  Symptoms:  {result['symptoms']}")
        print(f"  Negations: {result['negations']}")
        print(f"  Severity:  {result['severity'].upper()}")
