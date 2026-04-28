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

Precedence rule (core_logic vs. database `medication_policies`):
- `check_prescription_safety` is the primary gate; apply its result before any DB lookup.
- `medication_policies` table is an informational/audit reference only.
- A `blocked` result from core_logic must never be overridden by an `is_allowed=True` value in the DB.
- This ensures controlled substances remain blocked even under database misconfiguration.

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

- SOAP clinician approval is the required gate for FHIR/HL7 export.
- API should call prescription safety check before creating prescription artifacts.
- If blocked: return blocked status and reason, do not issue final prescription PDF artifact.
- Prescription status must not block SOAP-approved EMR/EHR export path.
- API owns transport behavior (HTTP status, response model), core_logic owns deterministic business logic only.

## 7) High-Risk Integration Guardrails

### SOAP to FHIR Coding Gap
- Parsed SOAP text alone is not enough for complete interoperability.
- API/integration layer must support coded representations for downstream resources (for example ICD-10/SNOMED mappings where available).
- If coding is uncertain, return explicit review-required status instead of inferring final clinical coding.

### Prescription PDF Legal Boundary
- Current medicine prescription order headstamp PDF is a workflow artifact, not a production legal EPCS signature artifact.
- Before issuing final medicine prescription order, API should validate provider identity fields:
  - `provider_npi`
  - `provider_dea` (when jurisdiction/workflow requires it)
- If required provider credentials are missing, keep medicine prescription order in blocked/review-required state.

### Clinician-in-the-Loop Checkpoint
- Recommended workflow:
  1) parse SOAP
  2) clinician review/sign step
  3) finalize SOAP/Prescription artifacts
  4) create/export interoperable payloads.
- This reduces risk of transcription/model interpretation mistakes before EMR handoff.

## 8) API Payload Pack (Step 11)

### 8.1 Triage Request (API -> core_logic)
```json
{
  "symptom_text": "Itchy red rash on both arms with mild fever for 2 days",
  "patient_id": "patient-1001",
  "red_flag_context": {
    "pregnant": false,
    "age_group": "adult"
  }
}
```

### 8.2 Triage Response (core_logic -> API -> frontend)
```json
{
  "recommended_specialty": "Dermatology",
  "department": "Navigation",
  "rationale": "Recommendation based on matched symptom cues in free-text triage input.",
  "source_symptom": "itchy red rash on both arms with mild fever for 2 days",
  "matched_cues": ["rash", "itchy skin", "fever"],
  "confidence": 0.8
}
```

### 8.3 Red-Flag Escalation Response
```json
{
  "escalation_required": true,
  "escalation_reason": "Urgent symptom cues detected. Route for immediate clinical review.",
  "matched_red_flags": ["chest pain", "shortness of breath"]
}
```

### 8.4 SOAP Parse + PDF Response
```json
{
  "soap_note": {
    "subjective": "Patient reports persistent cough and fatigue for 3 days.",
    "objective": "Mild fever 100.2F, no respiratory distress.",
    "assessment": "Likely viral syndrome.",
    "plan": "Hydration, rest, and acetaminophen."
  },
  "soap_pdf": {
    "artifact_type": "application/pdf",
    "artifact_transport": "bytes_or_download_url",
    "review_required": true
  }
}
```

### 8.5 Prescription Safety Response (Allowed)
```json
{
  "is_allowed": true,
  "reason": "General/non-controlled medication approved for telehealth prescription.",
  "normalized_medication_name": "amoxicillin",
  "status": "approved"
}
```

### 8.6 Prescription Safety Response (Blocked)
```json
{
  "is_allowed": false,
  "reason": "'Oxycodone' is a controlled substance blocked by telehealth prescription policy.",
  "normalized_medication_name": "oxycodone",
  "status": "blocked"
}
```

### 8.7 FHIR Bundle Response (Allowed Path)
```json
{
  "resourceType": "Bundle",
  "type": "document",
  "included_resource_types": ["Consent", "Composition", "MedicationRequest"],
  "entry_count": 3
}
```

### 8.8 FHIR Bundle Response (Blocked Prescription Path)
```json
{
  "resourceType": "Bundle",
  "type": "document",
  "included_resource_types": ["Consent", "Composition"],
  "entry_count": 2,
  "prescription_status": "blocked"
}
```
