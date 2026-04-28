import os
import json
import logging

from fastapi import APIRouter, Depends
from src.api.models import SymptomRequest, TriageResponse
from src.api.dependencies import require_role
from src.core_logic.symptom_mapper import map_symptom_to_specialty
from src.core_logic import detect_red_flag_escalation, SymptomInput

logger = logging.getLogger(__name__)

router = APIRouter()

_SPECIALTIES = [
    "Cardiology", "Pulmonology", "Neurology", "Dermatology",
    "Gastroenterology", "Nephrology", "Orthopedics", "ENT",
    "Psychiatry", "Endocrinology", "Urology", "Ophthalmology",
    "Gynecology", "Rheumatology", "Oncology", "General Practice",
]

_SYSTEM_PROMPT = """You are a clinical triage assistant. A patient will describe their symptoms in plain language.
Your job is to identify the MOST APPROPRIATE medical specialty for their primary complaint.

Respond with ONLY a valid JSON object — no extra text, no markdown fences:
{
  "specialty": "<specialty>",
  "rationale": "<1–2 sentence explanation that references the patient's specific symptoms>",
  "confidence": <number between 0.55 and 0.95>
}

Allowed specialties (pick exactly ONE):
Cardiology, Pulmonology, Neurology, Dermatology, Gastroenterology, Nephrology,
Orthopedics, ENT, Psychiatry, Endocrinology, Urology, Ophthalmology,
Gynecology, Rheumatology, Oncology, General Practice

Strict clinical routing rules — follow these precisely:
- Headache (with or without nausea, light sensitivity, or aura) → Neurology
- Migraine, dizziness, vertigo, numbness, tingling, memory problems → Neurology
- Cough, shortness of breath, wheezing, breathing difficulty (non-cardiac) → Pulmonology
- Sore throat, ear pain, earache, runny nose, nasal congestion, sneezing, sinus pain → ENT
- Skin rash, itching, hives, acne, eczema, psoriasis, skin lesions → Dermatology
- Stomach pain, nausea, vomiting, diarrhea, heartburn, bloating → Gastroenterology
- Joint pain, bone pain, back pain, knee/shoulder/hip pain, sports injury → Orthopedics
- Chest pain, palpitations, irregular heartbeat, high blood pressure → Cardiology
- Anxiety, depression, insomnia, panic attacks, mood problems → Psychiatry
- Eye pain, vision changes, blurred vision, eye redness → Ophthalmology
- Diabetes, thyroid issues, hormone imbalance, unexplained weight changes → Endocrinology
- Urinary pain, prostate issues, kidney stones → Urology/Nephrology
- Menstrual issues, pelvic pain, pregnancy concerns → Gynecology
- Fever alone is ambiguous — look at accompanying symptoms to determine specialty
- General Practice ONLY when: (a) symptoms genuinely span multiple unrelated systems, (b) routine checkup/vaccination, (c) prescription refill, (d) truly cannot determine a specific specialist
- NEVER default to General Practice when a more specific specialist clearly applies"""


async def _openai_triage(symptoms: str) -> dict | None:
    """Call GPT-4o-mini for specialty triage. Returns parsed dict or None on any failure."""
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key or api_key.startswith("sk-proj-YOUR"):
        return None
    try:
        from openai import AsyncOpenAI  # lazy import — same pattern as transcriber.py
        client = AsyncOpenAI(api_key=api_key)
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user",   "content": f"Patient symptoms: {symptoms}"},
            ],
            max_tokens=300,
            temperature=0.1,
            response_format={"type": "json_object"},
        )
        raw = (resp.choices[0].message.content or "{}").strip()
        data = json.loads(raw)
        specialty = data.get("specialty", "")
        if specialty not in _SPECIALTIES:
            logger.warning("OpenAI returned unrecognised specialty %r — falling back to rules", specialty)
            return None
        return data
    except Exception as exc:
        logger.warning("OpenAI triage error (%s) — falling back to keyword rules", exc)
        return None


@router.post("/analyze", response_model=TriageResponse, dependencies=[Depends(require_role("patient"))])
async def analyze_symptoms(request: SymptomRequest):
    """
    AI Care Navigator — tries GPT-4o-mini first, falls back to rule-based keyword mapper.
    """
    check_text = request.symptoms
    if request.red_flag_context:
        check_text = f"{request.symptoms} {request.red_flag_context}"

    # 1. Emergency escalation — always runs first
    escalation = detect_red_flag_escalation(check_text)
    if escalation.escalation_required:
        return TriageResponse(
            recommended_specialty="Emergency Medicine",
            department="Navigation",
            rationale=escalation.escalation_reason,
            extracted_symptom_cues=escalation.matched_red_flags,
            confidence=0.99,
        )

    # 2. GPT-4o-mini triage (when OPENAI_API_KEY is set)
    openai_result = await _openai_triage(request.symptoms)
    if openai_result:
        return TriageResponse(
            recommended_specialty=openai_result["specialty"],
            department="Navigation",
            rationale=openai_result.get(
                "rationale",
                "Based on your symptoms, this specialist is best positioned to help."
            ),
            extracted_symptom_cues=[],
            confidence=float(openai_result.get("confidence", 0.80)),
        )

    # 3. Keyword-based fallback (no API key or OpenAI unavailable)
    result = map_symptom_to_specialty(SymptomInput(symptom=request.symptoms))
    return TriageResponse(
        recommended_specialty=result.specialty,
        department=result.department,
        rationale=result.rationale,
        extracted_symptom_cues=result.matched_cues,
        confidence=result.confidence,
    )
