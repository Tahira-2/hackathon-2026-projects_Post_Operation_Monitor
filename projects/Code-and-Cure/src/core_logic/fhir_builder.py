"""FHIR bundle construction logic module."""

import uuid
from datetime import datetime, timezone

from src.core_logic.models import FhirBundleResult
from src.core_logic.models import PrescriptionRequest
from src.core_logic.models import SoapNote

_RXNORM_CODES: dict[str, str] = {
    "acetaminophen": "161",
    "ibuprofen": "5640",
    "amoxicillin": "723",
    "amoxicillin 500mg": "864634",
    "atorvastatin": "83367",
}


def build_fhir_bundle(
    soap_note: SoapNote,
    patient_id: str,
    doctor_id: str,
    appointment_id: str,
    prescription_request: PrescriptionRequest | None = None,
    consent_text: str = "Patient provided verbal consent for telehealth consultation.",
) -> FhirBundleResult:
    """Build a FHIR R4 Bundle containing Consent, Composition, and optionally MedicationRequest.

    All external state (IDs, prescription) must be injected as parameters.
    No I/O or network access is performed.
    """
    now = datetime.now(timezone.utc).isoformat()
    entries: list[dict] = []
    included_types: list[str] = []

    consent_id = str(uuid.uuid4())
    entries.append({
        "fullUrl": f"urn:uuid:{consent_id}",
        "resource": {
            "resourceType": "Consent",
            "id": consent_id,
            "status": "active",
            "scope": {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/consentscope",
                    "code": "treatment",
                    "display": "Treatment",
                }]
            },
            "category": [{
                "coding": [{
                    "system": "http://loinc.org",
                    "code": "59284-0",
                    "display": "Consent Document",
                }]
            }],
            "patient": {"reference": f"Patient/{patient_id}"},
            "dateTime": now,
            "policyRule": {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                    "code": "OPTIN",
                }]
            },
            "sourceAttachment": {"contentType": "text/plain", "data": consent_text},
        },
    })
    included_types.append("Consent")

    composition_id = str(uuid.uuid4())
    entries.append({
        "fullUrl": f"urn:uuid:{composition_id}",
        "resource": {
            "resourceType": "Composition",
            "id": composition_id,
            "status": "final",
            "type": {
                "coding": [{
                    "system": "http://loinc.org",
                    "code": "11488-4",
                    "display": "Consultation note",
                }]
            },
            "subject": {"reference": f"Patient/{patient_id}"},
            "author": [{"reference": f"Practitioner/{doctor_id}"}],
            "date": now,
            "title": "Telehealth SOAP Note",
            "section": [
                {"title": "Subjective", "text": {"status": "generated", "div": soap_note.subjective}},
                {"title": "Objective", "text": {"status": "generated", "div": soap_note.objective}},
                {"title": "Assessment", "text": {"status": "generated", "div": soap_note.assessment}},
                {"title": "Plan", "text": {"status": "generated", "div": soap_note.plan}},
            ],
        },
    })
    included_types.append("Composition")

    if prescription_request is not None:
        normalized = prescription_request.medication_name.strip().lower()
        rxnorm = prescription_request.rxnorm_code or _RXNORM_CODES.get(normalized, "")
        coding_entry: dict = {"display": prescription_request.medication_name}
        if rxnorm:
            coding_entry = {
                "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                "code": rxnorm,
                "display": prescription_request.medication_name,
            }
        med_id = str(uuid.uuid4())
        entries.append({
            "fullUrl": f"urn:uuid:{med_id}",
            "resource": {
                "resourceType": "MedicationRequest",
                "id": med_id,
                "status": "active",
                "intent": "proposal",
                "medicationCodeableConcept": {
                    "coding": [coding_entry],
                    "text": prescription_request.medication_name,
                },
                "subject": {"reference": f"Patient/{patient_id}"},
                "requester": {"reference": f"Practitioner/{doctor_id}"},
                "authoredOn": now,
                "dosageInstruction": [{
                    "text": (
                        f"{prescription_request.dosage_text} "
                        f"{prescription_request.frequency_text} "
                        f"for {prescription_request.duration_text}"
                    ),
                }],
                "dispenseRequest": {"validityPeriod": {"start": now}},
            },
        })
        included_types.append("MedicationRequest")

    bundle: dict = {
        "resourceType": "Bundle",
        "id": str(uuid.uuid4()),
        "type": "document",
        "timestamp": now,
        "entry": entries,
    }

    return FhirBundleResult(bundle=bundle, included_resource_types=included_types)
