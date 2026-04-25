"""Public contracts exposed by the core_logic package."""

from .models import FhirBundleResult
from .models import PrescriptionRequest
from .models import PrescriptionSafetyResult
from .models import SlotRequest
from .models import SlotResult
from .models import SoapNote
from .models import SpecialtyRecommendation
from .models import SymptomInput
from .soap_pdf import render_soap_note_pdf_bytes

__all__ = [
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
