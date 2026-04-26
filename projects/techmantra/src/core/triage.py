# core/triage.py
# Purpose: The risk decision engine — takes the LLM's confidence score
# and the symptom severity from NER and returns a final risk tier.
# This is pure Python logic — no AI involved.
# Low → home care, Medium → book doctor, High → call 911.

import json  # For reading the remedy database file

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
    # Open and parse our hand-curated remedy JSON file
    # This file contains safe, source-backed home care suggestions
    with open("db/remedy_db.json", "r") as f:
        remedy_db = json.load(f)  # Parse JSON file into Python dict
    
    # Normalize condition name to lowercase for case-insensitive matching
    condition_lower = condition_name.lower()
    
    # Search through remedy DB for a matching condition
    # We check both directions:
    # 1. Is the DB key inside the condition name? ("cold" in "common cold")
    # 2. Is the condition name inside the DB key? ("common cold" in "cold")
    # This fuzzy matching handles slight variations in condition names
    for key in remedy_db:
        if key in condition_lower or condition_lower in key:
            return remedy_db[key]  # Return matching remedy dict
    
    # Return None if no matching remedy found
    # Caller should handle None gracefully
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
    
if __name__ == "__main__":
    
    # Scenarios to test our logic
    # Format: (label, confidence, severity, condition)
    scenarios = [
        ("High Risk (Emergency Keyword)", 0.6, "high", "chest pain"),
        ("Low Confidence (AI is unsure)", 0.3, "low", "unclear"),
        ("High Confidence (Serious Match)", 0.9, "low", "meningitis"),
        ("Medium Risk (Decent Match)", 0.7, "low", "ear infection"),
        ("Low Risk (Safe match)", 0.55, "low", "common cold")
    ]

    for label, conf, sev, cond in scenarios:
        print(f"\nScenario: {label}")
        
        # 1. Test the Triage Tier Logic
        tier = triage(conf, sev)
        
        # 2. Test the Next Steps Text
        steps = get_next_steps(tier, cond)
        
        print(f"  Input -> Conf: {conf}, Sev: {sev}")
        print(f"  Result -> TIER: {tier}")
        print(f"  Action -> {steps}")

    # 3. Test Remedy Database (Mocked)
    
    print("Testing Remedy Lookup for 'common cold':")
    # Note: This requires your db/remedy_db.json to exist!
    try:
        remedies = get_remedies_for_condition("common cold")
        print(f"  Remedies found: {remedies if remedies else 'No remedy file found'}")
    except FileNotFoundError:
        print("  Remedy Test: not found)")

    print("=" * 60)
