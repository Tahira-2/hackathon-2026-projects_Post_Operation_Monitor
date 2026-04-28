from dataclasses import dataclass
from typing import Iterable

LOINC_SYSTEM = "http://loinc.org"


@dataclass(frozen=True)
class Vitals:
    respiratory_rate: float | None
    spo2: float | None
    supplemental_o2: bool | None
    systolic_bp: float | None
    heart_rate: float | None
    consciousness: str | None
    temperature: float | None
    hypercapnic_rf: bool


def extract_vitals(fhir_data: dict) -> Vitals:
    resources = list(_iter_resources(fhir_data))

    respiratory_rate = _extract_numeric_observation(resources, {"9279-1"})
    spo2 = _extract_numeric_observation(resources, {"59408-5"})
    supplemental_o2 = _extract_boolean_observation(resources, {"57834-3"})
    if supplemental_o2 is None:
        supplemental_o2 = _has_oxygen_medication(resources)
    systolic_bp = _extract_numeric_observation(resources, {"8480-6"})
    heart_rate = _extract_numeric_observation(resources, {"8867-4"})
    consciousness = _extract_codeable_text_observation(resources, {"67775-7"})
    temperature = _extract_numeric_observation(resources, {"8310-5"})
    hypercapnic_rf = _has_hypercapnic_respiratory_failure(resources)

    return Vitals(
        respiratory_rate=respiratory_rate,
        spo2=spo2,
        supplemental_o2=supplemental_o2,
        systolic_bp=systolic_bp,
        heart_rate=heart_rate,
        consciousness=consciousness,
        temperature=temperature,
        hypercapnic_rf=hypercapnic_rf,
    )


def _iter_resources(fhir_data) -> Iterable[dict]:
    if isinstance(fhir_data, list):
        for item in fhir_data:
            yield from _iter_resources(item)
        return

    if not isinstance(fhir_data, dict):
        return

    if fhir_data.get("resourceType") == "Bundle":
        for entry in fhir_data.get("entry", []):
            resource = entry.get("resource")
            if isinstance(resource, dict):
                yield resource
    else:
        yield fhir_data


def _extract_numeric_observation(resources: list[dict], loinc_codes: set[str]) -> float | None:
    for resource in resources:
        if resource.get("resourceType") != "Observation":
            continue
        if _has_loinc_code(resource.get("code", {}), loinc_codes):
            value = _read_numeric_value(resource)
            if value is not None:
                return value
        component_value = _extract_numeric_component(resource, loinc_codes)
        if component_value is not None:
            return component_value
    return None


def _extract_numeric_component(resource: dict, loinc_codes: set[str]) -> float | None:
    for component in resource.get("component", []):
        codeable = component.get("code", {})
        if not _has_loinc_code(codeable, loinc_codes):
            continue
        return _read_numeric_value(component)
    return None


def _extract_boolean_observation(
    resources: list[dict],
    loinc_codes: set[str],
) -> bool | None:
    for resource in resources:
        if resource.get("resourceType") != "Observation":
            continue
        if not _has_loinc_code(resource.get("code", {}), loinc_codes):
            continue
        if "valueBoolean" in resource:
            return bool(resource.get("valueBoolean"))
        text = _read_codeable_text(resource.get("valueCodeableConcept", {}))
        if text:
            normalized = text.strip().lower()
            if normalized in {"yes", "true", "on"}:
                return True
            if normalized in {"no", "false", "off"}:
                return False
    return None


def _extract_codeable_text_observation(
    resources: list[dict],
    loinc_codes: set[str],
) -> str | None:
    for resource in resources:
        if resource.get("resourceType") != "Observation":
            continue
        if not _has_loinc_code(resource.get("code", {}), loinc_codes):
            continue
        if "valueString" in resource:
            return str(resource.get("valueString"))
        text = _read_codeable_text(resource.get("valueCodeableConcept", {}))
        if text:
            return text
    return None


def _read_numeric_value(resource: dict) -> float | None:
    if "valueQuantity" in resource:
        value = resource.get("valueQuantity", {}).get("value")
    else:
        value = resource.get("valueInteger")
        if value is None:
            value = resource.get("valueDecimal")
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _read_codeable_text(codeable: dict) -> str:
    text = codeable.get("text")
    if text:
        return str(text)
    for coding in codeable.get("coding", []):
        display = coding.get("display")
        if display:
            return str(display)
    return ""


def _has_loinc_code(codeable: dict, loinc_codes: set[str]) -> bool:
    for coding in codeable.get("coding", []):
        code = coding.get("code")
        system = coding.get("system") or ""
        if code in loinc_codes and (not system or system.endswith("loinc.org")):
            return True
    text = str(codeable.get("text") or "")
    return any(code in text for code in loinc_codes)


def _has_oxygen_medication(resources: list[dict]) -> bool | None:
    for resource in resources:
        if resource.get("resourceType") not in {
            "MedicationStatement",
            "MedicationRequest",
            "MedicationAdministration",
        }:
            continue
        text = _read_codeable_text(resource.get("medicationCodeableConcept", {}))
        if "oxygen" in text.lower():
            return True
    return None


def _has_hypercapnic_respiratory_failure(resources: list[dict]) -> bool:
    for resource in resources:
        if resource.get("resourceType") != "Condition":
            continue
        text = _read_codeable_text(resource.get("code", {})).lower()
        if "hypercapnic" in text or "type 2 respiratory failure" in text:
            return True
    return False
