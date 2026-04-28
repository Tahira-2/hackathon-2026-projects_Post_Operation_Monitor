"""
TriageTech Triage Router — Enhanced with Nepali language support
POST /triage/assess   — receives symptoms (EN or NE), returns severity + recommendation
GET  /triage/symptoms/list — categorized symptom list for autocomplete
"""
from fastapi import APIRouter
from api.schemas import TriageRequest, TriageResponse, ConditionResult
from ml.severity_rules import run_triage
from ml.nepali_nlp import translate_symptoms_list, detect_language
from ml.doctor_data import POPULAR_DOCTORS

router = APIRouter(prefix="/triage", tags=["triage"])

# Nepali translations of advice
ADVICE_NE = {
    "green":  "तपाईंका लक्षणहरू हल्का छन्। आराम गर्नुहोस्, पानी पिउनुहोस् र आफ्नो अवस्थाको निगरानी गर्नुहोस्। यदि लक्षणहरू बिग्रन थाले भने चिकित्सकसँग परामर्श गर्नुहोस्।",
    "yellow": "तपाईंका लक्षणहरूले तपाईंलाई २४ घण्टाभित्र स्वास्थ्यकर्मीसँग भेट्न सुझाव दिन्छन्। आफैं औषधि नखानुहोस् र क्लिनिक भ्रमण वा टेलिकन्सल्टेशन बुक गर्नुहोस्।",
    "red":    "तपाईंका लक्षणहरूले गम्भीर वा जीवन-खतरनाक अवस्था संकेत गर्न सक्छन्। तुरुन्तै नजिकको आपतकालीन कक्षमा जानुहोस् वा सहायताको लागि फोन गर्नुहोस्।",
}


@router.post("/assess", response_model=TriageResponse)
def assess_symptoms(request: TriageRequest):
    """
    Triage endpoint. Accepts symptoms in English or Nepali (Devanagari / Romanized).
    Auto-detects language and translates before running engine.
    """
    symptoms = request.symptoms

    # Auto-detect and translate if Nepali
    detected_lang = detect_language(" ".join(symptoms))
    translated = None
    if detected_lang in ("ne", "ne-rom"):
        translated = translate_symptoms_list(symptoms)
        symptoms_for_engine = translated
    else:
        symptoms_for_engine = symptoms

    result = run_triage(
        symptoms=symptoms_for_engine,
        age=request.age,
        duration_days=request.duration_days,
    )

    # specialist mapping
    SPECIALIST_MAP = {
        "chest pain": ("Cardiologist", "मुटु रोग विशेषज्ञ (Cardiologist)"),
        "shortness of breath": ("Pulmonologist", "फोक्सो रोग विशेषज्ञ (Pulmonologist)"),
        "stomach pain": ("Gastroenterologist", "पेट तथा आन्द्रा रोग विशेषज्ञ (Gastroenterologist)"),
        "headache": ("Neurologist", "नसा रोग विशेषज्ञ (Neurologist)"),
        "blurred vision": ("Ophthalmologist", "आँखा विशेषज्ञ (Ophthalmologist)"),
        "fever": ("General Physician", "सामान्य चिकित्सक (General Physician)"),
        "cough": ("General Physician", "सामान्य चिकित्सक (General Physician)"),
        "sore throat": ("ENT Specialist", "नाक, कान, घाँटी विशेषज्ञ (ENT Specialist)"),
    }

    doctor_type = None
    doctor_type_ne = None
    specialist = None
    specialist_ne = None

    if result.confidence > 0:
        doctor_type = "General Physician"
        doctor_type_ne = "सामान्य चिकित्सक"
        
        if result.severity == "red":
            doctor_type = "Emergency Medical Team"
            doctor_type_ne = "आकस्मिक चिकित्सा टोली"
        elif result.severity == "yellow":
            # Check for specific specialists
            for sym in result.matched_symptoms:
                if sym.lower() in SPECIALIST_MAP:
                    specialist, specialist_ne = SPECIALIST_MAP[sym.lower()]
                    break

    # Get suggested doctors for the specialist or doctor type
    suggested_docs = []
    if specialist and specialist in POPULAR_DOCTORS:
        suggested_docs = POPULAR_DOCTORS[specialist]
    elif doctor_type and doctor_type in POPULAR_DOCTORS:
        suggested_docs = POPULAR_DOCTORS[doctor_type]

    return TriageResponse(
        severity=result.severity,
        severity_label=result.severity_label,
        advice=result.advice,
        advice_ne=ADVICE_NE.get(result.severity),
        possible_conditions=[ConditionResult(**c) for c in result.possible_conditions],
        matched_symptoms=result.matched_symptoms,
        risk_flags=result.risk_flags,
        confidence=result.confidence,
        translated_symptoms=translated,
        doctor_type=doctor_type,
        doctor_type_ne=doctor_type_ne,
        specialist_recommendation=specialist,
        specialist_recommendation_ne=specialist_ne,
        suggested_doctors=suggested_docs if suggested_docs else None,
    )


@router.get("/symptoms/list")
def list_symptoms():
    """Return categorized symptom list for frontend autocomplete."""
    from ml.severity_rules import RED_SYMPTOMS, YELLOW_SYMPTOMS, GREEN_SYMPTOMS
    return {
        "emergency": sorted(list(RED_SYMPTOMS)),
        "moderate": sorted(list(YELLOW_SYMPTOMS)),
        "mild": sorted(list(GREEN_SYMPTOMS)),
    }
