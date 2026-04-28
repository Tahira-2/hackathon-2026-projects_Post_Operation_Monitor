import re

import requests


OPENFDA_LABEL_URL = "https://api.fda.gov/drug/label.json"
MAX_MEDICATIONS = 8
REQUEST_TIMEOUT_SECONDS = 8


def check_interactions(medication_names):
    warnings = []
    checked = []

    for original_name in medication_names[:MAX_MEDICATIONS]:
        query_name = _searchable_name(original_name)
        if not query_name:
            continue

        result = _fetch_label(query_name)
        checked.append(
            {
                "medication": original_name,
                "query": query_name,
                "matched": bool(result),
            }
        )

        if not result:
            continue

        warning = _first_text(result, "warnings", "boxed_warning", "precautions")
        interaction = _first_text(result, "drug_interactions")
        if warning or interaction:
            warnings.append(
                {
                    "medication": original_name,
                    "query": query_name,
                    "source": "OpenFDA drug label API",
                    "warning": _trim(warning),
                    "interaction": _trim(interaction),
                }
            )

    return {
        "warnings": warnings,
        "checked": checked,
        "disclaimer": "OpenFDA label data is for demonstration only and is not a substitute for clinical judgment.",
    }


def _fetch_label(query_name):
    search = (
        f'openfda.generic_name:"{query_name}"'
        f' OR openfda.brand_name:"{query_name}"'
        f' OR openfda.substance_name:"{query_name}"'
    )
    try:
        response = requests.get(
            OPENFDA_LABEL_URL,
            params={"search": search, "limit": 1},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        if response.status_code == 404:
            return None
        response.raise_for_status()
    except requests.RequestException:
        return None

    results = response.json().get("results", [])
    return results[0] if results else None


def _first_text(result, *fields):
    for field in fields:
        values = result.get(field)
        if values:
            return " ".join(values)
    return ""


def _searchable_name(name):
    normalized = (name or "").lower()
    normalized = normalized.replace("24 hr", " ")
    normalized = normalized.replace("72 hr", " ")
    normalized = re.sub(r"\[[^\]]+\]", " ", normalized)
    normalized = re.sub(r"\{[^}]+\}", " ", normalized)
    normalized = re.sub(r"\d+(\.\d+)?\s*(mg|mcg|g|ml|unt|actuat|hr|%)\b", " ", normalized)
    normalized = re.sub(r"\b(oral|tablet|capsule|extended|release|injectable|solution|suspension|hydrochloride|hydrochloride)\b", " ", normalized)
    normalized = re.sub(r"[^a-zA-Z/ ]", " ", normalized)
    normalized = re.sub(r"\s+", " ", normalized).strip()

    if "/" in normalized:
        normalized = normalized.split("/", 1)[0].strip()

    words = [word for word in normalized.split() if len(word) > 2]
    return " ".join(words[:3])


def _trim(text, limit=450):
    if not text:
        return None
    collapsed = re.sub(r"\s+", " ", text).strip()
    if len(collapsed) <= limit:
        return collapsed
    return collapsed[:limit].rsplit(" ", 1)[0] + "..."
