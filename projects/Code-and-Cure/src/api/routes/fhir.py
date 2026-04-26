import hashlib
import json
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Depends
from src.api.models import EHRExportResponse, EMRHandoffResponse
from src.api.dependencies import require_role, get_current_user
from src.core_logic.fhir_builder import build_fhir_bundle
from src.core_logic.models import SoapNote as CoreSoapNote
from src.database.db_client import (
    get_soap_note_by_appointment,
    get_appointment,
    insert_fhir_record,
    get_fhir_record_by_soap_note,
    set_soap_export_workflow,
    get_or_create_doctor_profile,
)

router = APIRouter()

_TARGET_EMR = "Athenahealth-sim"


@router.get("/export/{appointment_id}", response_model=EHRExportResponse, dependencies=[Depends(require_role("doctor"))])
async def export_to_emr(appointment_id: str, current_user: dict = Depends(get_current_user)):
    doctor = get_or_create_doctor_profile(current_user["user_id"])
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found for current user.")

    """
    Doctor-only route.
    Enforces SOAP approval gate, builds FHIR R4 Bundle via Person 3,
    persists export record via Person 4, and returns the bundle.
    """
    # 1. Fetch SOAP note and enforce approval gate
    soap_row = get_soap_note_by_appointment(appointment_id)
    if not soap_row:
        raise HTTPException(status_code=404, detail="SOAP note not found for this appointment.")

    if not soap_row.get("approved"):
        raise HTTPException(
            status_code=409,
            detail="SOAP note has not been approved. Approve the note before exporting to EMR.",
        )

    # 2. Fetch appointment for patient_id — no fabricated fallback allowed
    appt = get_appointment(appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    patient_id = appt.get("patient_id")
    if not patient_id:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Appointment {appointment_id} has no linked patient_id. "
                "Cannot build a FHIR bundle with fabricated patient identity."
            ),
        )

    # Use doctors.id from the SOAP row — consistent with the clinical record.
    doctor_id = soap_row.get("doctor_id") or current_user["user_id"]

    # 3. Build FHIR R4 Bundle (Person 3)
    soap_note = CoreSoapNote(
        subjective=soap_row.get("subjective", ""),
        objective=soap_row.get("objective", ""),
        assessment=soap_row.get("assessment", ""),
        plan=soap_row.get("plan", ""),
    )

    result = build_fhir_bundle(
        soap_note=soap_note,
        patient_id=patient_id,
        doctor_id=doctor_id,
        appointment_id=appointment_id,
    )

    # 4. Persist FHIR export record
    insert_fhir_record(
        soap_note_id=soap_row["id"],
        fhir_json=result.bundle,
        resource_type="Bundle",
    )

    return EHRExportResponse(
        export_id=str(uuid.uuid4()),
        status="success",
        fhir_bundle=result.bundle,
        submission_timestamp=datetime.now(timezone.utc),
    )


@router.post("/submit/{appointment_id}", response_model=EMRHandoffResponse, dependencies=[Depends(require_role("doctor"))])
async def submit_to_emr(appointment_id: str, current_user: dict = Depends(get_current_user)):
    doctor = get_or_create_doctor_profile(current_user["user_id"])
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found for current user.")

    """
    Doctor-only route — synthetic EMR handoff.

    Requires:  SOAP approved  +  FHIR bundle already exported.
    Runs a deterministic simulated submission pipeline:
        prepared -> sent_simulated -> acknowledged_simulated
    Persists the submission record and marks the SOAP note as exported.
    Returns a structured status object with a traceable submission_id and
    synthetic ACK payload suitable for demo display.
    """
    # 1. SOAP approval gate
    soap_row = get_soap_note_by_appointment(appointment_id)
    if not soap_row:
        raise HTTPException(status_code=404, detail="SOAP note not found for this appointment.")
    if not soap_row.get("approved"):
        raise HTTPException(
            status_code=409,
            detail="SOAP note must be approved before EMR submission.",
        )

    # 2. Require prior FHIR export (do not re-export; caller must call /export first)
    fhir_record = get_fhir_record_by_soap_note(soap_row["id"], resource_type="Bundle")
    if not fhir_record:
        raise HTTPException(
            status_code=409,
            detail="FHIR bundle not yet exported. Call GET /fhir/export/{appointment_id} first.",
        )

    # 3. Deterministic payload hash (first 16 hex chars of SHA-256)
    bundle_str = json.dumps(fhir_record["fhir_json"], sort_keys=True)
    payload_hash = hashlib.sha256(bundle_str.encode()).hexdigest()[:16]

    submission_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    ack_time = now + timedelta(seconds=2)

    # 4. Persist synthetic submission record alongside the FHIR bundle records
    submission_meta: dict = {
        "submission_id": submission_id,
        "target_emr": _TARGET_EMR,
        "status": "acknowledged_simulated",
        "payload_hash": payload_hash,
        "status_history": [
            {"status": "prepared",               "at": now.isoformat()},
            {"status": "sent_simulated",         "at": (now + timedelta(seconds=1)).isoformat()},
            {"status": "acknowledged_simulated", "at": ack_time.isoformat()},
        ],
    }
    insert_fhir_record(
        soap_note_id=soap_row["id"],
        fhir_json=submission_meta,
        resource_type="EMRSubmission",
    )

    # 5. Mark SOAP note export_status as exported
    set_soap_export_workflow(
        note_id=soap_row["id"],
        coding_review_required=False,
        export_status="exported",
        target_vendor=_TARGET_EMR,
    )

    return EMRHandoffResponse(
        submission_id=submission_id,
        target_emr=_TARGET_EMR,
        status="acknowledged_simulated",
        fhir_bundle_id=fhir_record["id"],
        payload_hash=payload_hash,
        submitted_at=now,
        acknowledged_at=ack_time,
        simulated_response={
            "ack_code": "AA",
            "message": "Document received and processed by Athenahealth-sim",
            "transaction_id": f"SIM-{submission_id[:8].upper()}",
            "fhir_version": "R4",
            "resource_types_received": fhir_record.get("fhir_json", {}).get("entry", [])
                and [e.get("resource", {}).get("resourceType") for e in fhir_record["fhir_json"].get("entry", [])],
        },
    )
