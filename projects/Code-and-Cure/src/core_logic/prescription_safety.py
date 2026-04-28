"""Medication safety policy logic module."""

import re

from src.core_logic.models import PrescriptionRequest
from src.core_logic.models import PrescriptionSafetyResult

CONTROLLED_SUBSTANCES: frozenset[str] = frozenset(
    {
        # Opioids / narcotics
        "oxycodone",
        "oxycontin",
        "percocet",
        "hydrocodone",
        "vicodin",
        "lortab",
        "morphine",
        "fentanyl",
        "fentanyyl",
        "dilaudid",
        "hydromorphone",
        "oxymorphone",
        "tapentadol",
        "meperidine",
        "demerol",
        "codeine",
        "tramadol",
        # Stimulants
        "adderall",
        "amphetamine",
        "dextroamphetamine",
        "vyvanse",
        "lisdexamfetamine",
        "methylphenidate",
        "ritalin",
        "concerta",
        "focalin",
        "modafinil",
        "armodafinil",
        # Benzodiazepines / sedatives
        "alprazolam",
        "xanax",
        "diazepam",
        "valium",
        "lorazepam",
        "ativan",
        "clonazepam",
        "klonopin",
        "temazepam",
        "triazolam",
        "midazolam",
        "chlordiazepoxide",
        "librium",
        "zolpidem",
        "ambien",
        "eszopiclone",
        "lunesta",
        "zaleplon",
        "sonata",
        # Other high-risk controlled drugs
        "ketamine",
        "buprenorphine",
        "methadone",
        "carisoprodol",
        "soma",
        "pregabalin",
        "lyrica",
        "gabapentin",
        "phentermine",
        "qsymia",
        "belviq",
        "dronabinol",
        "marinol",
        "testosterone",
        "anavar",
        "oxandrolone",
        "nandrolone",
        # Illicit / misspellings
        "heroin",
        "heroine",
        "cocaine",
        "meth",
        "methamphetamine",
    }
)


def _normalize_medication_name(value: str) -> str:
    # Keep letters/numbers/spaces only so entries like "fentanyl 50mcg patch"
    # still match the blocked keyword list.
    cleaned = re.sub(r"[^a-z0-9\s]+", " ", value.strip().lower())
    return re.sub(r"\s+", " ", cleaned).strip()


def check_prescription_safety(request: PrescriptionRequest) -> PrescriptionSafetyResult:
    """Evaluate whether a medication is allowed under telehealth prescription policy.

    Controlled substances are hard-blocked regardless of dosage or context.
    Matching is case-insensitive against the CONTROLLED_SUBSTANCES list.
    """
    normalized = _normalize_medication_name(request.medication_name)
    tokens = normalized.split()
    blocked = (
        normalized in CONTROLLED_SUBSTANCES
        or any(token in CONTROLLED_SUBSTANCES for token in tokens)
    )
    if blocked:
        return PrescriptionSafetyResult(
            is_allowed=False,
            reason="Not approved by HIPAA face to face required.",
            normalized_medication_name=normalized,
        )
    return PrescriptionSafetyResult(
        is_allowed=True,
        reason="General/non-controlled medication approved for telehealth prescription.",
        normalized_medication_name=normalized,
    )
