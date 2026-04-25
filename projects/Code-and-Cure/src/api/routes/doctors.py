from fastapi import APIRouter, HTTPException, Query
from src.api.models import Doctor, AppointmentSlot
from typing import List
from datetime import datetime, timedelta

router = APIRouter()

# --- MOCK DATA ---
# Covers ALL specialties from the symptom map so every symptom
# leads to at least one doctor. Person 4 will replace with Supabase.
MOCK_DOCTORS = [
    # Neurology (headache)
    Doctor(id="doc-001", name="Dr. Sarah Chen", specialty="Neurology", location="Houston, TX", rating=4.8, review_count=127),
    Doctor(id="doc-002", name="Dr. James Patel", specialty="Neurology", location="Dallas, TX", rating=4.6, review_count=89),
    # Cardiology (chest pain)
    Doctor(id="doc-003", name="Dr. Maria Lopez", specialty="Cardiology", location="Houston, TX", rating=4.9, review_count=203),
    # Dermatology (skin rash)
    Doctor(id="doc-004", name="Dr. Kevin Obi", specialty="Dermatology", location="Austin, TX", rating=4.7, review_count=156),
    # Psychiatry (anxiety)
    Doctor(id="doc-005", name="Dr. Aisha Rahman", specialty="Psychiatry", location="Houston, TX", rating=4.5, review_count=72),
    # Orthopedics (back pain)
    Doctor(id="doc-006", name="Dr. Tom Rivera", specialty="Orthopedics", location="San Antonio, TX", rating=4.4, review_count=98),
    # Ophthalmology (blurry vision)
    Doctor(id="doc-007", name="Dr. Linda Wu", specialty="Ophthalmology", location="Houston, TX", rating=4.7, review_count=134),
    # Dentistry (toothache)
    Doctor(id="doc-008", name="Dr. Eric Novak", specialty="Dentistry", location="Dallas, TX", rating=4.3, review_count=67),
    # Gastroenterology (stomach ache)
    Doctor(id="doc-009", name="Dr. Priya Sharma", specialty="Gastroenterology", location="Houston, TX", rating=4.6, review_count=112),
    # General Practice (fallback for unknown symptoms)
    Doctor(id="doc-010", name="Dr. David Kim", specialty="General Practice", location="Houston, TX", rating=4.8, review_count=245),
]

@router.get("/", response_model=List[Doctor])
async def list_doctors(specialty: str = Query(None, description="Filter by specialty")):
    """
    Doctor Discovery: Returns a list of doctors with Google Review ratings.
    Optionally filtered by specialty (from symptom analysis).

    Will be wired to: from src.database.db_client import get_doctors
    """
    if specialty:
        filtered = [d for d in MOCK_DOCTORS if d.specialty.lower() == specialty.lower()]
        if not filtered:
            return []
        return filtered

    return MOCK_DOCTORS

@router.get("/{doctor_id}/slots", response_model=List[AppointmentSlot])
async def get_available_slots(doctor_id: str):
    """
    Returns dynamically generated time slots for a specific doctor.
    In the real version, this subtracts booked slots from the database.

    Will be wired to: from src.database.db_client import get_slots
    """
    # Verify doctor exists
    doctor = next((d for d in MOCK_DOCTORS if d.id == doctor_id), None)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Generate mock slots for tomorrow (9 AM to 1 PM, 30 min each)
    tomorrow = datetime.now().replace(hour=9, minute=0, second=0) + timedelta(days=1)
    slots = []
    for i in range(8):
        slot_time = tomorrow + timedelta(minutes=30 * i)
        slots.append(AppointmentSlot(
            id=f"slot-{doctor_id}-{i+1}",
            doctor_id=doctor_id,
            start_time=slot_time,
            is_available=(i != 2)  # Slot 3 is "already booked" for realism
        ))

    return slots
