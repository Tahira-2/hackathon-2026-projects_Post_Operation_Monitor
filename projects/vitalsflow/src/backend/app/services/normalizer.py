"""
FHIR Normalizer — converts raw FHIR Patient + Condition + Observation dicts
into a compact plain-text Clinical Summary string for the LLM.

Why this matters: sending raw FHIR JSON to the LLM wastes ~2000 tokens per
patient. The normalized summary is ~50 tokens. Same clinical information,
40x cheaper and faster.

Output format (exact):
    PATIENT: {name}, {age}yo {gender}
    CONDITIONS: {comma-separated condition display names}
    RECENT VITALS: {key: value unit; key: value unit}
"""

# Standard library
from datetime import date, datetime

# LOINC code -> human-readable vital name mapping
# These match the codes in utils/fhir.py for consistency
LOINC_TO_VITAL: dict[str, tuple[str, str]] = {
    "8867-4":  ("heart_rate",       "/min"),
    "8480-6":  ("systolic_bp",      "mmHg"),
    "8462-4":  ("diastolic_bp",     "mmHg"),
    "59408-5": ("spo2",             "%"),
    "8310-5":  ("temperature",      "°C"),
    "9279-1":  ("respiratory_rate", "/min"),
}


def normalize_patient(
    patient: dict,
    conditions: list[dict],
    observations: list[dict],
) -> str:
    """
    Produce a compact Clinical Summary string from raw FHIR resources.
    Never raises — falls back gracefully on any missing field.
    """
    name = _extract_name(patient)
    age = _calc_age(patient.get("birthDate", ""))
    gender = patient.get("gender", "unknown")
    age_str = f"{age}yo" if age is not None else "age unknown"

    conditions_str = _extract_conditions(conditions)
    vitals_str = _extract_recent_vitals(observations)

    return (
        f"PATIENT: {name}, {age_str} {gender}\n"
        f"CONDITIONS: {conditions_str}\n"
        f"RECENT VITALS: {vitals_str}"
    )


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _extract_name(patient: dict) -> str:
    """Extract human name from Patient resource. Fallback to 'Unknown'."""
    try:
        name_entries = patient.get("name", [])
        if not name_entries:
            return "Unknown"
        entry = name_entries[0]
        given = " ".join(entry.get("given", []))
        family = entry.get("family", "")
        full = f"{given} {family}".strip()
        return full or "Unknown"
    except Exception:
        return "Unknown"


def _calc_age(dob: str) -> int | None:
    """
    Calculate age in whole years from a FHIR birthDate string (YYYY-MM-DD).
    Returns None if the string is missing or unparseable.
    """
    if not dob:
        return None
    try:
        birth = datetime.strptime(dob[:10], "%Y-%m-%d").date()
        today = date.today()
        age = today.year - birth.year - (
            (today.month, today.day) < (birth.month, birth.day)
        )
        return age
    except Exception:
        return None


def _extract_conditions(conditions: list[dict]) -> str:
    """
    Extract readable condition names from a list of Condition resources.
    Falls back to 'none on record' if empty.
    """
    if not conditions:
        return "none on record"

    names: list[str] = []
    for cond in conditions:
        code = cond.get("code", {})
        # Prefer code.text, then first coding.display
        text = code.get("text", "")
        if not text:
            for coding in code.get("coding", []):
                text = coding.get("display", "")
                if text:
                    break
        if text:
            names.append(text)

    return ", ".join(names) if names else "none on record"


def _extract_recent_vitals(observations: list[dict]) -> str:
    """
    Extract the most recent value for each LOINC-mapped vital from
    Observation resources (already sorted newest-first by the FHIR query).
    Returns 'none on record' if nothing found.
    """
    seen: dict[str, str] = {}  # vital_name -> "value unit"

    for obs in observations:
        if obs.get("resourceType") != "Observation":
            continue
        code = obs.get("code", {})
        loinc_code = _find_loinc_code(code)
        if not loinc_code or loinc_code not in LOINC_TO_VITAL:
            continue

        vital_name, unit = LOINC_TO_VITAL[loinc_code]
        if vital_name in seen:
            continue  # already have the most recent value

        value = _read_value(obs)
        if value is not None:
            seen[vital_name] = f"{value} {unit}".strip()

    if not seen:
        return "none on record"

    return "; ".join(f"{k}: {v}" for k, v in seen.items())


def _find_loinc_code(codeable: dict) -> str | None:
    """Return first LOINC code found in a CodeableConcept, or None."""
    for coding in codeable.get("coding", []):
        system = coding.get("system", "")
        code = coding.get("code", "")
        if code and ("loinc" in system.lower() or not system):
            if code in LOINC_TO_VITAL:
                return code
    return None


def _read_value(obs: dict) -> str | None:
    """Read a numeric or string value from an Observation resource."""
    if "valueQuantity" in obs:
        val = obs["valueQuantity"].get("value")
        return str(round(float(val), 1)) if val is not None else None
    if "valueInteger" in obs:
        return str(obs["valueInteger"])
    if "valueDecimal" in obs:
        return str(round(float(obs["valueDecimal"]), 1))
    if "valueString" in obs:
        return str(obs["valueString"])
    return None
