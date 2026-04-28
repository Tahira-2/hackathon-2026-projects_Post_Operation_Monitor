"""
Async FHIR client — all HTTP calls to the HAPI FHIR public R4 server.
Single responsibility: FHIR HTTP fetches only, no business logic.
"""

# Standard library
import logging

# Third-party
import httpx

# Internal
from app.core.config import settings

logger = logging.getLogger(__name__)

FHIR_TIMEOUT = 15.0  # seconds — if HAPI is slow, we show skeleton, not hang


async def search_patients(name: str = "", count: int = 10) -> list[dict]:
    """
    Search patients by name on the HAPI FHIR public server.
    Returns a list of raw Patient resource dicts.
    Returns [] if no results — never raises on empty.
    """
    params: dict = {"_count": count, "_summary": "true"}
    if name:
        params["name"] = name

    try:
        async with httpx.AsyncClient(timeout=FHIR_TIMEOUT) as client:
            resp = await client.get(
                f"{settings.fhir_base_url}/Patient",
                params=params,
                headers={"Accept": "application/fhir+json"},
            )
            resp.raise_for_status()
            bundle = resp.json()
            entries = bundle.get("entry", []) or []
            return [e["resource"] for e in entries if "resource" in e]
    except Exception as exc:
        logger.warning("FHIR search_patients failed: %s", exc)
        raise RuntimeError(f"FHIR patient search failed: {exc}") from exc


async def get_patient(patient_id: str) -> dict:
    """
    Fetch a single Patient resource by ID.
    Raises RuntimeError with 'not found' text on 404 so the router can return 404.
    """
    try:
        async with httpx.AsyncClient(timeout=FHIR_TIMEOUT) as client:
            resp = await client.get(
                f"{settings.fhir_base_url}/Patient/{patient_id}",
                headers={"Accept": "application/fhir+json"},
            )
            if resp.status_code == 404:
                raise RuntimeError(f"Patient {patient_id} not found on FHIR server")
            resp.raise_for_status()
            return resp.json()
    except RuntimeError:
        raise
    except Exception as exc:
        logger.warning("FHIR get_patient(%s) failed: %s", patient_id, exc)
        raise RuntimeError(f"Failed to fetch patient {patient_id}: {exc}") from exc


async def get_conditions(patient_id: str) -> list[dict]:
    """
    Fetch Condition resources for a patient.
    Returns [] if no entries — never raises on empty.
    """
    try:
        async with httpx.AsyncClient(timeout=FHIR_TIMEOUT) as client:
            resp = await client.get(
                f"{settings.fhir_base_url}/Condition",
                params={"patient": patient_id, "_count": 10},
                headers={"Accept": "application/fhir+json"},
            )
            resp.raise_for_status()
            bundle = resp.json()
            entries = bundle.get("entry", []) or []
            return [e["resource"] for e in entries if "resource" in e]
    except Exception as exc:
        logger.warning("FHIR get_conditions(%s) failed: %s", patient_id, exc)
        return []  # non-critical — triage can still run without conditions


async def get_observations(patient_id: str) -> list[dict]:
    """
    Fetch vital-signs Observation resources for a patient, sorted newest first.
    Returns [] if no entries — never raises on empty.
    """
    try:
        async with httpx.AsyncClient(timeout=FHIR_TIMEOUT) as client:
            resp = await client.get(
                f"{settings.fhir_base_url}/Observation",
                params={
                    "patient": patient_id,
                    "category": "vital-signs",
                    "_count": 20,
                    "_sort": "-date",
                },
                headers={"Accept": "application/fhir+json"},
            )
            resp.raise_for_status()
            bundle = resp.json()
            entries = bundle.get("entry", []) or []
            return [e["resource"] for e in entries if "resource" in e]
    except Exception as exc:
        logger.warning("FHIR get_observations(%s) failed: %s", patient_id, exc)
        return []  # non-critical — triage can still run without historical vitals


async def create_service_request(service_request: dict) -> dict:
    """
    Create a ServiceRequest resource on the configured FHIR server.

    Returns the created FHIR resource body.
    Raises RuntimeError on any failure so routers can convert to HTTP errors.
    """
    try:
        async with httpx.AsyncClient(timeout=FHIR_TIMEOUT) as client:
            resp = await client.post(
                f"{settings.fhir_base_url}/ServiceRequest",
                headers={
                    "Accept": "application/fhir+json",
                    "Content-Type": "application/fhir+json",
                },
                json=service_request,
            )
            resp.raise_for_status()
            return resp.json()
    except Exception as exc:
        logger.warning("FHIR create_service_request failed: %s", exc)
        raise RuntimeError(f"Failed to create ServiceRequest on FHIR server: {exc}") from exc


async def list_recent_service_requests(count: int = 20) -> list[dict]:
    """
    Fetch recent ServiceRequest resources from FHIR.
    Returns [] on failure to keep approvals UI non-blocking.
    """
    try:
        async with httpx.AsyncClient(timeout=FHIR_TIMEOUT) as client:
            resp = await client.get(
                f"{settings.fhir_base_url}/ServiceRequest",
                params={"_count": count, "_sort": "-_lastUpdated"},
                headers={"Accept": "application/fhir+json"},
            )
            resp.raise_for_status()
            bundle = resp.json()
            entries = bundle.get("entry", []) or []
            return [e["resource"] for e in entries if "resource" in e]
    except Exception as exc:
        logger.warning("FHIR list_recent_service_requests failed: %s", exc)
        return []
