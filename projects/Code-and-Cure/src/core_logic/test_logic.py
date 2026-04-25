"""Contract tests for core_logic package."""

from src.core_logic import FhirBundleResult
from src.core_logic import PrescriptionRequest
from src.core_logic import PrescriptionSafetyResult
from src.core_logic import SlotRequest
from src.core_logic import SlotResult
from src.core_logic import SoapNote
from src.core_logic import SpecialtyRecommendation
from src.core_logic import SymptomInput
from src.core_logic import build_fhir_bundle
from src.core_logic import check_prescription_safety
from src.core_logic import render_soap_note_pdf_bytes
from src.core_logic.soap_parser import parse_transcript_to_soap
from src.core_logic.slot_generator import generate_available_slots
from src.core_logic.symptom_mapper import map_symptom_to_specialty


def test_contracts_can_be_instantiated() -> None:
    symptom = SymptomInput(symptom="headache", patient_id="patient-123")
    recommendation = SpecialtyRecommendation(
        specialty="General Practice",
        department="CareNavigation",
        rationale="Symptom map match",
        source_symptom="headache",
        matched_cues=["headache"],
        confidence=0.6,
    )
    slot_request = SlotRequest(
        candidate_slots=["10:00", "10:30"],
        booked_slots=["10:00"],
    )
    slot_result = SlotResult(available_slots=["10:30"])
    soap_note = SoapNote(
        subjective="Headache for 2 days.",
        objective="No acute distress.",
        assessment="Likely tension headache.",
        plan="Hydration and follow-up.",
    )
    prescription = PrescriptionRequest(
        medication_name="Acetaminophen",
        dosage_text="500 mg",
        frequency_text="q8h prn",
        duration_text="3 days",
        rxnorm_code="161",
    )
    safety = PrescriptionSafetyResult(
        is_allowed=True,
        reason="General/non-controlled medication.",
        normalized_medication_name="acetaminophen",
    )
    fhir = FhirBundleResult(bundle={"resourceType": "Bundle"}, included_resource_types=["Consent"])

    assert symptom.symptom == "headache"
    assert recommendation.specialty == "General Practice"
    assert recommendation.confidence is not None
    assert slot_request.booked_slots == ["10:00"]
    assert slot_result.available_slots == ["10:30"]
    assert soap_note.subjective.startswith("Headache")
    assert prescription.medication_name == "Acetaminophen"
    assert safety.is_allowed is True
    assert fhir.bundle["resourceType"] == "Bundle"


def test_slot_request_defaults_are_explicit() -> None:
    request = SlotRequest(candidate_slots=[], booked_slots=[])

    assert request.candidate_slots == []
    assert request.booked_slots == []


def test_map_symptom_to_specialty_golden_path_headache() -> None:
    recommendation = map_symptom_to_specialty(SymptomInput(symptom="headache"))

    assert recommendation.specialty == "General Practice"
    assert recommendation.department == "Navigation"
    assert recommendation.source_symptom == "headache"
    assert "headache" in recommendation.matched_cues


def test_map_symptom_to_specialty_fallback_for_unknown_symptom() -> None:
    recommendation = map_symptom_to_specialty(SymptomInput(symptom="unknown symptom"))

    assert recommendation.specialty == "General Practice"
    assert recommendation.department == "Navigation"
    assert "fallback" in recommendation.rationale.lower()


def test_map_symptom_to_specialty_respects_injected_mapping() -> None:
    injected_rules = {
        "Internal Medicine": {
            "department": ("ClinicalSigner",),
            "cues": ("headache",),
        }
    }
    recommendation = map_symptom_to_specialty(
        SymptomInput(symptom="  HEADACHE  "),
        triage_rules=injected_rules,
    )

    assert recommendation.specialty == "Internal Medicine"
    assert recommendation.department == "ClinicalSigner"
    assert recommendation.source_symptom == "headache"


def test_map_symptom_to_specialty_routes_rash_and_itch_to_dermatology() -> None:
    recommendation = map_symptom_to_specialty(
        SymptomInput(symptom="I have itchy skin and rash on my arm"),
    )

    assert recommendation.specialty == "Dermatology"
    assert "rash" in recommendation.matched_cues


def test_map_symptom_to_specialty_routes_flank_kidney_text_to_nephrology() -> None:
    recommendation = map_symptom_to_specialty(
        SymptomInput(symptom="Severe flank pain with burning urination"),
    )

    assert recommendation.specialty == "Nephrology"
    assert any(cue in recommendation.matched_cues for cue in ("flank pain", "burning urination"))


def test_generate_available_slots_removes_exact_booked_time() -> None:
    result = generate_available_slots(
        SlotRequest(
            candidate_slots=["09:30", "10:00", "10:30"],
            booked_slots=["10:00"],
        )
    )

    assert result.available_slots == ["09:30", "10:30"]


def test_generate_available_slots_handles_mixed_availability_in_order() -> None:
    result = generate_available_slots(
        SlotRequest(
            candidate_slots=["09:00", "09:30", "10:00", "10:30", "11:00"],
            booked_slots=["09:30", "11:00"],
        )
    )

    assert result.available_slots == ["09:00", "10:00", "10:30"]


def test_generate_available_slots_handles_empty_cases() -> None:
    no_bookings = generate_available_slots(
        SlotRequest(candidate_slots=["14:00", "14:30"], booked_slots=[]),
    )
    no_candidates = generate_available_slots(
        SlotRequest(candidate_slots=[], booked_slots=["14:00"]),
    )

    assert no_bookings.available_slots == ["14:00", "14:30"]
    assert no_candidates.available_slots == []


def test_generate_available_slots_deduplicates_candidate_slots() -> None:
    result = generate_available_slots(
        SlotRequest(
            candidate_slots=["14:00", "14:00", "14:30", "15:00", "15:00"],
            booked_slots=["14:30"],
        )
    )

    assert result.available_slots == ["14:00", "15:00"]


def test_generate_available_slots_respects_doctor_specific_shift_input() -> None:
    # Candidate slots represent one doctor's afternoon shift only.
    result = generate_available_slots(
        SlotRequest(
            candidate_slots=["14:00", "14:30", "15:00"],
            booked_slots=["14:30"],
        )
    )

    assert result.available_slots == ["14:00", "15:00"]


def test_parse_transcript_to_soap_full_sections() -> None:
    transcript = (
        "Subjective: Patient reports cough and fatigue for 4 days. "
        "Objective: Mild fever 100.2F, no respiratory distress. "
        "Assessment: Likely viral upper respiratory infection. "
        "Plan: Hydration, rest, and follow-up if symptoms worsen."
    )

    note = parse_transcript_to_soap(transcript)

    assert "cough and fatigue" in note.subjective
    assert "Mild fever" in note.objective
    assert "viral upper respiratory infection" in note.assessment
    assert "Hydration" in note.plan


def test_parse_transcript_to_soap_handles_partial_sections() -> None:
    transcript = "Subjective: Rash on arms for 2 days. Plan: Trial topical cream."

    note = parse_transcript_to_soap(transcript)

    assert note.subjective == "Rash on arms for 2 days."
    assert note.objective == ""
    assert note.assessment == ""
    assert note.plan == "Trial topical cream."


def test_parse_transcript_to_soap_marker_case_spacing_tolerance() -> None:
    transcript = (
        "sUbJeCtIvE : severe stomach pain. "
        "OBJECTIVE: tenderness on exam. "
        "assessment : possible gastritis. "
        "PLAN: diet modification and review."
    )

    note = parse_transcript_to_soap(transcript)

    assert note.subjective == "severe stomach pain."
    assert note.objective == "tenderness on exam."
    assert note.assessment == "possible gastritis."
    assert note.plan == "diet modification and review."


def test_parse_transcript_to_soap_without_markers_goes_to_subjective() -> None:
    transcript = "Patient says headache and cough are improving since yesterday."

    note = parse_transcript_to_soap(transcript)

    assert note.subjective == transcript
    assert note.objective == ""
    assert note.assessment == ""
    assert note.plan == ""


def test_check_prescription_safety_allows_general_medication() -> None:
    result = check_prescription_safety(
        PrescriptionRequest(
            medication_name="Amoxicillin",
            dosage_text="500 mg",
            frequency_text="q8h",
            duration_text="7 days",
        )
    )

    assert result.is_allowed is True
    assert result.normalized_medication_name == "amoxicillin"


def test_check_prescription_safety_blocks_controlled_substance() -> None:
    result = check_prescription_safety(
        PrescriptionRequest(
            medication_name="Oxycodone",
            dosage_text="10 mg",
            frequency_text="q6h prn",
            duration_text="5 days",
        )
    )

    assert result.is_allowed is False
    assert "controlled substance" in result.reason.lower()
    assert result.normalized_medication_name == "oxycodone"


def test_check_prescription_safety_is_case_insensitive() -> None:
    result = check_prescription_safety(
        PrescriptionRequest(
            medication_name="ADDERALL",
            dosage_text="20 mg",
            frequency_text="once daily",
            duration_text="30 days",
        )
    )

    assert result.is_allowed is False
    assert result.normalized_medication_name == "adderall"


def test_build_fhir_bundle_includes_consent_and_composition() -> None:
    note = SoapNote(
        subjective="Patient reports headache.",
        objective="No fever.",
        assessment="Tension headache.",
        plan="Ibuprofen 400mg as needed.",
    )
    result = build_fhir_bundle(
        soap_note=note,
        patient_id="patient-001",
        doctor_id="doctor-001",
        appointment_id="appt-001",
    )

    assert result.bundle["resourceType"] == "Bundle"
    assert result.bundle["type"] == "document"
    assert "Consent" in result.included_resource_types
    assert "Composition" in result.included_resource_types
    assert "MedicationRequest" not in result.included_resource_types
    assert len(result.bundle["entry"]) == 2


def test_build_fhir_bundle_includes_medication_request_when_prescription_given() -> None:
    note = SoapNote(
        subjective="Ear infection symptoms.",
        objective="Redness in left ear.",
        assessment="Acute otitis media.",
        plan="Amoxicillin 500mg for 7 days.",
    )
    rx = PrescriptionRequest(
        medication_name="Amoxicillin",
        dosage_text="500 mg",
        frequency_text="q8h",
        duration_text="7 days",
        rxnorm_code="723",
    )
    result = build_fhir_bundle(
        soap_note=note,
        patient_id="patient-002",
        doctor_id="doctor-002",
        appointment_id="appt-002",
        prescription_request=rx,
    )

    assert "MedicationRequest" in result.included_resource_types
    assert len(result.bundle["entry"]) == 3
    med_entry = next(
        e for e in result.bundle["entry"]
        if e["resource"]["resourceType"] == "MedicationRequest"
    )
    assert med_entry["resource"]["medicationCodeableConcept"]["coding"][0]["code"] == "723"


def test_render_soap_note_pdf_bytes_returns_valid_pdf_header_and_footer() -> None:
    pdf_bytes = render_soap_note_pdf_bytes(
        SoapNote(
            subjective="Patient reports cough for 3 days.",
            objective="No acute distress.",
            assessment="Likely viral syndrome.",
            plan="Hydration and rest.",
        )
    )

    assert pdf_bytes.startswith(b"%PDF-1.4")
    assert b"%%EOF" in pdf_bytes
    assert b"CareIT SOAP Note" in pdf_bytes
    assert b"Subjective:" in pdf_bytes
