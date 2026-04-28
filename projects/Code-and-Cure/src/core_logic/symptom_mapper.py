"""Symptom-to-specialty mapping — expanded cue dictionary with per-specialty rationale."""

from src.core_logic.models import SpecialtyRecommendation, SymptomInput

DEFAULT_TRIAGE_RULES: dict[str, dict] = {
    "Cardiology": {
        "department": ("Navigation",),
        "rationale": "Your symptoms may indicate a cardiac condition. A cardiologist specializes in heart and cardiovascular health and can evaluate and treat these concerns.",
        "cues": (
            "chest pain", "chest tightness", "chest discomfort", "chest pressure",
            "palpitations", "heart racing", "racing heart", "heart pounding",
            "irregular heartbeat", "skipping beats", "fast heartbeat", "slow heartbeat",
            "pressure in chest", "high blood pressure", "hypertension", "cholesterol",
            "heart attack", "angina", "arrhythmia", "afib", "atrial fibrillation",
            "swollen legs", "fainting", "syncope", "heart murmur", "blood pressure",
            "cardiovascular", "shortness of breath", "breathlessness", "breathless",
            "heart failure", "congestive", "edema", "flutter",
        ),
    },
    "Pulmonology": {
        "department": ("Navigation",),
        "rationale": "Your respiratory symptoms may benefit from evaluation by a pulmonologist, who specializes in lungs and breathing disorders.",
        "cues": (
            "cough", "coughing", "dry cough", "wet cough", "productive cough", "persistent cough",
            "wheezing", "asthma", "breathing trouble", "chronic cough", "lung pain",
            "difficulty breathing", "can't breathe", "trouble breathing",
            "respiratory", "copd", "emphysema", "bronchitis", "pneumonia",
            "sleep apnea", "coughing blood", "hemoptysis", "chest congestion",
            "lung infection", "breathless", "breathlessness", "oxygen", "inhaler",
            "pleural", "pulmonary", "lung disease", "smoker's cough",
        ),
    },
    "Neurology": {
        "department": ("Navigation",),
        "rationale": "Your neurological symptoms—such as headaches, dizziness, or sensory changes—warrant evaluation by a neurologist.",
        "cues": (
            "headache", "head pain", "head ache", "frequent headaches",
            "migraine", "aura", "persistent headache", "dizziness", "dizzy",
            "numbness", "seizure", "memory loss", "tingling", "neurological",
            "confusion", "balance problems", "poor coordination", "tremor", "shaking",
            "vision changes", "blurred vision", "double vision", "blackout",
            "loss of consciousness", "epilepsy", "nerve pain", "pins and needles",
            "vertigo", "lightheaded", "lightheadedness", "brain fog", "stroke",
            "weakness one side", "face drooping", "slurred speech", "twitching",
            "concussion", "head injury", "meningitis",
            "brain hurts", "brain pain", "pressure in head", "head pressure", "skull pain",
        ),
    },
    "Dermatology": {
        "department": ("Navigation",),
        "rationale": "Skin, hair, and nail conditions are best evaluated and treated by a dermatologist.",
        "cues": (
            "rash", "rashes", "itch", "itchy", "itching", "hives", "eczema",
            "skin irritation", "red patches", "acne", "psoriasis",
            "dry skin", "flaky skin", "blisters", "warts", "moles", "lesion",
            "sunburn", "redness on skin", "dermatitis", "hair loss", "alopecia", "scalp",
            "nail infection", "ringworm", "fungal infection", "peeling skin", "rosacea",
            "dark spots", "discoloration", "pigmentation", "boil", "cyst on skin",
            "seborrhea", "dandruff", "vitiligo", "skin cancer", "melanoma",
        ),
    },
    "Gastroenterology": {
        "department": ("Navigation",),
        "rationale": "Digestive and gastrointestinal symptoms are best evaluated by a gastroenterologist.",
        "cues": (
            "stomach pain", "abdominal pain", "diarrhea", "diarrhoea", "vomiting",
            "nausea", "bloating", "indigestion", "heartburn", "acid reflux",
            "constipation", "bowel problems", "rectal bleeding", "blood in stool",
            "stomach cramps", "gas", "cramping", "irritable bowel", "ibs",
            "crohn", "ulcer", "gastric", "stomach upset", "loss of appetite",
            "trouble swallowing", "dysphagia", "colonoscopy", "fatty liver",
            "gallbladder", "gallstones", "pancreatitis", "celiac", "hepatitis",
            "liver pain", "jaundice", "yellow skin", "burping", "reflux",
        ),
    },
    "Nephrology": {
        "department": ("Navigation",),
        "rationale": "Kidney and urinary symptoms should be assessed by a nephrologist.",
        "cues": (
            "kidney pain", "flank pain", "painful urination", "burning urination",
            "blood in urine", "frequent urination", "urinary pain", "kidney",
            "kidney stone", "urinary tract", "uti", "cloudy urine", "foamy urine",
            "swollen ankles", "edema", "renal", "dialysis", "creatinine",
            "kidney failure", "uremia", "protein in urine",
        ),
    },
    "Orthopedics": {
        "department": ("Navigation",),
        "rationale": "Bone, joint, and musculoskeletal issues are best treated by an orthopedic specialist.",
        "cues": (
            "joint pain", "knee pain", "back pain", "fracture", "sprain",
            "shoulder pain", "bone", "arthritis", "tendon", "ligament",
            "hip pain", "ankle pain", "wrist pain", "elbow pain", "sports injury",
            "torn ligament", "swollen joint", "stiff joint", "neck pain", "spine",
            "disc", "sciatica", "lower back pain", "upper back pain",
            "muscle pain", "muscle cramps", "pulled muscle", "rotator cuff",
            "meniscus", "cartilage", "bursitis", "scoliosis", "carpal tunnel",
            "frozen shoulder", "tennis elbow",
        ),
    },
    "ENT": {
        "department": ("Navigation",),
        "rationale": "Ear, nose, and throat conditions should be evaluated by an ENT specialist (Otolaryngologist).",
        "cues": (
            "sore throat", "throat pain", "runny nose", "sneezing", "congestion",
            "stuffy nose", "blocked nose", "nasal drip", "common cold",
            "ear pain", "earache", "sinus pain", "hearing loss",
            "tonsil", "tonsillitis", "nasal congestion", "post nasal drip",
            "ear infection", "ringing ears", "tinnitus", "sinusitis", "adenoids",
            "voice hoarseness", "hoarse voice", "laryngitis", "strep throat",
            "difficulty hearing", "ear wax", "nosebleed", "snoring",
            "smell loss", "loss of smell", "taste loss", "loss of taste",
            "deviated septum", "polyps", "ear discharge",
        ),
    },
    "Psychiatry": {
        "department": ("Navigation",),
        "rationale": "Mental health and emotional wellbeing are best addressed by a psychiatrist or mental health professional.",
        "cues": (
            "anxiety", "depression", "panic attack", "insomnia", "mental health",
            "stress", "worried", "sad all the time", "hopeless", "mood swings",
            "bipolar", "ocd", "ptsd", "trauma", "phobia", "anger issues",
            "sleep problems", "can't sleep", "nightmares", "hallucination",
            "paranoia", "social anxiety", "eating disorder", "suicidal thoughts",
            "grief", "burnout", "emotional", "psychological", "therapist",
            "antidepressant", "schizophrenia", "delusions",
        ),
    },
    "Endocrinology": {
        "department": ("Navigation",),
        "rationale": "Hormonal and metabolic conditions like diabetes and thyroid issues are best managed by an endocrinologist.",
        "cues": (
            "diabetes", "blood sugar", "thyroid", "weight gain unexplained",
            "unexplained weight loss", "hormone", "insulin", "hyperthyroid",
            "hypothyroid", "goiter", "adrenal", "cortisol", "excessive thirst",
            "polydipsia", "pcos", "menstrual irregularity", "hair thinning",
            "metabolism", "hypoglycemia", "high glucose", "low blood sugar",
            "always thirsty", "always hungry", "fatigue with weight change",
        ),
    },
    "Urology": {
        "department": ("Navigation",),
        "rationale": "Urological conditions affecting the bladder, prostate, and male reproductive system require a urologist.",
        "cues": (
            "prostate", "bladder problems", "erectile dysfunction", "impotence",
            "urinary incontinence", "kidney stone", "testicular pain",
            "blood in urine", "nocturia", "difficulty urinating", "urinary retention",
            "overactive bladder", "prostate cancer", "bladder cancer",
            "weak urine stream", "painful ejaculation",
        ),
    },
    "Ophthalmology": {
        "department": ("Navigation",),
        "rationale": "Eye conditions and vision problems require evaluation by an ophthalmologist.",
        "cues": (
            "eye pain", "vision loss", "blurred vision", "double vision", "floaters",
            "eye redness", "dry eyes", "watery eyes", "cataracts", "glaucoma",
            "retina", "eye infection", "conjunctivitis", "pink eye",
            "light sensitivity", "photophobia", "eye strain", "eye pressure",
            "seeing spots", "flashes of light",
        ),
    },
    "Gynecology": {
        "department": ("Navigation",),
        "rationale": "Reproductive and women's health concerns are best addressed by a gynecologist or OB-GYN.",
        "cues": (
            "menstrual", "period pain", "vaginal discharge", "pelvic pain",
            "pregnancy", "pregnant", "ovarian cyst", "endometriosis",
            "uterine", "fertility", "menopause", "hot flashes", "pap smear",
            "cervical", "breast pain", "irregular periods", "heavy periods",
            "fibroid", "miscarriage", "prenatal", "cramping during period",
        ),
    },
    "Rheumatology": {
        "department": ("Navigation",),
        "rationale": "Autoimmune and inflammatory joint conditions require evaluation by a rheumatologist.",
        "cues": (
            "rheumatoid", "lupus", "gout", "fibromyalgia", "autoimmune",
            "joint inflammation", "swollen joints", "morning stiffness",
            "sjogren", "scleroderma", "vasculitis", "inflammatory arthritis",
        ),
    },
    "Oncology": {
        "department": ("Navigation",),
        "rationale": "Cancer-related symptoms and abnormal growths require evaluation by an oncologist.",
        "cues": (
            "cancer", "tumor", "lump", "mass", "chemotherapy", "radiation",
            "biopsy", "lymph node", "swollen lymph nodes", "unexplained weight loss",
            "night sweats with fever", "leukemia", "lymphoma",
        ),
    },
    "General Practice": {
        "department": ("Navigation",),
        "rationale": "A primary care physician can evaluate your symptoms, provide initial treatment, and refer you to a specialist if needed.",
        "cues": (
            "fever", "body ache", "fatigue", "tired", "exhausted", "malaise",
            "weakness", "flu", "chills", "feeling unwell", "sick",
            "not feeling well", "under the weather",
            "annual checkup", "checkup", "physical exam", "general", "routine",
            "vaccination", "vaccine", "prescription refill",
        ),
    },
}

DEFAULT_FALLBACK_SPECIALTY = "General Practice"
DEFAULT_FALLBACK_DEPARTMENT = "Navigation"


def _normalize_symptom(raw_symptom: str) -> str:
    return " ".join(raw_symptom.strip().lower().split())


def map_symptom_to_specialty(
    symptom_input: SymptomInput,
    triage_rules: dict | None = None,
    fallback_specialty: str = DEFAULT_FALLBACK_SPECIALTY,
    fallback_department: str = DEFAULT_FALLBACK_DEPARTMENT,
) -> SpecialtyRecommendation:
    normalized = _normalize_symptom(symptom_input.symptom)
    words = set(normalized.split())
    active_rules = triage_rules or DEFAULT_TRIAGE_RULES

    best_specialty = fallback_specialty
    best_department = fallback_department
    best_matched_cues: list[str] = []
    best_rationale = active_rules.get(fallback_specialty, {}).get(
        "rationale",
        "A primary care physician can evaluate your symptoms and refer you to a specialist if needed.",
    )
    best_score = 0

    for specialty, rule in active_rules.items():
        cues = rule.get("cues", ())
        # Phrase match: multi-word or single-word cue is a substring of the full text
        phrase_matched = [cue for cue in cues if cue in normalized]
        # Token match: single-word cues that match exactly a word token (catches "dizzy" vs "dizziness")
        token_matched = [
            cue for cue in cues
            if " " not in cue and cue in words and cue not in phrase_matched
        ]
        matched = phrase_matched + token_matched
        score = len(matched)

        if score > best_score:
            best_score = score
            best_specialty = specialty
            best_department = rule.get("department", (fallback_department,))[0]
            best_matched_cues = matched
            best_rationale = rule.get("rationale", "Recommendation based on your symptoms.")

    confidence = min(0.95, 0.55 + (0.08 * best_score)) if best_score > 0 else 0.40

    return SpecialtyRecommendation(
        specialty=best_specialty,
        department=best_department,
        rationale=best_rationale,
        source_symptom=normalized,
        matched_cues=best_matched_cues,
        confidence=round(confidence, 2),
    )
