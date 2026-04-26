"""
Chat views powered by the AI service (FastAPI).

This endpoint forwards each user message to the AI service, returns AI-generated
follow-up options, and appends doctor/medicine recommendations after triage is done.
"""

import re

from decouple import config
from django.db.models import Q
import httpx
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request

from doctors.models import DoctorProfile
from hackathon_project.utils import ApiResponseAPIView, api_response
from medicines.models import Medicine


MOCK_DOCTORS_BY_SPECIALIZATION = {
    "gastroenterologist": [
        {
            "id": 9001,
            "doctor_name": "Dr. Maya Sharma",
            "specialization": "Gastroenterologist",
            "hospital_name": "Sunrise Digestive Center",
            "phone_number": "+1-555-210-101",
            "source": "mock",
        }
    ],
    "general physician": [
        {
            "id": 9010,
            "doctor_name": "Dr. Aisha Noor",
            "specialization": "General Physician",
            "hospital_name": "Greenfield Clinic",
            "phone_number": "+1-555-210-201",
            "source": "mock",
        }
    ],
}

MOCK_MEDICINES_BY_SPECIALIZATION = {
    "gastroenterologist": [
        {
            "id": 8001,
            "name": "Antacid Plus",
            "description": "Temporary acidity and bloating relief.",
            "category": "Digestive",
            "requires_prescription": False,
            "source": "mock",
        }
    ],
    "general physician": [
        {
            "id": 8010,
            "name": "Paracetamol 500mg",
            "description": "Fever and mild pain relief.",
            "category": "Cold and Flu",
            "requires_prescription": False,
            "source": "mock",
        }
    ],
}


_OPTION_LINE_RE = re.compile(r"^(?P<letter>[A-Da-d])[)\.\s]\s*(?P<text>.+)$", re.MULTILINE)


def _parse_options_from_text(text: str) -> tuple[str, list[dict]]:
    options: list[dict] = []
    option_lines: set[str] = set()

    for match in _OPTION_LINE_RE.finditer(text):
        option_id = match.group("letter").lower()
        option_text = match.group("text").strip()
        options.append({"id": option_id, "label": option_text, "value": option_text})
        option_lines.add(match.group(0))

    clean = text
    for line in option_lines:
        clean = clean.replace(line, "")
    clean = re.sub(r"\n{3,}", "\n\n", clean).strip()

    return clean, options


def _doctor_recommendations(specialization: str) -> list[dict]:
    spec_norm = (specialization or "").strip().lower()
    qs = DoctorProfile.objects.select_related("user")
    if spec_norm:
        qs = qs.filter(specialization__icontains=spec_norm)

    results = [
        {
            "id": d.id,
            "doctor_name": d.user.full_name if d.user else "Doctor",
            "specialization": d.specialization,
            "hospital_name": d.hospital_name,
            "phone_number": d.phone_number,
            "source": "api",
        }
        for d in qs[:3]
    ]

    enable_mock = config("CHAT_ENABLE_MOCK_RECOMMENDATIONS", default=False, cast=bool)
    if results or not enable_mock:
        return results

    return (
        MOCK_DOCTORS_BY_SPECIALIZATION.get(spec_norm)
        or MOCK_DOCTORS_BY_SPECIALIZATION.get("general physician", [])
    )


def _medicine_recommendations(specialization: str) -> list[dict]:
    spec_norm = (specialization or "").strip().lower()
    keyword_map: dict[str, list[str]] = {
        "gastroenterologist": ["acid", "antacid", "digest", "stomach", "nausea"],
        "general physician": ["paracetamol", "cold", "flu", "fever", "vitamin"],
        "neurologist": ["headache", "migraine", "pain"],
        "cardiologist": ["cardio", "heart"],
        "pulmonologist": ["inhaler", "respiratory", "breathing"],
        "orthopedist": ["joint", "bone", "muscle", "pain"],
        "endocrinologist": ["hormone", "thyroid", "fatigue", "vitamin"],
    }

    query = Q()
    for keyword in keyword_map.get(spec_norm, ["wellness", "general"]):
        query |= Q(name__icontains=keyword) | Q(description__icontains=keyword) | Q(category__icontains=keyword)

    meds = Medicine.objects.filter(query)[:4]
    results = [
        {
            "id": m.id,
            "name": m.name,
            "description": m.description,
            "category": m.category,
            "requires_prescription": m.requires_prescription,
            "source": "api",
        }
        for m in meds
    ]

    enable_mock = config("CHAT_ENABLE_MOCK_RECOMMENDATIONS", default=False, cast=bool)
    if results or not enable_mock:
        return results

    return (
        MOCK_MEDICINES_BY_SPECIALIZATION.get(spec_norm)
        or MOCK_MEDICINES_BY_SPECIALIZATION.get("general physician", [])
    )


def _call_ai(session_id: str, message: str, fitness_approved: bool = False) -> dict:
    ai_url = config("AI_CHAT_API_URL", default="http://127.0.0.1:8001/api/chat")
    with httpx.Client(timeout=20.0) as client:
        response = client.post(
            ai_url,
            json={
                "session_id": session_id,
                "message": message,
                "fitness_approved": fitness_approved,
            },
        )
        response.raise_for_status()
        return response.json()


def _build_payload(
    *,
    session_id: str,
    response_text: str,
    confidence: float,
    questions_asked: int,
    specialization: str,
    predicted_condition: str,
    options: list[dict],
    doctors: list[dict],
    medicines: list[dict],
    is_serious: bool,
) -> dict:
    return {
        "session_id": session_id,
        "response": response_text,
        "confidence": confidence,
        "is_serious": is_serious,
        "needs_doctor": is_serious,
        "questions_asked": questions_asked,
        "recommended_specialization": specialization,
        "predicted_condition": predicted_condition,
        "options": options,
        "doctor_recommendations": doctors,
        "medicine_suggestions": medicines,
    }


class ChatMessageView(ApiResponseAPIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Chat"],
        request=OpenApiTypes.OBJECT,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                examples=[
                    OpenApiExample(
                        "Chat response with AI options",
                        value={
                            "result": {
                                "session_id": "mobile-17140000",
                                "response": "How many hours did you sleep last night?",
                                "confidence": 0.45,
                                "is_serious": False,
                                "needs_doctor": False,
                                "questions_asked": 1,
                                "recommended_specialization": "gastroenterologist",
                                "predicted_condition": "",
                                "options": [
                                    {"id": "a", "label": "Under 5 hours", "value": "Under 5 hours"},
                                    {"id": "b", "label": "5-6 hours", "value": "5-6 hours"},
                                    {"id": "c", "label": "7-8 hours", "value": "7-8 hours"},
                                    {"id": "d", "label": "Other / I am not sure", "value": "I am not sure"},
                                ],
                                "doctor_recommendations": [],
                                "medicine_suggestions": [],
                            },
                            "isSuccess": True,
                            "statusCode": 200,
                            "errorMessage": [],
                        },
                    )
                ],
            )
        },
    )
    def post(self, request: Request):
        session_id = str(request.data.get("session_id", "")).strip()
        message = str(request.data.get("message", "")).strip()
        fitness_approved = bool(request.data.get("fitness_approved", False))

        if not session_id:
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                error_message=["session_id is required."],
            )

        if not message:
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                error_message=["message is required."],
            )

        try:
            ai_body = _call_ai(session_id, message, fitness_approved)
        except Exception as exc:
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_502_BAD_GATEWAY,
                error_message=[
                    "AI is currently not available. Please try again later.",
                    str(exc),
                ],
            )

        raw_response = str(ai_body.get("response", "")).strip()
        confidence = float(ai_body.get("confidence", 0.0))
        is_serious = bool(ai_body.get("is_serious", False))
        needs_doctor = bool(ai_body.get("needs_doctor", False))
        questions_asked = int(ai_body.get("questions_asked", 0))
        specialization = str(ai_body.get("recommended_specialization", "")).strip().lower()

        ai_options = ai_body.get("options", [])
        if isinstance(ai_options, list) and ai_options:
            options = [
                {
                    "id": str(item.get("id", "")).strip().lower() or "a",
                    "label": str(item.get("label", "")).strip(),
                    "value": str(item.get("value", item.get("label", ""))).strip(),
                }
                for item in ai_options
                if isinstance(item, dict)
            ]
            clean_response = raw_response
        else:
            clean_response, options = _parse_options_from_text(raw_response)

        conversation_finished = needs_doctor or (confidence >= 0.65 and not options)

        doctors: list[dict] = []
        medicines: list[dict] = []
        predicted_condition = ""

        if conversation_finished and specialization:
            doctors = _doctor_recommendations(specialization)
            medicines = _medicine_recommendations(specialization)
            predicted_condition = specialization.replace("_", " ").title()

        payload = _build_payload(
            session_id=session_id,
            response_text=clean_response,
            confidence=confidence,
            questions_asked=questions_asked,
            specialization=specialization,
            predicted_condition=predicted_condition,
            options=options,
            doctors=doctors,
            medicines=medicines,
            is_serious=is_serious,
        )

        return api_response(
            result=payload,
            is_success=True,
            status_code=status.HTTP_200_OK,
            error_message=[],
        )
