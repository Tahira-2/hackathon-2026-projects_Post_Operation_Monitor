"""
TriageTech Nepali NLP Module
Bilingual symptom mapping: Nepali (Devanagari + Romanized) ↔ English
"""

# ── NEPALI DEVANAGARI → ENGLISH SYMPTOM MAP ───────────────────────────────────
NEPALI_TO_ENGLISH = {
    # Head / Neurological
    "टाउको दुख्नु": "headache",
    "टाउको दुखाइ": "headache",
    "गम्भीर टाउको दुखाइ": "severe headache",
    "अचानक टाउको दुखाइ": "sudden severe headache",
    "रिँगटा लाग्नु": "dizziness",
    "चक्कर आउनु": "dizziness",
    "बेहोश हुनु": "unconscious",
    "ढल्नु": "collapsed",
    "अनुहार झुल्नु": "face drooping",
    "खिच्चाको": "seizure",
    "बेहोशी": "fainting",

    # Respiratory
    "खोकी": "cough",
    "सुक्खा खोकी": "dry cough",
    "हल्का खोकी": "mild cough",
    "लगातार खोकी": "persistent cough",
    "खोकीमा रगत": "coughing blood",
    "सास फेर्न गाह्रो": "difficulty breathing",
    "सास फेर्न नसक्नु": "can't breathe",
    "छोटो सास": "shortness of breath",
    "छाती दुख्नु": "chest pain",
    "छाती थिचिएको": "chest tightness",
    "नाक बग्नु": "runny nose",
    "नाक थुनिनु": "stuffy nose",
    "हाछ्युँ": "sneezing",
    "घाँटी दुख्नु": "sore throat",
    "निल्न गाह्रो": "difficulty swallowing",

    # Fever
    "ज्वरो": "fever",
    "उच्च ज्वरो": "high fever",
    "हल्का ज्वरो": "mild fever",
    "तापक्रम बढेको": "high temperature",

    # Gastrointestinal
    "बान्ता": "vomiting",
    "वाकवाकी": "nausea",
    "पखाला": "diarrhea",
    "पेट दुख्नु": "abdominal pain",
    "पेट दुखाइ": "stomach pain",
    "पेटमा ग्यास": "gas",
    "अपच": "indigestion",
    "कब्जियत": "constipation",
    "रगत बान्ता": "vomiting blood",
    "दिसामा रगत": "blood in stool",
    "पेट कडा": "rigid abdomen",

    # Pain
    "पिठ्युँ दुख्नु": "back pain",
    "जोर्नी दुख्नु": "joint pain",
    "मांसपेशी दुखाइ": "muscle ache",
    "दाँत दुख्नु": "toothache",
    "कान दुख्नु": "ear pain",

    # Skin
    "छाला रातो": "rash",
    "छालामा दाग": "skin rash",
    "घाउ": "wound",
    "जलेको": "sunburn",
    "किरा टोकेको": "insect bite",

    # Urinary
    "पिसाब गर्दा दुख्नु": "painful urination",
    "पिसाबमा रगत": "blood in urine",
    "बारम्बार पिसाब": "frequent urination",

    # General
    "थकान": "fatigue",
    "थकावट": "tiredness",
    "कमजोरी": "fatigue",
    "तौल घट्नु": "weight loss unexplained",
    "रात पसिना": "night sweats",
    "सुन्निनु": "swollen lymph nodes",
    "धड्कन बढ्नु": "palpitations",
    "धमिलो देखिनु": "blurred vision",

    # Emergency
    "हृदयघात": "chest pain",
    "मृगौला": "unconscious",
    "आँखा रातो": "eye redness",
    "श्वास अवरोध": "can't breathe",
    "नीला ओठ": "blue lips",
    "ग्रीवा कठोरता": "neck stiffness with fever",
    "विष": "poisoning",
    "सर्पले टोकेको": "snake bite",
}

# ── ROMANIZED NEPALI → ENGLISH SYMPTOM MAP ────────────────────────────────────
ROMANIZED_TO_ENGLISH = {
    # Head
    "tauko duknu": "headache",
    "tauko dukhai": "headache",
    "ringta lagnu": "dizziness",
    "chakkar aunu": "dizziness",
    "behosh hunu": "unconscious",
    "dhalnu": "collapsed",
    "anuhaar jhulnu": "face drooping",
    "khiccha": "seizure",
    "behoshi": "fainting",
    "gambhir tauko dukhai": "sudden severe headache",

    # Respiratory
    "khoki": "cough",
    "sukha khoki": "dry cough",
    "halka khoki": "mild cough",
    "lagatar khoki": "persistent cough",
    "khokima ragat": "coughing blood",
    "sas ferna garo": "difficulty breathing",
    "sas ferna nasak": "can't breathe",
    "chhoto sas": "shortness of breath",
    "chhati duknu": "chest pain",
    "chhati thichieko": "chest tightness",
    "naak bagnu": "runny nose",
    "naak thuninu": "stuffy nose",
    "haachyu": "sneezing",
    "ghanti duknu": "sore throat",
    "nilna garo": "difficulty swallowing",

    # Fever
    "jwaro": "fever",
    "uchcha jwaro": "high fever",
    "halka jwaro": "mild fever",
    "tapakram badheko": "high temperature",

    # GI
    "banta": "vomiting",
    "wakwaki": "nausea",
    "pakhala": "diarrhea",
    "pet duknu": "abdominal pain",
    "pet dukhai": "stomach pain",
    "pet ma gas": "gas",
    "apach": "indigestion",
    "kabziyat": "constipation",
    "ragat banta": "vomiting blood",
    "disa ma ragat": "blood in stool",

    # Pain
    "pithhyu duknu": "back pain",
    "jorni duknu": "joint pain",
    "maspeshi dukhai": "muscle ache",
    "dant duknu": "toothache",
    "kan duknu": "ear pain",

    # Skin
    "chhala rato": "rash",
    "ghau": "wound",
    "kira tookeko": "insect bite",

    # Urinary
    "pisab garda duknu": "painful urination",
    "pisabma ragat": "blood in urine",
    "barambar pisab": "frequent urination",

    # General
    "thakan": "fatigue",
    "thakawat": "tiredness",
    "kamzori": "fatigue",
    "taul ghatnu": "weight loss unexplained",
    "rat pasina": "night sweats",
    "dhadkan badhnu": "palpitations",
    "dhamilo dekhinu": "blurred vision",

    # Emergency
    "nila oth": "blue lips",
    "sar pile tokeko": "snake bite",
    "bish": "poisoning",
}

# Merge all maps
ALL_NEPALI_MAP = {**NEPALI_TO_ENGLISH, **ROMANIZED_TO_ENGLISH}


def translate_symptom(text: str) -> str:
    """
    Try to translate a single symptom from Nepali/Romanized to English.
    Returns original text if no match found.
    """
    t = text.strip().lower()
    # Exact match first
    if t in ALL_NEPALI_MAP:
        return ALL_NEPALI_MAP[t]
    # Partial match (Romanized)
    for key, val in ALL_NEPALI_MAP.items():
        if key in t or t in key:
            return val
    return text  # pass through as-is


def translate_symptoms_list(symptoms: list[str]) -> list[str]:
    """Translate a list of symptoms, preserving originals that don't match."""
    return [translate_symptom(s) for s in symptoms]


def detect_language(text: str) -> str:
    """
    Simple heuristic: if text contains Devanagari Unicode range, it's Nepali.
    Otherwise check for common Romanized Nepali keywords.
    """
    for ch in text:
        if '\u0900' <= ch <= '\u097F':
            return "ne"  # Devanagari
    romanized_keywords = {"jwaro", "khoki", "banta", "pakhala", "tauko", "sas", "chhati", "pet", "ringta"}
    lower = text.lower()
    if any(kw in lower for kw in romanized_keywords):
        return "ne-rom"  # Romanized Nepali
    return "en"
