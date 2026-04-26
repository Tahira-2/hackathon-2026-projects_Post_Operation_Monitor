"""
Triage endpoints for score calculation and clinician approval writeback.
"""

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.schemas.triage import TriageOutput, VitalsInput
from app.services.fhir_client import create_service_request, list_recent_service_requests
from app.services.triage_service import run_triage

router = APIRouter()


@router.post("/{patient_id}", response_model=TriageOutput)
async def triage(patient_id: str, vitals: VitalsInput) -> TriageOutput:
    """
    Run AI triage for a patient with current vitals.

    Fetches FHIR data from HAPI server, normalizes, calls Gemini,
    and returns a rich TriageOutput including deterministic NEWS2 subscores.
    """
    try:
        print(f"[VitalsFlow] POST /triage/{patient_id} received")
        print(f"[VitalsFlow] vitals={vitals.model_dump()}")
        return await run_triage(patient_id, vitals)
    except RuntimeError as exc:
        msg = str(exc)
        if "not found" in msg.lower():
            raise HTTPException(status_code=404, detail=msg) from exc
        raise HTTPException(status_code=500, detail=f"Triage failed: {msg}") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Triage failed: {exc}") from exc


@router.post("/{patient_id}/approve")
async def approve_action(patient_id: str, payload: dict) -> dict:
    """
    Create a FHIR ServiceRequest for a clinician-approved action.

    The endpoint drafts a resource from approved action context,
    then POSTs it to the configured FHIR server.
    """
    try:
        print(f"[VitalsFlow] POST /triage/{patient_id}/approve received")
        print(f"[VitalsFlow] approve payload={payload}")
        action = str(payload.get("action", "")).strip()
        if not action:
            raise ValueError("action is required")

        justification = str(payload.get("justification", "")).strip()
        risk_score = int(payload.get("risk_score", 0))
        news2_score = int(payload.get("news2_score", 0))
        triage_tier = str(payload.get("triage_tier", "unknown")).strip().lower()
        priority = _priority_for_tier(triage_tier)
        draft_id = uuid4().hex

        service_request = {
            "resourceType": "ServiceRequest",
            "status": "draft",
            "intent": "proposal",
            "priority": priority,
            "subject": {"reference": f"Patient/{patient_id}"},
            "code": {"text": action},
            "authoredOn": datetime.now(timezone.utc)
            .isoformat(timespec="seconds")
            .replace("+00:00", "Z"),
            "note": [
                {
                    "text": (
                        f"VitalsFlow AI suggested action: {action}. "
                        f"NEWS2 {news2_score}, risk {risk_score}/10, tier {triage_tier}. "
                        f"{justification or 'Clinician review recommended.'}"
                    ).strip()
                }
            ],
        }

        created = await create_service_request(service_request)
        created_id = str(created.get("id", "")).strip() or draft_id
        service_request["id"] = created_id
        print(f"Created ServiceRequest for patient={patient_id} action={action}")

        return {
            "message": "ServiceRequest created",
            "patient_id": patient_id,
            "service_request": service_request,
            "fhir_service_request_id": created_id,
            "created_fhir_resource": created,
        }
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"ServiceRequest create failed: {exc}",
        ) from exc


@router.get("/approvals")
async def approvals(count: int = 20) -> dict:
    """
    Return recent ServiceRequest drafts/proposals as approval queue data.
    """
    resources = await list_recent_service_requests(count=max(1, min(count, 50)))
    items: list[dict] = []
    for resource in resources:
        if resource.get("resourceType") != "ServiceRequest":
            continue

        status = str(resource.get("status", "")).lower()
        intent = str(resource.get("intent", "")).lower()
        if status != "draft" and intent != "proposal":
            continue

        subject_ref = resource.get("subject", {}).get("reference", "")
        patient_id = subject_ref.split("/")[-1] if "/" in subject_ref else subject_ref
        notes = resource.get("note", [])
        note_text = notes[0].get("text", "") if notes else ""
        items.append(
            {
                "id": resource.get("id", ""),
                "patient_id": patient_id,
                "headline": resource.get("code", {}).get("text", "Draft action"),
                "status": status or "draft",
                "intent": intent or "proposal",
                "priority": resource.get("priority", "routine"),
                "authored_on": resource.get("authoredOn", ""),
                "note": note_text,
            }
        )

    return {"items": items, "count": len(items)}


def _priority_for_tier(tier: str) -> str:
    return {
        "critical": "stat",
        "urgent": "urgent",
        "routine": "routine",
    }.get(tier, "routine")

