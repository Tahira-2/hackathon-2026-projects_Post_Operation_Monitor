from fastapi import APIRouter, HTTPException, Depends
from src.api.models import IntakeForm
from src.api.dependencies import require_role, get_current_user
from src.database.db_client import insert_intake_form, get_intake_by_appointment

router = APIRouter()


@router.post("/", dependencies=[Depends(require_role("patient"))])
async def submit_intake_form(form: IntakeForm, current_user: dict = Depends(get_current_user)):
    """
    Patient-only route.
    patient_id is sourced from JWT — client-provided patient_id is ignored.
    """
    patient_id = current_user["user_id"]

    if not form.symptoms or not form.symptoms.strip():
        raise HTTPException(status_code=400, detail="Symptoms field is required.")

    row = insert_intake_form(
        appointment_id=form.appointment_id,
        patient_id=patient_id,
        symptoms=form.symptoms,
        allergies=form.allergies or "",
        medications=form.medications or "",
        medical_history=form.medical_history or "",
    )

    if not row or not row.get("id"):
        raise HTTPException(status_code=500, detail="Failed to save intake form.")

    return {
        "intake_record_id": row["id"],
        "status": "success",
        "message": "Intake form submitted successfully. Ready for doctor review.",
    }


@router.get("/{appointment_id}", response_model=IntakeForm, dependencies=[Depends(require_role("doctor"))])
async def get_intake_form(appointment_id: str):
    """
    Doctor-only route. Fetches the read-only intake form for a specific appointment.
    """
    record = get_intake_by_appointment(appointment_id)

    if not record:
        raise HTTPException(status_code=404, detail="Intake form not found for this appointment.")

    return IntakeForm(
        appointment_id=record["appointment_id"],
        symptoms=record.get("symptoms", ""),
        medical_history=record.get("medical_history"),
        medications=record.get("medications"),
        allergies=record.get("allergies"),
        patient_id=record.get("patient_id"),
    )
