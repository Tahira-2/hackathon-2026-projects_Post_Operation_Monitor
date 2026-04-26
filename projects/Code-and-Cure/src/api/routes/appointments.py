from fastapi import APIRouter, HTTPException, Depends
from src.api.models import BookingRequest
from src.api.dependencies import require_role, get_current_user
from src.database.db_client import (
    insert_appointment,
    get_appointments_for_patient,
    get_appointments_for_doctor,
    get_doctor_by_user_id,
)

router = APIRouter()


@router.post("/", dependencies=[Depends(require_role("patient"))])
async def create_appointment(request: BookingRequest, current_user: dict = Depends(get_current_user)):
    """
    Patient books a time slot. patient_id sourced from JWT (never trusted from client).
    """
    patient_id = current_user["user_id"]

    row = insert_appointment(
        patient_id=patient_id,
        doctor_id=request.doctor_id,
        scheduled_at=request.scheduled_at,
    )

    if not row or not row.get("id"):
        raise HTTPException(status_code=500, detail="Failed to create appointment.")

    return {
        "appointment_id": row["id"],
        "status": row.get("status", "pending"),
        "message": "Appointment booked successfully",
        "booking": row,
    }


@router.get("/")
async def get_appointments(current_user: dict = Depends(get_current_user)):
    """
    Returns appointments scoped to the authenticated user's role.
    Patient sees own bookings; doctor sees their schedule.
    """
    user_id = current_user["user_id"]
    role = current_user["role"]

    if role == "patient":
        return get_appointments_for_patient(patient_id=user_id)

    if role == "doctor":
        # JWT carries users.id; appointments reference doctors.id (different table)
        doctor = get_doctor_by_user_id(user_id)
        if not doctor:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"No doctor profile found for user {user_id}. "
                    "Ensure the doctor account has a linked profile before fetching appointments."
                ),
            )
        return get_appointments_for_doctor(doctor_id=doctor["id"])

    raise HTTPException(
        status_code=403,
        detail=f"Role '{role}' is not permitted to access appointments.",
    )
