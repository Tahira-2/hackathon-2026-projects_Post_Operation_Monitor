# Core Logic Contract Handoff (Person 2)

This document defines the current Person 3 request/response contracts that API routes should consume.

## 1) Symptom Triage Output

Function: `map_symptom_to_specialty(SymptomInput, triage_rules?) -> SpecialtyRecommendation`

Output fields:
- `specialty: str`
- `department: str`
- `rationale: str`
- `source_symptom: str`
- `matched_cues: list[str]`
- `confidence: float | None`

Example response shape:
```json
{
  "specialty": "Dermatology",
  "department": "Navigation",
  "rationale": "Recommendation based on matched symptom cues in free-text triage input.",
  "source_symptom": "itchy red rash on both arms for 2 days",
  "matched_cues": ["rash", "itchy skin"],
  "confidence": 0.7
}
```

## 2) Slot Generation Output

Function: `generate_available_slots(SlotRequest) -> SlotResult`

Input:
- `candidate_slots: list[str]` (doctor-specific shift slots from API/DB)
- `booked_slots: list[str]`

Output:
- `available_slots: list[str]` (ordered, deduplicated, booked removed)

Example:
```json
{
  "available_slots": ["14:00", "15:00"]
}
```

## 3) SOAP Parsing + SOAP PDF

Function:
- `parse_transcript_to_soap(transcript: str) -> SoapNote`
- `render_soap_note_pdf_bytes(note: SoapNote) -> bytes`

`SoapNote` fields:
- `subjective`
- `objective`
- `assessment`
- `plan`

API recommendation:
- return structured SOAP JSON for UI rendering
- expose SOAP PDF as download response or artifact metadata

## 4) Prescription Policy Gating

Function: `check_prescription_safety(PrescriptionRequest) -> PrescriptionSafetyResult`

Output fields:
- `is_allowed: bool`
- `reason: str`
- `normalized_medication_name: str`

Policy:
- controlled substances are blocked
- general/non-controlled meds allowed

## 5) FHIR Bundle Builder

Function:
`build_fhir_bundle(soap_note, patient_id, doctor_id, appointment_id, prescription_request?) -> FhirBundleResult`

Output:
- `bundle: dict`
- `included_resource_types: list[str]`

Resources currently included:
- `Consent`
- `Composition`
- `MedicationRequest` (only when prescription request is provided and policy allows upstream)

## 6) API Wiring Rules

- API should call prescription safety check before creating prescription artifacts.
- If blocked: return blocked status and reason, do not issue final prescription PDF artifact.
- API owns transport behavior (HTTP status, response model), core_logic owns deterministic business logic only.
