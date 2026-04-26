from copy import deepcopy

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
		},
		{
			"id": 9002,
			"doctor_name": "Dr. Ethan Blake",
			"specialization": "Gastroenterologist",
			"hospital_name": "City Care Hospital",
			"phone_number": "+1-555-210-102",
			"source": "mock",
		},
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
	"neurologist": [
		{
			"id": 9015,
			"doctor_name": "Dr. Liam D'Souza",
			"specialization": "Neurologist",
			"hospital_name": "Metro Neuro Center",
			"phone_number": "+1-555-210-301",
			"source": "mock",
		}
	],
	"cardiologist": [
		{
			"id": 9020,
			"doctor_name": "Dr. Priya Menon",
			"specialization": "Cardiologist",
			"hospital_name": "Heartline Hospital",
			"phone_number": "+1-555-210-401",
			"source": "mock",
		}
	],
}

MOCK_MEDICINES_BY_CONDITION = {
	"gastritis": [
		{
			"id": 8001,
			"name": "Antacid Plus",
			"description": "Temporary acidity and bloating relief.",
			"category": "Digestive",
			"requires_prescription": False,
			"source": "mock",
		},
		{
			"id": 8002,
			"name": "Omeprazole 20mg",
			"description": "Acid reduction support. Use after medical advice.",
			"category": "Digestive",
			"requires_prescription": True,
			"source": "mock",
		},
	],
	"common cold": [
		{
			"id": 8010,
			"name": "Paracetamol 500mg",
			"description": "Fever and mild pain relief.",
			"category": "Cold and Flu",
			"requires_prescription": False,
			"source": "mock",
		}
	],
	"tension headache": [
		{
			"id": 8030,
			"name": "Ibuprofen 200mg",
			"description": "Short-term headache pain relief.",
			"category": "Pain Relief",
			"requires_prescription": False,
			"source": "mock",
		}
	],
	"cardiac warning": [
		{
			"id": 8040,
			"name": "Electrolyte Hydration Drink",
			"description": "Supportive hydration while waiting for medical review.",
			"category": "Wellness",
			"requires_prescription": False,
			"source": "mock",
		}
	],
	"general wellness": [
		{
			"id": 8020,
			"name": "ORS Sachet",
			"description": "Hydration support for mild dehydration.",
			"category": "Wellness",
			"requires_prescription": False,
			"source": "mock",
		}
	],
}


QUESTION_FLOWS = {
	"gastritis": [
		{
			"id": "sleep_hours",
			"question": "How many hours did you sleep yesterday?",
			"options": [
				{"id": "a", "label": "1-2 hrs", "value": "I slept 1 to 2 hours."},
				{"id": "b", "label": "3-4 hrs", "value": "I slept 3 to 4 hours."},
				{"id": "c", "label": "5-6 hrs", "value": "I slept 5 to 6 hours."},
				{"id": "d", "label": "7+ hrs", "value": "I slept at least 7 hours."},
			],
		},
		{
			"id": "pain_location",
			"question": "Where is your stomach pain mostly located?",
			"options": [
				{"id": "a", "label": "Upper abdomen", "value": "The pain is in my upper abdomen."},
				{"id": "b", "label": "Lower abdomen", "value": "The pain is in my lower abdomen."},
				{"id": "c", "label": "Around navel", "value": "The pain is around my navel."},
				{"id": "d", "label": "Whole stomach", "value": "The pain is across my whole stomach."},
			],
		},
		{
			"id": "pain_intensity",
			"question": "How strong is the pain right now?",
			"options": [
				{"id": "a", "label": "Mild (1-3)", "value": "The pain is mild."},
				{"id": "b", "label": "Moderate (4-6)", "value": "The pain is moderate."},
				{"id": "c", "label": "Severe (7-10)", "value": "The pain is severe."},
			],
		},
		{
			"id": "pain_timing",
			"question": "When does the pain feel worse?",
			"options": [
				{"id": "a", "label": "Before meals", "value": "The pain gets worse before meals."},
				{"id": "b", "label": "After meals", "value": "The pain gets worse after meals."},
				{"id": "c", "label": "At night", "value": "The pain gets worse at night."},
				{"id": "d", "label": "No clear pattern", "value": "I do not notice any clear pattern."},
			],
		},
		{
			"id": "nausea",
			"question": "Do you also feel nausea or vomiting?",
			"options": [
				{"id": "a", "label": "No", "value": "I do not have nausea or vomiting."},
				{"id": "b", "label": "Only nausea", "value": "I have nausea but no vomiting."},
				{"id": "c", "label": "Both", "value": "I have both nausea and vomiting."},
			],
		},
		{
			"id": "bloating",
			"question": "Any bloating, gas, or belching today?",
			"options": [
				{"id": "a", "label": "None", "value": "I do not feel bloating or gas."},
				{"id": "b", "label": "Mild", "value": "I have mild bloating or gas."},
				{"id": "c", "label": "Frequent", "value": "I have frequent bloating or gas."},
			],
		},
		{
			"id": "food_trigger",
			"question": "Did spicy, oily, or late-night food trigger this?",
			"options": [
				{"id": "a", "label": "Yes, spicy/oily", "value": "Yes, spicy or oily food triggered this."},
				{"id": "b", "label": "Yes, late-night meal", "value": "Yes, a late-night meal triggered this."},
				{"id": "c", "label": "No clear trigger", "value": "I do not know any food trigger."},
			],
		},
		{
			"id": "hydration",
			"question": "How much water did you drink today?",
			"options": [
				{"id": "a", "label": "< 1 liter", "value": "I drank less than 1 liter."},
				{"id": "b", "label": "1-2 liters", "value": "I drank around 1 to 2 liters."},
				{"id": "c", "label": "> 2 liters", "value": "I drank more than 2 liters."},
			],
		},
		{
			"id": "bowel_change",
			"question": "Any bowel changes with this pain?",
			"options": [
				{"id": "a", "label": "No change", "value": "No bowel changes."},
				{"id": "b", "label": "Constipation", "value": "I also have constipation."},
				{"id": "c", "label": "Loose stools", "value": "I also have loose stools."},
			],
		},
		{
			"id": "duration",
			"question": "How long has this been happening?",
			"options": [
				{"id": "a", "label": "Today only", "value": "It started today."},
				{"id": "b", "label": "2-3 days", "value": "It has been 2 to 3 days."},
				{"id": "c", "label": "4-7 days", "value": "It has been 4 to 7 days."},
				{"id": "d", "label": "> 1 week", "value": "It has been more than 1 week."},
			],
		},
	],
	"common cold": [
		{
			"id": "symptom_start",
			"question": "When did your cold symptoms start?",
			"options": [
				{"id": "a", "label": "Today", "value": "Symptoms started today."},
				{"id": "b", "label": "2-3 days ago", "value": "Symptoms started 2 to 3 days ago."},
				{"id": "c", "label": "4+ days ago", "value": "Symptoms started more than 4 days ago."},
			],
		},
		{
			"id": "fever",
			"question": "Do you have fever?",
			"options": [
				{"id": "a", "label": "No fever", "value": "I do not have fever."},
				{"id": "b", "label": "Mild fever", "value": "I have mild fever."},
				{"id": "c", "label": "High fever", "value": "I have high fever."},
			],
		},
		{
			"id": "cough_type",
			"question": "How is your cough?",
			"options": [
				{"id": "a", "label": "No cough", "value": "I do not have cough."},
				{"id": "b", "label": "Dry cough", "value": "I have dry cough."},
				{"id": "c", "label": "Wet cough", "value": "I have wet cough."},
			],
		},
		{
			"id": "sore_throat",
			"question": "Do you have sore throat?",
			"options": [
				{"id": "a", "label": "No", "value": "I do not have sore throat."},
				{"id": "b", "label": "Mild", "value": "I have mild sore throat."},
				{"id": "c", "label": "Severe", "value": "I have severe sore throat."},
			],
		},
		{
			"id": "runny_nose",
			"question": "Are you having runny or blocked nose?",
			"options": [
				{"id": "a", "label": "Neither", "value": "I do not have runny or blocked nose."},
				{"id": "b", "label": "Runny nose", "value": "I have runny nose."},
				{"id": "c", "label": "Blocked nose", "value": "I have blocked nose."},
			],
		},
		{
			"id": "body_ache",
			"question": "Any body ache or fatigue?",
			"options": [
				{"id": "a", "label": "No", "value": "No body ache or fatigue."},
				{"id": "b", "label": "Mild", "value": "Mild body ache or fatigue."},
				{"id": "c", "label": "Moderate/Severe", "value": "Moderate to severe body ache or fatigue."},
			],
		},
		{
			"id": "hydration_cold",
			"question": "How much fluid are you drinking daily?",
			"options": [
				{"id": "a", "label": "Low", "value": "My fluid intake is low."},
				{"id": "b", "label": "Moderate", "value": "My fluid intake is moderate."},
				{"id": "c", "label": "Good", "value": "My fluid intake is good."},
			],
		},
		{
			"id": "breathing",
			"question": "Any shortness of breath or chest tightness?",
			"options": [
				{"id": "a", "label": "No", "value": "I do not have shortness of breath or chest tightness."},
				{"id": "b", "label": "Sometimes", "value": "I sometimes feel shortness of breath or chest tightness."},
				{"id": "c", "label": "Often", "value": "I often feel shortness of breath or chest tightness."},
			],
		},
	],
	"tension headache": [
		{
			"id": "headache_duration",
			"question": "How long does the headache last?",
			"options": [
				{"id": "a", "label": "< 1 hour", "value": "It lasts less than 1 hour."},
				{"id": "b", "label": "1-4 hours", "value": "It lasts 1 to 4 hours."},
				{"id": "c", "label": "> 4 hours", "value": "It lasts more than 4 hours."},
			],
		},
		{
			"id": "headache_side",
			"question": "Where do you feel it most?",
			"options": [
				{"id": "a", "label": "Both sides", "value": "I feel it on both sides."},
				{"id": "b", "label": "One side", "value": "I feel it on one side."},
				{"id": "c", "label": "Back of head", "value": "I feel it at the back of my head."},
			],
		},
		{
			"id": "headache_intensity",
			"question": "How intense is the headache?",
			"options": [
				{"id": "a", "label": "Mild", "value": "The headache is mild."},
				{"id": "b", "label": "Moderate", "value": "The headache is moderate."},
				{"id": "c", "label": "Severe", "value": "The headache is severe."},
			],
		},
		{
			"id": "stress_level",
			"question": "How stressed were you today?",
			"options": [
				{"id": "a", "label": "Low", "value": "My stress level was low."},
				{"id": "b", "label": "Moderate", "value": "My stress level was moderate."},
				{"id": "c", "label": "High", "value": "My stress level was high."},
			],
		},
		{
			"id": "screen_time",
			"question": "How long was your screen time today?",
			"options": [
				{"id": "a", "label": "< 4 hrs", "value": "My screen time was less than 4 hours."},
				{"id": "b", "label": "4-8 hrs", "value": "My screen time was 4 to 8 hours."},
				{"id": "c", "label": "> 8 hrs", "value": "My screen time was more than 8 hours."},
			],
		},
		{
			"id": "sleep_headache",
			"question": "How many hours did you sleep yesterday?",
			"options": [
				{"id": "a", "label": "1-3 hrs", "value": "I slept 1 to 3 hours."},
				{"id": "b", "label": "4-6 hrs", "value": "I slept 4 to 6 hours."},
				{"id": "c", "label": "7+ hrs", "value": "I slept at least 7 hours."},
			],
		},
		{
			"id": "noise_light",
			"question": "Do noise or bright lights worsen it?",
			"options": [
				{"id": "a", "label": "No", "value": "Noise and bright lights do not worsen it."},
				{"id": "b", "label": "Sometimes", "value": "Noise and bright lights sometimes worsen it."},
				{"id": "c", "label": "Yes", "value": "Noise and bright lights clearly worsen it."},
			],
		},
		{
			"id": "nausea_headache",
			"question": "Any nausea, dizziness, or blurred vision with headache?",
			"options": [
				{"id": "a", "label": "None", "value": "I do not have these symptoms."},
				{"id": "b", "label": "One symptom", "value": "I have one of these symptoms."},
				{"id": "c", "label": "More than one", "value": "I have more than one of these symptoms."},
			],
		},
	],
	"cardiac warning": [
		{
			"id": "chest_pain_type",
			"question": "How would you describe the chest discomfort?",
			"options": [
				{"id": "a", "label": "Pressure/tightness", "value": "It feels like pressure or tightness."},
				{"id": "b", "label": "Sharp pain", "value": "It feels like sharp pain."},
				{"id": "c", "label": "Burning", "value": "It feels like burning."},
			],
		},
		{
			"id": "pain_duration_cardiac",
			"question": "How long does this discomfort usually last?",
			"options": [
				{"id": "a", "label": "< 5 min", "value": "It usually lasts less than 5 minutes."},
				{"id": "b", "label": "5-15 min", "value": "It usually lasts 5 to 15 minutes."},
				{"id": "c", "label": "> 15 min", "value": "It usually lasts more than 15 minutes."},
			],
		},
		{
			"id": "radiation",
			"question": "Does pain spread to arm, jaw, or back?",
			"options": [
				{"id": "a", "label": "No", "value": "The pain does not spread."},
				{"id": "b", "label": "Sometimes", "value": "The pain sometimes spreads to arm, jaw, or back."},
				{"id": "c", "label": "Yes frequently", "value": "The pain frequently spreads to arm, jaw, or back."},
			],
		},
		{
			"id": "breathlessness_cardiac",
			"question": "Do you feel breathless during this episode?",
			"options": [
				{"id": "a", "label": "No", "value": "I do not feel breathless."},
				{"id": "b", "label": "Mild", "value": "I feel mildly breathless."},
				{"id": "c", "label": "Severe", "value": "I feel severely breathless."},
			],
		},
		{
			"id": "sweating",
			"question": "Any sudden sweating, nausea, or dizziness?",
			"options": [
				{"id": "a", "label": "None", "value": "I do not have these symptoms."},
				{"id": "b", "label": "One symptom", "value": "I have one of these symptoms."},
				{"id": "c", "label": "Multiple symptoms", "value": "I have multiple of these symptoms."},
			],
		},
		{
			"id": "activity_trigger",
			"question": "Does activity or climbing stairs trigger this?",
			"options": [
				{"id": "a", "label": "No", "value": "Activity does not trigger it."},
				{"id": "b", "label": "Sometimes", "value": "Activity sometimes triggers it."},
				{"id": "c", "label": "Yes", "value": "Activity clearly triggers it."},
			],
		},
		{
			"id": "risk_history",
			"question": "Any history of BP, diabetes, or heart disease?",
			"options": [
				{"id": "a", "label": "No", "value": "I have no known history."},
				{"id": "b", "label": "One condition", "value": "I have one related condition."},
				{"id": "c", "label": "More than one", "value": "I have more than one related condition."},
			],
		},
		{
			"id": "current_status",
			"question": "How are you feeling right now?",
			"options": [
				{"id": "a", "label": "Better", "value": "I am feeling better now."},
				{"id": "b", "label": "Same", "value": "I feel about the same."},
				{"id": "c", "label": "Worse", "value": "I feel worse right now."},
			],
		},
	],
}


SESSION_FLOW_STATE: dict[str, dict] = {}


def _normalize_text(value: str) -> str:
	return (value or "").strip().lower()


def _infer_initial_condition(message: str) -> str:
	normalized = _normalize_text(message)

	if any(token in normalized for token in ["stomach", "abdomen", "acidity", "gas", "indigestion", "nausea"]):
		return "gastritis"
	if any(token in normalized for token in ["cough", "sneezing", "runny nose", "sore throat", "cold", "flu"]):
		return "common cold"
	if any(token in normalized for token in ["headache", "migraine", "head pain"]):
		return "tension headache"
	if any(token in normalized for token in ["chest pain", "left arm", "breathing", "breath", "palpitation"]):
		return "cardiac warning"

	return "gastritis"


def _infer_specialization(predicted_condition: str, ai_specialization: str) -> str:
	explicit = _normalize_text(ai_specialization)
	if explicit:
		return explicit

	mapping = {
		"gastritis": "gastroenterologist",
		"common cold": "general physician",
		"tension headache": "neurologist",
		"cardiac warning": "cardiologist",
		"general wellness": "general physician",
	}
	return mapping.get(_normalize_text(predicted_condition), "general physician")


def _title_case_condition(slug: str) -> str:
	return " ".join(part.capitalize() for part in slug.split())


def _safe_get_flow(condition_slug: str) -> list[dict]:
	return deepcopy(QUESTION_FLOWS.get(condition_slug, QUESTION_FLOWS["gastritis"]))


def _create_session_state(session_id: str, condition_slug: str, presenting_complaint: str) -> dict:
	state = {
		"session_id": session_id,
		"condition_slug": condition_slug,
		"flow": _safe_get_flow(condition_slug),
		"current_index": 0,
		"answers": [],
		"presenting_complaint": presenting_complaint,
		"completed": False,
		"awaiting_first_question": True,
	}
	SESSION_FLOW_STATE[session_id] = state
	return state


def _get_or_create_session_state(session_id: str, message: str) -> dict:
	state = SESSION_FLOW_STATE.get(session_id)
	if state and not state.get("completed", False):
		return state

	inferred = _infer_initial_condition(message)
	return _create_session_state(session_id=session_id, condition_slug=inferred, presenting_complaint=message)


def _normalize_option_message(message: str) -> str:
	normalized = _normalize_text(message)
	if normalized.startswith(tuple(f"{ch}." for ch in "abcdefghijklmnopqrstuvwxyz")):
		return normalized[2:].strip()
	return normalized


def _resolve_answer(question: dict, message: str) -> dict:
	normalized_message = _normalize_option_message(message)
	options = question.get("options", [])

	for option in options:
		option_id = _normalize_text(option.get("id", ""))
		option_label = _normalize_text(option.get("label", ""))
		option_value = _normalize_text(option.get("value", ""))
		if normalized_message in {option_id, option_label, option_value}:
			return {
				"question_id": question.get("id", ""),
				"question": question.get("question", ""),
				"answer_label": option.get("label", ""),
				"answer_value": option.get("value", ""),
			}

	return {
		"question_id": question.get("id", ""),
		"question": question.get("question", ""),
		"answer_label": message.strip(),
		"answer_value": message.strip(),
	}


def _build_progress_question_payload(state: dict) -> tuple[str, list[dict]]:
	question = state["flow"][state["current_index"]]
	response = question["question"]
	options = [
		{
			"id": option["id"],
			"label": option["label"],
			"value": option["value"],
		}
		for option in question.get("options", [])
	]
	return response, options


def _final_ai_summary(state: dict) -> str:
	ai_url = config("AI_CHAT_API_URL", default="http://127.0.0.1:8001/api/chat")
	condition = _title_case_condition(state["condition_slug"])
	qa_lines = "\n".join(
		f"- {item['question']}: {item['answer_label']}" for item in state.get("answers", [])
	)

	prompt = (
		"Create a brief clinical wellness summary using this triage data. "
		"Mention likely condition, caution signs, and short next steps.\n"
		f"Presenting complaint: {state.get('presenting_complaint', '')}\n"
		f"Predicted condition: {condition}\n"
		f"Triage answers:\n{qa_lines}"
	)

	try:
		with httpx.Client(timeout=12.0) as client:
			response = client.post(
				ai_url,
				json={
					"session_id": state["session_id"],
					"message": prompt,
					"fitness_approved": False,
				},
			)
			response.raise_for_status()
			body = response.json()
			return str(body.get("response", "")).strip()
	except Exception:
		return (
			f"Based on your answers, this pattern looks most consistent with {condition}. "
			"Please follow hydration, light diet, and rest advice, and seek in-person care if symptoms worsen."
		)


def _doctor_recommendations(specialization: str) -> list[dict]:
	specialization_normalized = _normalize_text(specialization)
	doctors = DoctorProfile.objects.select_related("user")
	if specialization_normalized:
		doctors = doctors.filter(specialization__icontains=specialization_normalized)

	serialized = [
		{
			"id": doctor.id,
			"doctor_name": doctor.user.full_name if doctor.user else "Doctor",
			"specialization": doctor.specialization,
			"hospital_name": doctor.hospital_name,
			"phone_number": doctor.phone_number,
			"source": "api",
		}
		for doctor in doctors[:3]
	]

	if serialized:
		return serialized

	return MOCK_DOCTORS_BY_SPECIALIZATION.get(
		specialization_normalized,
		MOCK_DOCTORS_BY_SPECIALIZATION["general physician"],
	)


def _medicine_recommendations(predicted_condition: str) -> list[dict]:
	condition = _normalize_text(predicted_condition)
	keyword_map = {
		"gastritis": ["acid", "antacid", "digest", "stomach"],
		"common cold": ["cold", "flu", "paracetamol", "cough"],
		"tension headache": ["headache", "pain"],
		"cardiac warning": ["cardio", "heart"],
	}

	keywords = keyword_map.get(condition, ["wellness"])
	query = Q()
	for keyword in keywords:
		query |= Q(name__icontains=keyword) | Q(description__icontains=keyword) | Q(category__icontains=keyword)

	medicines = Medicine.objects.filter(query)[:4]
	serialized = [
		{
			"id": med.id,
			"name": med.name,
			"description": med.description,
			"category": med.category,
			"requires_prescription": med.requires_prescription,
			"source": "api",
		}
		for med in medicines
	]

	if serialized:
		return serialized

	return MOCK_MEDICINES_BY_CONDITION.get(condition, MOCK_MEDICINES_BY_CONDITION["general wellness"])


def _is_high_risk(condition_slug: str, answers: list[dict]) -> bool:
	if condition_slug == "cardiac warning":
		return True

	answer_text = " ".join(item.get("answer_label", "") for item in answers).lower()
	return any(token in answer_text for token in ["severe", "high fever", "often", "more than 1 week", "more than one"])


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
						"Chat response",
						value={
							"result": {
								"session_id": "mobile-17140000",
								"response": "How many hours did you sleep yesterday?",
								"confidence": 0.72,
								"is_serious": False,
								"needs_doctor": False,
								"questions_asked": 0,
								"recommended_specialization": "gastroenterologist",
								"predicted_condition": "",
								"options": [
									{"id": "a", "label": "1-2 hrs", "value": "I slept 1 to 2 hours."},
									{"id": "b", "label": "3-4 hrs", "value": "I slept 3 to 4 hours."},
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

		state = _get_or_create_session_state(session_id=session_id, message=message)
		specialization = _infer_specialization(
			predicted_condition=state["condition_slug"],
			ai_specialization="",
		)

		if state.get("awaiting_first_question", False):
			state["awaiting_first_question"] = False
			next_question, options = _build_progress_question_payload(state)
			payload = _build_payload(
				session_id=session_id,
				response_text=next_question,
				confidence=0.72,
				questions_asked=0,
				specialization=specialization,
				predicted_condition="",
				options=options,
				doctors=[],
				medicines=[],
				is_serious=False,
			)
			return api_response(result=payload, is_success=True, status_code=status.HTTP_200_OK, error_message=[])

		current_question = state["flow"][state["current_index"]]
		answer = _resolve_answer(current_question, message)
		state["answers"].append(answer)
		state["current_index"] += 1

		if state["current_index"] < len(state["flow"]):
			next_question, options = _build_progress_question_payload(state)
			payload = _build_payload(
				session_id=session_id,
				response_text=next_question,
				confidence=0.78,
				questions_asked=state["current_index"],
				specialization=specialization,
				predicted_condition="",
				options=options,
				doctors=[],
				medicines=[],
				is_serious=False,
			)
			return api_response(result=payload, is_success=True, status_code=status.HTTP_200_OK, error_message=[])

		state["completed"] = True
		predicted_condition = _title_case_condition(state["condition_slug"])
		doctors = _doctor_recommendations(specialization)
		medicines = _medicine_recommendations(predicted_condition)
		is_serious = _is_high_risk(state["condition_slug"], state["answers"])
		summary = _final_ai_summary(state)

		payload = _build_payload(
			session_id=session_id,
			response_text=summary,
			confidence=0.89,
			questions_asked=len(state["flow"]),
			specialization=specialization,
			predicted_condition=predicted_condition,
			options=[],
			doctors=doctors,
			medicines=medicines,
			is_serious=is_serious,
		)
		return api_response(result=payload, is_success=True, status_code=status.HTTP_200_OK, error_message=[])
