import os
from pathlib import Path

import requests
from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parent / ".env")

HF_API_KEY = os.getenv("HF_API_KEY")
HF_BRIEF_MODEL = os.getenv("HF_BRIEF_MODEL", "aaditya/Llama3-OpenBioLLM-70B")
HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions"
HF_LEGACY_URL = f"https://api-inference.huggingface.co/models/{HF_BRIEF_MODEL}"
REQUEST_TIMEOUT_SECONDS = 25


def generate_brief(patient_data):
    prompt = _build_prompt(patient_data)
    fallback = _fallback_brief(patient_data)
    last_error = "No response generated."

    if not HF_API_KEY:
        return {
            "brief": fallback,
            "source": "fallback",
            "model": None,
            "warning": "HF_API_KEY is not configured.",
        }

    for caller in (_call_hf_router, _call_hf_legacy):
        try:
            generated = caller(prompt)
        except requests.RequestException as exc:
            last_error = str(exc)
            continue
        except (KeyError, IndexError, TypeError, ValueError) as exc:
            last_error = str(exc)
            continue

        if generated:
            return {
                "brief": _with_disclaimer(generated),
                "source": "huggingface",
                "model": HF_BRIEF_MODEL,
                "warning": None,
            }

    return {
        "brief": fallback,
        "source": "fallback",
        "model": HF_BRIEF_MODEL,
        "warning": f"Hugging Face request failed; returned deterministic fallback. Last error: {last_error}",
    }


def _call_hf_router(prompt):
    response = requests.post(
        HF_ROUTER_URL,
        headers=_headers(),
        json={
            "model": HF_BRIEF_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a clinical assistant. Write concise summaries only from the supplied patient data.",
                },
                {"role": "user", "content": prompt},
            ],
            "max_tokens": 220,
            "temperature": 0.2,
        },
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"].strip()


def _call_hf_legacy(prompt):
    response = requests.post(
        HF_LEGACY_URL,
        headers=_headers(),
        json={
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 220,
                "temperature": 0.2,
                "return_full_text": False,
            },
        },
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    data = response.json()

    if isinstance(data, list) and data:
        return data[0].get("generated_text", "").strip()
    if isinstance(data, dict):
        return data.get("generated_text", "").strip()
    return ""


def _headers():
    return {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Content-Type": "application/json",
    }


def _build_prompt(patient_data):
    patient = patient_data.get("patient", {})
    snapshot = patient_data.get("snapshot", {})
    latest = snapshot.get("latestMetrics", {})

    conditions = [item.get("name") for item in snapshot.get("activeConditions", [])][:8]
    medications = [item.get("name") for item in snapshot.get("currentMedications", [])][:8]
    allergies = [item.get("name") for item in snapshot.get("allergies", [])][:6]
    metrics = [
        f"{metric.get('label')}: {metric.get('displayValue')}"
        for metric in latest.values()
        if metric.get("displayValue")
    ]

    return f"""Write a First Visit Brief for a new doctor seeing this patient.

Use only the patient data below. Do not invent diagnoses, medications, lab values, allergies, or treatment recommendations.
Write 3 short plain-English sentences, then one "Watch for:" sentence.

Patient:
- Name: {patient.get("name", "Unknown")}
- Age: {patient.get("age", "Unknown")}
- Sex: {patient.get("gender", "Unknown")}
- MRN: {patient.get("mrn", "Unknown")}

Active conditions:
- {_join_or_none(conditions)}

Current medications:
- {_join_or_none(medications)}

Allergies:
- {_join_or_none(allergies)}

Latest metrics:
- {_join_or_none(metrics)}
"""


def _fallback_brief(patient_data):
    patient = patient_data.get("patient", {})
    snapshot = patient_data.get("snapshot", {})
    latest = snapshot.get("latestMetrics", {})
    conditions = [item.get("name") for item in snapshot.get("activeConditions", []) if item.get("name")]
    medications = [item.get("name") for item in snapshot.get("currentMedications", []) if item.get("name")]
    allergies = [item.get("name") for item in snapshot.get("allergies", []) if item.get("name")]

    condition_text = _sentence_list(conditions[:4]) or "a longitudinal medical history"
    medication_text = _sentence_list(medications[:4]) or "no current medications listed in the demo snapshot"
    allergy_text = _sentence_list(allergies[:3]) or "no specific allergies listed in the demo snapshot"
    metric_text = _metric_text(latest)

    brief = (
        f"{patient.get('name', 'This patient')} is a {patient.get('age', 'unknown')}-year-old "
        f"{patient.get('gender', 'patient')} with {condition_text}. "
        f"Current medications include {medication_text}, and allergies include {allergy_text}. "
        f"Recent structured data shows {metric_text}. "
        "Watch for: medication safety issues, kidney function trends, and changes in cardiometabolic risk."
    )
    return _with_disclaimer(brief)


def _metric_text(latest):
    pieces = []
    for key in ("hba1c", "blood_pressure", "ldl", "egfr", "weight"):
        metric = latest.get(key)
        if metric and metric.get("displayValue"):
            pieces.append(f"{metric.get('label')} {metric.get('displayValue')}")
    return _sentence_list(pieces) or "no recent key metrics in the demo snapshot"


def _with_disclaimer(text):
    disclaimer = "This summary is AI-generated for informational purposes only and is not a substitute for clinical judgment."
    clean = " ".join((text or "").split())
    if disclaimer in clean:
        return clean
    return f"{clean} {disclaimer}"


def _join_or_none(values):
    clean = [value for value in values if value]
    return "; ".join(clean) if clean else "None documented"


def _sentence_list(values):
    clean = [value for value in values if value]
    if not clean:
        return ""
    if len(clean) == 1:
        return clean[0]
    return ", ".join(clean[:-1]) + f", and {clean[-1]}"
