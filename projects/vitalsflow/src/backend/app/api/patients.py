"""
Patient endpoints — /patients/search and /patients/{patient_id}/summary.
All FHIR data is fetched from the HAPI FHIR public R4 server by fhir_client.
"""

# Standard library
import logging

# Third-party
from fastapi import APIRouter, HTTPException, Query

# Internal
from app.schemas.triage import PatientSearchResult, PatientSummary
from app.services.fhir_client import get_conditions, get_observations, get_patient, search_patients
from app.services.normalizer import normalize_patient

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/search", response_model=list[PatientSearchResult])
async def search(
    name: str = Query(default="", description="Patient name to search"),
    count: int = Query(default=10, ge=1, le=50, description="Max results"),
) -> list[PatientSearchResult]:
    """
    Search patients by name from HAPI FHIR.
    Returns [] when no results — never 404 on empty search.
    """
    try:
        raw_patients = await search_patients(name=name, count=count)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=f"FHIR search failed: {exc}") from exc

    results: list[PatientSearchResult] = []
    for p in raw_patients:
        try:
            pid = p.get("id", "")
            # Extract name: join given names + family
            name_entries = p.get("name", [])
            if name_entries:
                entry = name_entries[0]
                given = " ".join(entry.get("given", []))
                family = entry.get("family", "")
                display_name = f"{given} {family}".strip() or "Unknown"
            else:
                display_name = "Unknown"

            results.append(
                PatientSearchResult(
                    id=pid,
                    name=display_name,
                    dob=p.get("birthDate", ""),
                    gender=p.get("gender", ""),
                )
            )
        except Exception as exc:
            logger.warning("Skipping malformed patient resource: %s", exc)
            continue

    return results


@router.get("/{patient_id}/summary", response_model=PatientSummary)
async def patient_summary(patient_id: str) -> PatientSummary:
    """
    Fetch and normalise a single patient's FHIR data.
    Returns 404 if the patient is not found on the FHIR server.
    """
    try:
        patient = await get_patient(patient_id)
    except RuntimeError as exc:
        msg = str(exc)
        if "not found" in msg.lower():
            raise HTTPException(status_code=404, detail=msg) from exc
        raise HTTPException(status_code=500, detail=f"Failed to fetch patient data: {exc}") from exc

    conditions = await get_conditions(patient_id)
    observations = await get_observations(patient_id)

    clinical_summary = normalize_patient(patient, conditions, observations)

    # Extract display fields from the Patient resource
    name_entries = patient.get("name", [])
    if name_entries:
        entry = name_entries[0]
        given = " ".join(entry.get("given", []))
        family = entry.get("family", "")
        display_name = f"{given} {family}".strip() or "Unknown"
    else:
        display_name = "Unknown"

    return PatientSummary(
        patient_id=patient_id,
        name=display_name,
        dob=patient.get("birthDate", ""),
        gender=patient.get("gender", ""),
        clinical_summary=clinical_summary,
    )
