# core/triage.py
# Purpose: The risk decision engine — takes the LLM's confidence score
# and the symptom severity from NER and returns a final risk tier.
# This is pure Python logic — no AI involved.
# Low → home care, Medium → book doctor, High → call 911.

import json  
import os

# absolute path
# __file__ is the path to this file (core/triage.py)
# .parent.parent goes up two levels to project root
# then down into db/remedy_db.json
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_REMEDY_DB_PATH = os.path.join(_THIS_DIR, "..", "db", "remedy_db.json")


def triage(confidence_score, severity):
    """
    Determines risk tier based on confidence score and symptom severity.
    confidence_score: float 0-1 from LLM output
    severity: "low" or "high" from NER keyword check
    Returns: "LOW", "MEDIUM", "HIGH", or "UNCERTAIN"
    """
    # If LLM isn't confident enough, don't guess — tell user to see a doctor
    # 0.5 threshold means we need at least 50% confidence to proceed
    if confidence_score < 0.5:
        return "UNCERTAIN"  # Special tier that shows "please see a doctor"
    
    # High severity from NER (emergency keywords found) OR
    # very high LLM confidence in a dangerous condition → emergency
    # 0.85 threshold means LLM is 85%+ sure about the diagnosis
    if severity == "high" or confidence_score >= 0.85:
        return "HIGH"
    
    # Medium confidence range → recommend seeing a doctor soon
    # but not an emergency
    elif confidence_score >= 0.65:
        return "MEDIUM"
    
    # Lower confidence + no high-risk keywords → likely manageable at home
    else:
        return "LOW"

def get_remedies_for_condition(condition_name):
    """
    Looks up home remedy suggestions for a given condition.
    Only called when risk tier is LOW.
    condition_name: string like "common cold" or "headache"
    Returns: dict with remedies and watch-for list, or None if not found
    """
    # Load remedy database from JSON file
    try:
        with open(_REMEDY_DB_PATH, "r") as f:
            remedy_db = json.load(f)
    except FileNotFoundError:
        # Remedy DB doesn't exist yet — return None gracefully
        print(f"[triage] remedy_db.json not found at {_REMEDY_DB_PATH}")
        return None
    except json.JSONDecodeError:
        # JSON file is malformed
        print("[triage] remedy_db.json is not valid JSON")
        return None
    
    # Normalize condition name to lowercase for case-insensitive matching
    condition_lower = condition_name.lower()
    
    # Search through remedy DB for a matching condition
    # We check both directions:
    # 1. Is the DB key inside the condition name? ("cold" in "common cold")
    # 2. Is the condition name inside the DB key? ("common cold" in "cold")
    # # This fuzzy matching handles slight variations in condition names
    # for key in remedy_db:
    #     if key in condition_lower or condition_lower in key:
    #         return remedy_db[key]  # Return matching remedy dict
    
    # # Return None if no matching remedy found
    # # Caller should handle None gracefully
    # return None
    # ── PASS 1: Exact key match ───────────────────────────────────────
    # Check if condition exactly matches a key
    # e.g. "common_cold" matches "common_cold"
    if condition_lower in remedy_db:
        return remedy_db[condition_lower]

    # Replace spaces with underscores and try again
    # e.g. "common cold" → "common_cold"
    condition_underscore = condition_lower.replace(" ", "_")
    if condition_underscore in remedy_db:
        return remedy_db[condition_underscore]

    # ── PASS 2: Fuzzy key match ───────────────────────────────────────
    # Check if any DB key appears inside the condition name or vice versa
    # e.g. key "flu" is inside "influenza" → no, but "flu" in "flu symptoms" → yes
    # e.g. condition "cold" is inside key "common_cold" → yes
    for key, value in remedy_db.items():
        key_spaced = key.replace("_", " ")  # "common_cold" → "common cold"

        if key_spaced in condition_lower or condition_lower in key_spaced:
            return value

    # ── PASS 3: Display name match ────────────────────────────────────
    # Check against the human-readable display_name field in the JSON
    # e.g. display_name "Influenza (Flu)" matches condition "influenza"
    for key, value in remedy_db.items():
        display_name = value.get("display_name", "").lower()

        if display_name in condition_lower or condition_lower in display_name:
            return value

    # ── PASS 4: Keyword overlap match ────────────────────────────────
    # Split both into words and check for any common meaningful word
    # e.g. condition "seasonal allergic rhinitis" matches key "seasonal_allergies"
    # because "seasonal" and "allergi" overlap
    condition_words = set(condition_lower.replace("_", " ").split())

    for key, value in remedy_db.items():
        key_words = set(key.replace("_", " ").split())
        display_words = set(value.get("display_name", "").lower().split())
        all_db_words = key_words | display_words

        # Find overlapping words — ignore very short words like "a", "of", "the"
        overlap = condition_words & all_db_words
        meaningful_overlap = {w for w in overlap if len(w) > 3}

        if meaningful_overlap:
            return value

    # No match found in any pass
    print(f"[triage] No remedy found for condition: '{condition_name}'")
    return None

def get_next_steps(risk_tier, condition_name):
    """
    Returns plain English next steps based on risk tier.
    Used in the results page and doctor summary.
    risk_tier: "LOW", "MEDIUM", "HIGH", or "UNCERTAIN"
    condition_name: top diagnosed condition for context
    Returns: string describing what the patient should do
    """
    # Different instructions depending on urgency level
    if risk_tier == "HIGH":
        return (
            "This appears to be a medical emergency. "
            "Call 911 or go to the nearest emergency room immediately. "
            "Do not drive yourself."
        )
    elif risk_tier == "MEDIUM":
        return (
            f"Based on your symptoms, you should see a doctor within 24 hours. "
            f"An appointment has been requested with your physician. "
            f"If symptoms worsen, go to urgent care immediately."
        )
    elif risk_tier == "LOW":
        return (
            f"Your symptoms appear manageable at home. "
            f"Follow the home care steps below. "
            f"Monitor your symptoms and seek care if they worsen."
        )
    else:  # UNCERTAIN
        return (
            "We were unable to make a confident assessment. "
            "Please consult a doctor directly to discuss your symptoms."
        )
    
# if __name__ == "__main__":
    
#     # Scenarios to test our logic
#     # Format: (label, confidence, severity, condition)
#     scenarios = [
#         ("High Risk (Emergency Keyword)", 0.6, "high", "chest pain"),
#         ("Low Confidence (AI is unsure)", 0.3, "low", "unclear"),
#         ("High Confidence (Serious Match)", 0.9, "low", "meningitis"),
#         ("Medium Risk (Decent Match)", 0.7, "low", "ear infection"),
#         ("Low Risk (Safe match)", 0.55, "low", "common cold")
#     ]

#     for label, conf, sev, cond in scenarios:
#         print(f"\nScenario: {label}")
        
#         # 1. Test the Triage Tier Logic
#         tier = triage(conf, sev)
        
#         # 2. Test the Next Steps Text
#         steps = get_next_steps(tier, cond)
        
#         print(f"  Input -> Conf: {conf}, Sev: {sev}")
#         print(f"  Result -> TIER: {tier}")
#         print(f"  Action -> {steps}")

#     # 3. Test Remedy Database (Mocked)
    
#     print("Testing Remedy Lookup for 'common cold':")
#     # Note: This requires your db/remedy_db.json to exist!
#     try:
#         remedies = get_remedies_for_condition("common cold")
#         print(f"  Remedies found: {remedies if remedies else 'No remedy file found'}")
#     except FileNotFoundError:
#         print("  Remedy Test: not found)")

#     print("=" * 60)

if __name__ == "__main__":

    print("=" * 60)
    print("Triage Engine Test")
    print("=" * 60)

    # ── TEST 1: Triage tier logic ─────────────────────────────────────
    print("\n--- Triage Tier Tests ---")

    scenarios = [
        ("Emergency keyword found",     0.6,  "high", "chest pain"),
        ("AI is unsure (low conf)",      0.3,  "low",  "unclear"),
        ("High confidence serious",      0.9,  "low",  "meningitis"),
        ("Medium confidence",            0.7,  "low",  "ear infection"),
        ("Low risk manageable",          0.55, "low",  "common cold"),
        ("Boundary: exactly 0.5",        0.5,  "low",  "headache"),
        ("Boundary: exactly 0.65",       0.65, "low",  "sore throat"),
        ("Boundary: exactly 0.85",       0.85, "low",  "pneumonia"),
    ]

    for label, conf, sev, cond in scenarios:
        tier = triage(conf, sev)
        steps = get_next_steps(tier, cond)
        print(f"\n  Scenario : {label}")
        print(f"  Input    : confidence={conf}, severity={sev}")
        print(f"  Tier     : {tier}")
        print(f"  Action   : {steps}")

    # ── TEST 2: Remedy lookup — exact matches ─────────────────────────
    print("\n" + "=" * 60)
    print("--- Remedy Lookup Tests ---")

    # Test conditions in different formats to verify fuzzy matching
    test_conditions = [
        "common cold",          # exact key match with space
        "Common Cold",          # uppercase — tests case insensitivity
        "flu",                  # exact key
        "Influenza",            # display_name match
        "headache",             # exact key
        "seasonal allergies",   # key without underscore
        "nausea",               # partial key match
        "back pain",            # exact key with space
        "food poisoning",       # condition not in remedy DB — should return None
        "appendicitis",         # not in DB — should return None gracefully
    ]

    for condition in test_conditions:
        result = get_remedies_for_condition(condition)

        print(f"\n  Condition : '{condition}'")

        if result:
            # Show just first 2 remedies so output stays readable
            remedies_preview = result.get("remedies", [])[:2]
            watch_preview = result.get("watch_for", [])[:1]
            print(f"  Matched   : {result.get('display_name', 'Unknown')}")
            print(f"  Source    : {result.get('source', 'Unknown')}")
            print(f"  Remedies  : {remedies_preview}")
            print(f"  Watch for : {watch_preview}")
            print(f"  Duration  : {result.get('duration', 'Not specified')}")
        else:
            print(f"  Result    : No remedy found (expected for rare conditions)")

    print("\n" + "=" * 60)
    print("All triage tests complete.")
