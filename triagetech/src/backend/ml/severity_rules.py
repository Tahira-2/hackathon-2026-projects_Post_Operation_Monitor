"""
CareDevi Triage Engine
Rule-based symptom severity classifier.
Returns: GREEN (self-care), YELLOW (see doctor), RED (emergency)
"""

from dataclasses import dataclass, field
from typing import Optional

# ── SEVERITY LEVELS ───────────────────────────────────────────────────────────
GREEN  = "green"
YELLOW = "yellow"
RED    = "red"

SEVERITY_LABELS = {
    GREEN:  "Self-Care at Home",
    YELLOW: "See a Doctor Soon",
    RED:    "Seek Emergency Care",
}

SEVERITY_ADVICE = {
    GREEN:  "Your symptoms appear mild. Rest, stay hydrated, and monitor your condition. If symptoms worsen over the next 24–48 hours, consult a doctor.",
    YELLOW: "Your symptoms suggest you should see a healthcare provider within the next 24 hours. Avoid self-medicating and book a clinic visit or teleconsultation.",
    RED:    "Your symptoms may indicate a serious or life-threatening condition. Go to the nearest emergency room immediately or call for help.",
}

# ── SYMPTOM KNOWLEDGE BASE ────────────────────────────────────────────────────

# RED flag symptoms — any match → emergency
RED_SYMPTOMS = {
    "chest pain", "chest tightness", "chest pressure",
    "difficulty breathing", "can't breathe", "shortness of breath",
    "severe shortness of breath", "trouble breathing",
    "unconscious", "unresponsive", "collapsed", "fainting",
    "stroke", "sudden numbness", "face drooping", "arm weakness",
    "sudden severe headache", "worst headache", "thunderclap headache",
    "coughing blood", "vomiting blood", "blood in stool",
    "severe abdominal pain", "rigid abdomen",
    "seizure", "convulsion", "fits",
    "high fever", "fever above 104", "fever above 40",
    "anaphylaxis", "severe allergic reaction", "throat swelling",
    "confusion", "sudden confusion", "disoriented",
    "severe bleeding", "heavy bleeding", "uncontrolled bleeding",
    "snake bite", "animal bite",
    "poisoning", "overdose",
    "neck stiffness with fever", "rash with fever",
    "blue lips", "cyanosis",
}

# YELLOW flag symptoms — moderate concern
YELLOW_SYMPTOMS = {
    "high fever", "persistent fever",
    "persistent cough", "cough with phlegm", "productive cough",
    "ear pain", "earache", "ear infection",
    "eye redness", "eye discharge", "pink eye",
    "difficulty swallowing", "sore throat with difficulty",
    "painful urination", "burning urination", "urinary pain",
    "frequent urination", "blood in urine",
    "repeated vomiting", "severe vomiting",
    "persistent diarrhea", "bloody diarrhea",
    "severe abdominal pain", "severe stomach pain",
    "severe back pain",
    "joint swelling", "severe joint pain",
    "rash with fever", "spreading rash", "hives",
    "dizziness", "vertigo", "lightheaded",
    "migraine", "persistent headache",
    "swollen lymph nodes", "neck lump",
    "toothache", "dental pain",
    "wound", "cut", "laceration",
    "sprain", "twisted ankle",
    "blurred vision", "vision changes",
    "shortness of breath on exertion",
    "palpitations", "heart racing",
    "weight loss unexplained", "night sweats",
}

# GREEN — mild, self-manageable
GREEN_SYMPTOMS = {
    "fever", "mild fever", "low grade fever", "low-grade fever",
    "cough", "mild cough", "dry cough",
    "headache", "mild headache", "tension headache",
    "stomach pain", "mild stomach ache", "belly pain", "upset stomach",
    "vomiting", "mild nausea", "nausea",
    "diarrhea", "loose motion",
    "runny nose", "stuffy nose", "nasal congestion",
    "sneezing", "mild sneezing",
    "sore throat", "throat irritation",
    "fatigue", "tiredness", "feeling tired",
    "indigestion", "gas", "constipation", "bloating",
    "mild rash", "skin irritation",
    "insect bite", "mosquito bite",
    "sunburn", "mild sunburn",
    "mild back pain", "muscle ache", "muscle soreness",
    "hiccups",
    "cold", "common cold",
    "mild allergy", "seasonal allergy",
}

# Conditions mapped from symptom combos
CONDITION_MAP = [
    # (required symptoms, possible symptoms, condition name, severity)
    ({"chest pain", "shortness of breath"}, {"sweating", "nausea"}, "Possible Cardiac Event", RED),
    ({"sudden severe headache"}, {"vomiting", "neck stiffness"}, "Possible Stroke / Aneurysm", RED),
    ({"fever", "neck stiffness", "rash"}, {}, "Possible Meningitis", RED),
    ({"high fever", "convulsion"}, {}, "Febrile Seizure", RED),
    ({"coughing blood"}, {}, "Hemoptysis (medical attention needed)", RED),

    ({"fever", "cough", "fatigue"}, {"shortness of breath", "body ache"}, "Possible Influenza / Viral Infection", YELLOW),
    ({"fever", "diarrhea", "vomiting"}, {}, "Gastroenteritis (possible dehydration)", YELLOW),
    ({"painful urination", "fever"}, {"back pain"}, "Possible Urinary Tract Infection", YELLOW),
    ({"sore throat", "fever"}, {"difficulty swallowing"}, "Possible Throat Infection (Strep)", YELLOW),
    ({"rash", "fever"}, {}, "Possible Viral Rash / Dengue", YELLOW),
    ({"abdominal pain", "vomiting"}, {"fever"}, "Possible Gastric Issue / Appendicitis risk", YELLOW),
    ({"persistent cough"}, {"night sweats", "weight loss"}, "Possible Respiratory Infection (TB screening advised)", YELLOW),
    ({"dizziness", "headache"}, {"vomiting"}, "Possible Hypertension / Inner Ear Issue", YELLOW),
    ({"joint pain", "fever", "rash"}, {}, "Possible Dengue Fever", YELLOW),

    ({"runny nose", "sneezing", "sore throat"}, {}, "Common Cold", GREEN),
    ({"mild cough", "runny nose"}, {}, "Upper Respiratory Tract Infection (mild)", GREEN),
    ({"mild headache", "fatigue"}, {}, "Tension Headache / Stress", GREEN),
    ({"indigestion", "bloating"}, {}, "Indigestion / Mild Gastritis", GREEN),
    ({"mild fever"}, {"runny nose", "fatigue"}, "Mild Viral Illness", GREEN),
]


# ── CORE ENGINE ───────────────────────────────────────────────────────────────

@dataclass
class TriageResult:
    severity: str
    severity_label: str
    advice: str
    possible_conditions: list[dict]
    matched_symptoms: list[str]
    risk_flags: list[str]
    confidence: int  # 0–100


def normalize(text: str) -> str:
    return text.lower().strip()


def extract_symptoms(symptom_input: list[str]) -> set[str]:
    """Normalize and return a set of symptom strings."""
    return {normalize(s) for s in symptom_input if s.strip()}


def check_red_flags(symptoms: set[str]) -> list[str]:
    flags = []
    for s in symptoms:
        for red in RED_SYMPTOMS:
            if s == red or (len(red) > 8 and red in s) or (len(s) > 8 and s in red):
                flags.append(s)
                break
    return flags


def is_known_symptom(s: str) -> bool:
    """Check if a symptom string is present in any of our knowledge bases."""
    if s in RED_SYMPTOMS or s in YELLOW_SYMPTOMS or s in GREEN_SYMPTOMS:
        return True
    for required, possible, _, _ in CONDITION_MAP:
        if any(s in req or req in s for req in required): return True
        if any(s in pos or pos in s for pos in possible): return True
    return False


def match_conditions(symptoms: set[str]) -> list[dict]:
    results = []
    for required, possible, condition, severity in CONDITION_MAP:
        # Check if required symptoms overlap
        def sym_match(a, b):
            # Stricter matching for long phrases to avoid common words triggering flags
            if a == b: return True
            # If target is a phrase (multiple words), require more than just one word match
            if " " in a and " " not in b:
                return False 
            if len(a) > 12 and len(b) > 4:
                return f" {b} " in f" {a} " or f" {a} " in f" {b} "
            return (len(a) > 8 and a in b) or (len(b) > 8 and b in a)

        req_match = sum(
            1 for r in required
            if any(sym_match(r, s) for s in symptoms)
        )
        if req_match == 0:
            continue
            
        # For complex conditions, require at least 50% of required symptoms or at least 2
        min_required = 1 if len(required) == 1 else max(2, len(required) // 2)
        if req_match < min_required:
            continue

        pos_match = sum(
            1 for p in possible
            if any(sym_match(p, s) for s in symptoms)
        )

        total_possible = len(required) + len(possible)
        matched = req_match + pos_match
        confidence = int((matched / max(total_possible, 1)) * 100)

        if req_match == len(required):  # All required symptoms present
            confidence = min(confidence + 20, 95)

        results.append({
            "condition": condition,
            "severity": severity,
            "confidence": confidence,
        })

    # Sort by confidence descending, take top 3
    results.sort(key=lambda x: x["confidence"], reverse=True)
    return results[:3]


def classify_severity(symptoms: set[str], red_flags: list[str], conditions: list[dict]) -> tuple[str, int]:
    # Red flags always win
    if red_flags:
        return RED, 95

    # Check symptom sets with strict matching
    def set_match(s, target_set):
        if s in target_set: return True
        for t in target_set:
            if s == t: return True
            # For phrases, avoid partial matches on common words
            if " " in t and " " not in s: continue
            
            # Modifier check: if target has "severe" or "high", input must have it too
            for modifier in ["severe", "high", "sudden", "persistent"]:
                if modifier in t and modifier not in s:
                    continue # Skip this target
                
            if (len(t) > 10 and s in t) or (len(s) > 10 and t in s):
                # Final check: make sure we aren't matching "stomach pain" with "severe stomach pain"
                # if the "severe" modifier was required
                if "severe" in t and "severe" not in s: continue
                if "high" in t and "high" not in s: continue
                return True
        return False

    yellow_matches = sum(1 for s in symptoms if set_match(s, YELLOW_SYMPTOMS))
    green_matches  = sum(1 for s in symptoms if set_match(s, GREEN_SYMPTOMS))

    # Check top condition severity
    if conditions and conditions[0]["severity"] == RED:
        return RED, 88

    if yellow_matches > 0:
        if conditions and conditions[0]["severity"] == YELLOW:
            confidence = min(60 + yellow_matches * 10, 85)
        else:
            confidence = min(50 + yellow_matches * 8, 80)
        return YELLOW, confidence

    if conditions and conditions[0]["severity"] == YELLOW:
        return YELLOW, 65

    if green_matches > 0:
        return GREEN, min(50 + green_matches * 10, 85)

    # Default — not enough info
    return YELLOW, 40


def run_triage(
    symptoms: list[str],
    age: Optional[int] = None,
    duration_days: Optional[int] = None,
) -> TriageResult:
    """
    Main triage function.
    symptoms: list of symptom strings from user
    age: patient age (optional, affects risk)
    duration_days: how long symptoms have persisted
    """
    symptom_set = extract_symptoms(symptoms)

    if not symptom_set:
        return TriageResult(
            severity=GREEN,
            severity_label=SEVERITY_LABELS[GREEN],
            advice="No symptoms entered. Please describe what you are experiencing.",
            possible_conditions=[],
            matched_symptoms=[],
            risk_flags=[],
            confidence=0,
        )

    red_flags = check_red_flags(symptom_set)
    conditions = match_conditions(symptom_set)
    severity, confidence = classify_severity(symptom_set, red_flags, conditions)

    # Detect gibberish or unknown symptoms
    known_count = sum(1 for s in symptom_set if is_known_symptom(s))
    if known_count == 0 and not red_flags and not conditions:
        return TriageResult(
            severity=GREEN,
            severity_label="Symptom Not Recognized",
            advice="We couldn't recognize your symptoms. Please use standard medical terms like 'fever', 'cough', or 'pain'. Avoid using slang or non-medical words.",
            possible_conditions=[],
            matched_symptoms=[],
            risk_flags=[],
            confidence=0,
        )

    # Age adjustments — elderly and very young are higher risk
    if age is not None:
        if (age >= 65 or age <= 2) and severity == GREEN:
            severity = YELLOW
            confidence = max(confidence, 60)

    # Duration adjustments
    final_advice = SEVERITY_ADVICE[severity]
    if duration_days is not None:
        # Symptoms persisting >3 days escalate to YELLOW if GREEN
        if duration_days >= 3 and severity == GREEN:
            severity = YELLOW
            confidence = max(confidence, 65)
            final_advice = "Your symptoms have persisted for a few days. It's best to consult a doctor to rule out any underlying infection."
        
        # Symptoms persisting >7 days with YELLOW severity increase confidence
        elif duration_days >= 7 and severity == YELLOW:
            confidence = min(confidence + 15, 90)
            final_advice = "Since your symptoms have lasted a week, you should definitely seek medical advice soon."

    return TriageResult(
        severity=severity,
        severity_label=SEVERITY_LABELS[severity],
        advice=final_advice,
        possible_conditions=conditions,
        matched_symptoms=list(symptom_set),
        risk_flags=red_flags,
        confidence=confidence,
    )
