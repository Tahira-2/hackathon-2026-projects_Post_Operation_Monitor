from fastapi import APIRouter, HTTPException, Depends
from src.api.models import EHRExportResponse
from src.api.dependencies import require_role, get_current_user
from src.core_logic.fhir_builder import build_fhir_bundle
from src.core_logic.models import SoapNote as CoreSoapNote
from src.database.db_client import (
    get_soap_note_by_appointment,
    get_appointment,
    insert_fhir_record,
)
from datetime import datetime
import uuid

router = APIRouter()


@router.get("/export/{appointment_id}", response_model=EHRExportResponse, dependencies=[Depends(require_role("doctor"))])
async def export_to_emr(appointment_id: str, current_user: dict = Depends(get_current_user)):
    """
    Doctor-only route.
    Enforces SOAP approval gate, builds FHIR R4 Bundle via Person 3,
    persists export record via Person 4, and returns the bundle.
    """
    # 1. Fetch SOAP note and enforce approval gate (Person 4)
    soap_row = get_soap_note_by_appointment(appointment_id)
    if not soap_row:
        raise HTTPException(status_code=404, detail="SOAP note not found for this appointment.")

    if not soap_row.get("approved"):
        raise HTTPException(
            status_code=409,
            detail="SOAP note has not been approved. Approve the note before exporting to EMR.",
        )

    # 2. Fetch appointment to obtain patient_id (Person 4)
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
    # soap_notes.doctor_id stores doctors.id (not users.id); fall back to JWT only if missing.
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

    # 4. Persist FHIR export record (Person 4)
    insert_fhir_record(
        soap_note_id=soap_row["id"],
        fhir_json=result.bundle,
        resource_type="Bundle",
    )

    return EHRExportResponse(
        export_id=str(uuid.uuid4()),
        status="success",
        fhir_bundle=result.bundle,
        submission_timestamp=datetime.now(),
    )
