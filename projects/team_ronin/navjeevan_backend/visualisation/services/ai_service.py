from django.conf import settings
from groq import Groq
from event.models import Event
from user.models import NormalUser
from visualisation.models import VaccinationRecord

from .context_builder import build_district_context


SYSTEM_PROMPT = """
You are a public health analyst assistant for Nepal's national immunization program.
You help health workers and program managers understand district-level vaccine coverage.

Rules:
- Use only statistics contained in the provided data block.
- Do not invent numbers. If data is missing, state that clearly.
- Explain coverage gaps in plain language.
- Suggest 2-3 practical, evidence-based public health actions.
- Flag vaccines below 75% as urgent.
- Keep responses concise (under 250 words).
- End with one sentence describing disease risk, if any.
"""

NIP_SCHEDULE = """
Nepal National Immunization Program Schedule:
- Birth: BCG, OPV-0, Hep-B birth dose
- 6 weeks: DPT-HepB-Hib 1 (Penta-1), OPV-1, PCV-1
- 10 weeks: DPT-HepB-Hib 2 (Penta-2), OPV-2, PCV-2
- 14 weeks: DPT-HepB-Hib 3 (Penta-3), OPV-3, PCV-3, IPV
- 9 months: Measles-Rubella 1 (MR-1), JE-1
- 15 months: Measles-Rubella 2 (MR-2), JE-2
- 5 years: DPT booster, OPV booster
- 10 years: TT
- 16 years: TT booster
""".strip()

USER_SYSTEM_PROMPT = """
You are Navjeevan's vaccine assistant for citizens in Nepal.
You answer questions about vaccines, side effects, event locations, and district coverage.

Rules:
- Use only facts from the supplied context block.
- If a number/location is missing, say that clearly.
- Keep medical advice non-diagnostic and non-prescriptive.
- For side effects, provide common/general guidance and urge healthcare follow-up for severe symptoms.
- End with a short safety disclaimer to consult a licensed healthcare provider.
""".strip()


def _language_instruction(language: str):
    if (language or "").lower() == "ne":
        return "Respond in Nepali language."
    return "Respond in English language."


def get_district_insight(district_id, year, user_question=None, language="en"):
    api_key = getattr(settings, "GROQ_API_KEY", None)
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured.")

    context = build_district_context(district_id=district_id, year=year)
    question = user_question or "Summarize this district's vaccination status and key concerns."
    client = Groq(api_key=api_key)

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": f"{SYSTEM_PROMPT}\n\n{_language_instruction(language)}"},
            {"role": "user", "content": f"{context}\n\nQuestion: {question}"},
        ],
        max_tokens=350,
        temperature=0.2,
        top_p=0.9,
    )
    return response.choices[0].message.content


def get_user_assistant_response(user: NormalUser, question: str, language="en"):
    api_key = getattr(settings, "GROQ_API_KEY", None)
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured.")

    records = user.vaccination_records.order_by("-created_at")[:30]
    history = "\n".join(
        [
            f"- {item.vaccine_name} dose {item.dose_number}: {item.status} "
            f"(administered: {item.date_administered or 'N/A'}, scheduled: {item.scheduled_date or 'N/A'})"
            for item in records
        ]
    ) or "No personal vaccination records found."

    district_coverage = "No district coverage available."
    if user.region:
        region_record = (
            VaccinationRecord.objects.select_related("district")
            .filter(district__name__iexact=user.region)
            .order_by("-year")
            .first()
        )
        if region_record:
            district_coverage = (
                f"{region_record.district.name} ({region_record.year}) coverage: "
                f"DPT-3 {region_record.coverage_pct}%."
            )

    upcoming_events = (
        Event.objects.select_related("event_location")
        .filter(event_location__name__iexact=user.region, event_status__in=["NOT_STARTED", "IN_PROGRESS"])
        .order_by("-created_at")[:5]
    )
    events_text = "\n".join(
        [
            f"- {item.name} | location: {item.event_location.name if item.event_location else 'N/A'} | status: {item.event_status}"
            for item in upcoming_events
        ]
    ) or "No nearby active events found."

    context = f"""
User profile:
- Name: {user.name}
- Region: {user.region or 'Unknown'}
- Age: {user.age or 'Unknown'}
- Special conditions: {user.special_conditions or 'None'}

Vaccination history:
{history}

District coverage snapshot:
{district_coverage}

Nearby event locations:
{events_text}

NIP schedule:
{NIP_SCHEDULE}
""".strip()

    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": f"{USER_SYSTEM_PROMPT}\n\n{_language_instruction(language)}"},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
        ],
        max_tokens=500,
        temperature=0.2,
        top_p=0.9,
    )
    return response.choices[0].message.content
