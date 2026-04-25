from fastapi import APIRouter, HTTPException
from src.api.models import BookingRequest
from typing import List
from datetime import datetime

router = APIRouter()

# In-memory store for booked appointments (replaces Supabase for hackathon)
# Person 4 will replace this with: from src.database.db_client import save_booking
BOOKED_APPOINTMENTS = []

@router.post("/book")
async def book_appointment(request: BookingRequest):
    """
    Golden Path Step 4: Patient books a time slot.
    Saves the booking and marks the slot as taken.
    """
    # Check if this slot is already booked
    for booking in BOOKED_APPOINTMENTS:
        if booking["slot_id"] == request.slot_id:
            raise HTTPException(status_code=409, detail="This slot is already booked")

    # Save the booking
    booking_record = {
        "slot_id": request.slot_id,
        "patient_id": request.patient_id,
        "booked_at": datetime.now().isoformat(),
        "status": "confirmed"
    }
    BOOKED_APPOINTMENTS.append(booking_record)

    return {
        "message": "Appointment booked successfully",
        "booking": booking_record
    }

@router.get("/doctor/{doctor_id}")
async def get_doctor_appointments(doctor_id: str):
    """
    Golden Path Step 6: Doctor dashboard fetches their booked appointments.
    """
    # Filter bookings that belong to this doctor (slot IDs contain the doctor ID)
    doctor_bookings = [
        b for b in BOOKED_APPOINTMENTS 
        if doctor_id in b["slot_id"]
    ]

    if not doctor_bookings:
        return []

    return doctor_bookings
