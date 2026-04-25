"""Medication safety policy logic module."""

from src.core_logic.models import PrescriptionRequest
from src.core_logic.models import PrescriptionSafetyResult

CONTROLLED_SUBSTANCES: frozenset[str] = frozenset(
    {
        "oxycodone",
        "hydrocodone",
        "morphine",
        "fentanyl",
        "codeine",
        "tramadol",
        "adderall",
        "amphetamine",
        "dextroamphetamine",
        "methylphenidate",
        "ritalin",
        "alprazolam",
        "xanax",
        "diazepam",
        "valium",
        "lorazepam",
        "ativan",
        "clonazepam",
        "klonopin",
        "zolpidem",
        "ambien",
        "ketamine",
        "buprenorphine",
        "methadone",
        "carisoprodol",
        "pregabalin",
        "lyrica",
    }
)


def check_prescription_safety(request: PrescriptionRequest) -> PrescriptionSafetyResult:
    """Evaluate whether a medication is allowed under telehealth prescription policy.

    Controlled substances are hard-blocked regardless of dosage or context.
    Matching is case-insensitive against the CONTROLLED_SUBSTANCES list.
    """
    normalized = request.medication_name.strip().lower()
    if normalized in CONTROLLED_SUBSTANCES:
        return PrescriptionSafetyResult(
            is_allowed=False,
            reason=(
                f"'{request.medication_name}' is a controlled substance blocked "
                "by telehealth prescription policy."
            ),
            normalized_medication_name=normalized,
        )
    return PrescriptionSafetyResult(
        is_allowed=True,
        reason="General/non-controlled medication approved for telehealth prescription.",
        normalized_medication_name=normalized,
    )
