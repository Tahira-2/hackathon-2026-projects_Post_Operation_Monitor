"""Core logic data contracts for Person 3 modules."""

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class SymptomInput:
    """Input payload for symptom routing."""

    symptom: str
    patient_id: str | None = None


@dataclass(frozen=True)
class SpecialtyRecommendation:
    """Output contract from symptom mapping."""

    specialty: str
    department: str
    rationale: str
    source_symptom: str
    matched_cues: list[str] = field(default_factory=list)
    confidence: float | None = None


@dataclass(frozen=True)
class SlotRequest:
    """Input payload for slot generation."""

    candidate_slots: list[str]
    booked_slots: list[str]


@dataclass(frozen=True)
class SlotResult:
    """Output contract for available slot list."""

    available_slots: list[str]


@dataclass(frozen=True)
class SoapNote:
    """Structured 4-part SOAP note contract."""

    subjective: str = ""
    objective: str = ""
    assessment: str = ""
    plan: str = ""


@dataclass(frozen=True)
class PrescriptionRequest:
    """Input contract for medication safety checks."""

    medication_name: str
    dosage_text: str
    frequency_text: str
    duration_text: str
    rxnorm_code: str | None = None


@dataclass(frozen=True)
class PrescriptionSafetyResult:
    """Decision contract for prescribing safety policy checks."""

    is_allowed: bool
    reason: str
    normalized_medication_name: str


@dataclass(frozen=True)
class FhirBundleResult:
    """Bundle wrapper for generated FHIR resources."""

    bundle: dict[str, Any]
    included_resource_types: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class EscalationResult:
    """Urgent-care escalation hint contract."""

    escalation_required: bool
    escalation_reason: str
    matched_red_flags: list[str] = field(default_factory=list)
