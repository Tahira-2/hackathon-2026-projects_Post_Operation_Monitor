import json
from datetime import date, datetime
from pathlib import Path


DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "patient.json"

KEY_OBSERVATIONS = {
    "Hemoglobin A1c/Hemoglobin.total in Blood": "hba1c",
    "Cholesterol in LDL [Mass/volume] in Serum or Plasma by Direct assay": "ldl",
    "Cholesterol [Mass/volume] in Serum or Plasma": "total_cholesterol",
    "Cholesterol in HDL [Mass/volume] in Serum or Plasma": "hdl",
    "Triglyceride [Mass/volume] in Serum or Plasma": "triglycerides",
    "Glomerular filtration rate [Volume Rate/Area] in Serum or Plasma by Creatinine-based formula (MDRD)/1.73 sq M": "egfr",
    "Body Weight": "weight",
    "Body Mass Index": "bmi",
    "Glucose [Mass/volume] in Blood": "glucose",
    "Glucose [Mass/volume] in Serum or Plasma": "glucose",
}

CLINICAL_CONDITION_TERMS = (
    "diabetes",
    "hypertension",
    "kidney",
    "renal",
    "hyperlipidemia",
    "hypertriglyceridemia",
    "metabolic",
    "ischemic",
    "heart",
    "anemia",
    "obesity",
    "prediabetes",
    "proteinuria",
    "microalbuminuria",
    "transplant",
    "end-stage",
)


def load_patient(patient_id="default"):
    bundle = _read_bundle()
    medication_lookup = _build_medication_lookup(bundle)

    patient = {}
    allergies = []
    conditions = []
    medications = []
    observations = []
    encounters = []
    timeline = []

    for entry in bundle.get("entry", []):
        resource = entry.get("resource", {})
        resource_type = resource.get("resourceType")

        if resource_type == "Patient":
            patient = _parse_patient(resource)
        elif resource_type == "AllergyIntolerance":
            allergies.append(_parse_allergy(resource))
        elif resource_type == "Condition":
            condition = _parse_condition(resource)
            conditions.append(condition)
            timeline.append(
                _timeline_item(
                    condition.get("onsetDate"),
                    "condition",
                    condition.get("name"),
                    condition.get("status"),
                )
            )
        elif resource_type == "MedicationRequest":
            med = _parse_medication_request(resource, medication_lookup)
            medications.append(med)
            timeline.append(
                _timeline_item(
                    med.get("authoredOn"),
                    "medication",
                    med.get("name"),
                    med.get("status"),
                )
            )
        elif resource_type == "Observation":
            observation = _parse_observation(resource)
            if observation:
                observations.append(observation)
                if observation.get("key"):
                    timeline.append(
                        _timeline_item(
                            observation.get("date"),
                            "lab",
                            observation.get("label"),
                            observation.get("displayValue"),
                        )
                    )
        elif resource_type == "Encounter":
            encounter = _parse_encounter(resource)
            encounters.append(encounter)
            timeline.append(
                _timeline_item(
                    encounter.get("date"),
                    "encounter",
                    encounter.get("type"),
                    encounter.get("provider"),
                )
            )

    conditions = _dedupe_by_name(conditions, "name")
    medications = _dedupe_medications(medications)
    observations = sorted(observations, key=lambda item: item.get("date") or "")
    encounters = sorted(encounters, key=lambda item: item.get("date") or "")
    timeline = sorted(
        [item for item in timeline if item.get("date")],
        key=lambda item: item["date"],
    )

    trends = _build_trends(observations)
    latest = _latest_metrics(trends)

    return {
        "source": {
            "type": "Synthea FHIR R4 synthetic patient bundle",
            "patientId": patient.get("id") or patient_id,
            "resourceCounts": _resource_counts(bundle),
        },
        "patient": {
            **patient,
            "bloodType": "Unknown",
            "codeStatus": "Not documented",
        },
        "snapshot": {
            "aiStatusLine": _status_line(patient, conditions, latest),
            "latestMetrics": latest,
            "activeConditions": conditions[:12],
            "currentMedications": medications[:12],
            "allergies": allergies,
        },
        "conditions": conditions[:60],
        "medications": medications[:80],
        "observations": observations[-250:],
        "trends": trends,
        "encounters": encounters[-80:],
        "timeline": timeline[-300:],
        "conditionThreads": _condition_threads(conditions, medications, observations),
        "disclaimer": "For demonstration only. Uses synthetic patient data. Not for clinical use.",
    }


def _read_bundle():
    with DATA_PATH.open() as file:
        return json.load(file)


def _build_medication_lookup(bundle):
    lookup = {}
    for entry in bundle.get("entry", []):
        resource = entry.get("resource", {})
        if resource.get("resourceType") != "Medication":
            continue
        text = _code_text(resource.get("code", {}))
        if resource.get("id") and text:
            lookup[f"urn:uuid:{resource['id']}"] = text
            lookup[f"Medication/{resource['id']}"] = text
    return lookup


def _parse_patient(resource):
    name = resource.get("name", [{}])[0]
    given = " ".join(name.get("given", []))
    address = resource.get("address", [{}])[0]
    
    # Overrides for hackathon ID card integration
    full_name = "Alex Morgan"
    gender = "Non-binary"
    birth_date = "1996-04-12"

    return {
        "id": resource.get("id"),
        "name": full_name,
        "gender": gender,
        "birthDate": birth_date,
        "age": _age(birth_date),
        "mrn": (resource.get("id") or "default")[:8].upper(),
        "phone": _first_telecom(resource, "phone"),
        "address": _format_address(address),
    }


def _parse_allergy(resource):
    return {
        "name": _code_text(resource.get("code", {})) or "Unknown allergy",
        "status": _coding_code(resource.get("clinicalStatus")),
        "category": ", ".join(resource.get("category", [])),
        "criticality": resource.get("criticality", "unknown"),
        "recordedDate": _date_only(resource.get("recordedDate")),
    }


def _parse_condition(resource):
    return {
        "id": resource.get("id"),
        "name": _code_text(resource.get("code", {})) or "Unknown condition",
        "status": _coding_code(resource.get("clinicalStatus")),
        "verification": _coding_code(resource.get("verificationStatus")),
        "onsetDate": _date_only(
            resource.get("onsetDateTime")
            or resource.get("recordedDate")
            or resource.get("abatementDateTime")
        ),
        "clinicalPriority": _is_clinical_condition(_code_text(resource.get("code", {}))),
    }


def _parse_medication_request(resource, medication_lookup):
    name = _code_text(resource.get("medicationCodeableConcept", {}))
    if not name:
        reference = resource.get("medicationReference", {}).get("reference")
        name = medication_lookup.get(reference)

    return {
        "id": resource.get("id"),
        "name": name or "Unknown medication",
        "status": resource.get("status", "unknown"),
        "authoredOn": _date_only(resource.get("authoredOn")),
        "dosage": resource.get("dosageInstruction", [{}])[0].get("text", ""),
        "requester": resource.get("requester", {}).get("display", ""),
    }


def _parse_observation(resource):
    label = _code_text(resource.get("code", {})) or "Unknown observation"
    date_value = _date_only(resource.get("effectiveDateTime") or resource.get("issued"))

    if resource.get("component"):
        components = {}
        for component in resource.get("component", []):
            component_label = _code_text(component.get("code", {}))
            value = component.get("valueQuantity", {})
            components[component_label] = {
                "value": value.get("value"),
                "unit": value.get("unit"),
            }
        if "blood pressure" in label.lower():
            systolic = _component_value(components, "Systolic Blood Pressure")
            diastolic = _component_value(components, "Diastolic Blood Pressure")
            return {
                "label": "Blood Pressure",
                "key": "blood_pressure",
                "date": date_value,
                "value": {"systolic": systolic, "diastolic": diastolic},
                "unit": "mmHg",
                "displayValue": f"{systolic}/{diastolic} mmHg",
            }
        return None

    quantity = resource.get("valueQuantity")
    if not quantity:
        return None

    key = KEY_OBSERVATIONS.get(label)
    value = quantity.get("value")
    unit = quantity.get("unit") or quantity.get("code") or ""
    return {
        "label": label,
        "key": key,
        "date": date_value,
        "value": value,
        "unit": unit,
        "displayValue": _display_value(value, unit),
    }


def _parse_encounter(resource):
    period = resource.get("period", {})
    return {
        "id": resource.get("id"),
        "date": _date_only(period.get("start")),
        "endDate": _date_only(period.get("end")),
        "type": _code_text(resource.get("type", [{}])[0]) or "Encounter",
        "status": resource.get("status"),
        "provider": resource.get("serviceProvider", {}).get("display", ""),
    }


def _build_trends(observations):
    trends = {}
    for observation in observations:
        key = observation.get("key")
        if not key:
            continue
        trends.setdefault(key, []).append(
            {
                "date": observation.get("date"),
                "value": observation.get("value"),
                "unit": observation.get("unit"),
                "displayValue": observation.get("displayValue"),
            }
        )

    # Keep charts responsive while preserving the longitudinal story.
    return {key: values[-120:] for key, values in trends.items()}


def _latest_metrics(trends):
    labels = {
        "hba1c": "HbA1c",
        "blood_pressure": "Blood Pressure",
        "ldl": "LDL",
        "egfr": "eGFR",
        "weight": "Weight",
        "bmi": "BMI",
        "glucose": "Glucose",
        "triglycerides": "Triglycerides",
    }
    latest = {}
    for key, label in labels.items():
        values = trends.get(key, [])
        if values:
            latest[key] = {"label": label, **values[-1]}
    return latest


def _condition_threads(conditions, medications, observations):
    threads = []
    thread_terms = {
        "Diabetes": ("diabetes", "hba1c", "glucose", "metformin", "insulin"),
        "Hypertension": ("hypertension", "blood_pressure", "amlodipine", "lisinopril"),
        "Kidney Disease": ("kidney", "renal", "egfr", "tacrolimus"),
        "Cardiometabolic Risk": ("hyperlipidemia", "triglyceride", "cholesterol", "simvastatin"),
    }

    for title, terms in thread_terms.items():
        matched_conditions = [
            condition
            for condition in conditions
            if any(term in condition.get("name", "").lower() for term in terms)
        ][:8]
        matched_meds = [
            med
            for med in medications
            if any(term in med.get("name", "").lower() for term in terms)
        ][:8]
        matched_labs = [
            obs
            for obs in observations
            if obs.get("key") in terms
            or any(term in obs.get("label", "").lower() for term in terms)
        ][-12:]
        if matched_conditions or matched_meds or matched_labs:
            threads.append(
                {
                    "title": title,
                    "conditions": matched_conditions,
                    "medications": matched_meds,
                    "recentLabs": matched_labs,
                }
            )
    return threads


def _dedupe_by_name(items, key):
    seen = set()
    result = []
    for item in sorted(items, key=lambda value: value.get("onsetDate") or "", reverse=True):
        name = item.get(key)
        if not name or name in seen:
            continue
        seen.add(name)
        result.append(item)
    return sorted(
        result,
        key=lambda value: (not value.get("clinicalPriority", False), value.get("onsetDate") or ""),
    )


def _dedupe_medications(medications):
    seen = set()
    result = []
    sorted_meds = sorted(medications, key=lambda med: med.get("authoredOn") or "", reverse=True)
    for med in sorted_meds:
        name = med.get("name")
        if not name or name == "Unknown medication" or name in seen:
            continue
        seen.add(name)
        result.append(med)
    return result


def _resource_counts(bundle):
    counts = {}
    for entry in bundle.get("entry", []):
        resource_type = entry.get("resource", {}).get("resourceType", "Unknown")
        counts[resource_type] = counts.get(resource_type, 0) + 1
    return counts


def _status_line(patient, conditions, latest):
    clinical_conditions = [item["name"] for item in conditions if item.get("clinicalPriority")]
    primary = ", ".join(clinical_conditions[:3]) or "longitudinal chronic care history"
    metric_bits = []
    if "hba1c" in latest:
        metric_bits.append(f"HbA1c {latest['hba1c']['displayValue']}")
    if "blood_pressure" in latest:
        metric_bits.append(f"BP {latest['blood_pressure']['displayValue']}")
    if "egfr" in latest:
        metric_bits.append(f"eGFR {latest['egfr']['displayValue']}")
    metrics = "; ".join(metric_bits) if metric_bits else "latest vitals available"
    return f"{patient.get('name', 'Patient')} has {primary}; {metrics}."


def _timeline_item(date_value, event_type, title, subtitle):
    return {
        "date": _date_only(date_value),
        "type": event_type,
        "title": title or event_type.title(),
        "subtitle": subtitle or "",
    }


def _code_text(codeable):
    if not codeable:
        return ""
    if codeable.get("text"):
        return codeable["text"]
    coding = codeable.get("coding", [])
    if coding:
        return coding[0].get("display", "")
    return ""


def _coding_code(field):
    coding = (field or {}).get("coding", [])
    return coding[0].get("code", "") if coding else ""


def _component_value(components, label):
    value = components.get(label, {}).get("value")
    return round(value, 1) if isinstance(value, float) else value


def _display_value(value, unit):
    if isinstance(value, float):
        value = round(value, 2)
    return f"{value} {unit}".strip()


def _date_only(value):
    if not value:
        return ""
    return str(value)[:10]


def _age(birth_date):
    if not birth_date:
        return None
    try:
        born = datetime.strptime(birth_date, "%Y-%m-%d").date()
    except ValueError:
        return None
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))


def _first_telecom(resource, system):
    for telecom in resource.get("telecom", []):
        if telecom.get("system") == system:
            return telecom.get("value", "")
    return ""


def _format_address(address):
    parts = []
    if address.get("line"):
        parts.append(address["line"][0])
    for key in ("city", "state", "postalCode"):
        if address.get(key):
            parts.append(address[key])
    return ", ".join(parts)


def _is_clinical_condition(name):
    normalized = (name or "").lower()
    return any(term in normalized for term in CLINICAL_CONDITION_TERMS)
