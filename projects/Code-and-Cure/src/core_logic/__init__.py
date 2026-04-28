"""Public contracts exposed by the core_logic package."""

from .fhir_builder import build_fhir_bundle
from .models import FhirBundleResult
from .models import EscalationResult
from .models import PrescriptionRequest
from .models import PrescriptionSafetyResult
from .models import SlotRequest
from .models import SlotResult
from .models import SoapNote
from .models import SpecialtyRecommendation
from .models import SymptomInput
from .prescription_safety import check_prescription_safety
from .prescription_safety import CONTROLLED_SUBSTANCES
from .red_flag import detect_red_flag_escalation
from .soap_pdf import render_soap_note_pdf_bytes

__all__ = [
    "build_fhir_bundle",
    "check_prescription_safety",
    "CONTROLLED_SUBSTANCES",
    "detect_red_flag_escalation",
    "EscalationResult",
    "FhirBundleResult",
    "PrescriptionRequest",
    "PrescriptionSafetyResult",
    "SlotRequest",
    "SlotResult",
    "SoapNote",
    "SpecialtyRecommendation",
    "SymptomInput",
    "render_soap_note_pdf_bytes",
]
