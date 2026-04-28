"""
TriageTech Translate Router
POST /translate — Nepali ↔ English symptom/text translation
"""
from fastapi import APIRouter
from pydantic import BaseModel
from ml.nepali_nlp import translate_symptoms_list, detect_language, ALL_NEPALI_MAP

router = APIRouter(prefix="/translate", tags=["translation"])


class TranslateRequest(BaseModel):
    symptoms: list[str]


class TranslateResponse(BaseModel):
    original: list[str]
    translated: list[str]
    detected_language: str


@router.post("/symptoms", response_model=TranslateResponse)
def translate_symptoms(request: TranslateRequest):
    """Translate a list of Nepali/Romanized symptoms to English."""
    detected = detect_language(" ".join(request.symptoms))
    translated = translate_symptoms_list(request.symptoms)
    return TranslateResponse(
        original=request.symptoms,
        translated=translated,
        detected_language=detected,
    )


@router.get("/vocabulary")
def get_vocabulary():
    """Return the full Nepali symptom vocabulary for frontend autocomplete."""
    return {
        "nepali_to_english": ALL_NEPALI_MAP,
        "total_terms": len(ALL_NEPALI_MAP),
    }
