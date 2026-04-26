from fastapi import APIRouter, Query, Depends
from src.api.models import Doctor, AppointmentSlot
from src.api.dependencies import require_role
from src.database.db_client import get_doctors
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/", response_model=List[Doctor], dependencies=[Depends(require_role("patient"))])
async def list_doctors(
    specialty: Optional[str] = Query(None, description="Filter by specialty"),
    latitude: Optional[float] = Query(None, description="Patient latitude for proximity search"),
    longitude: Optional[float] = Query(None, description="Patient longitude for proximity search"),
    # TODO: radius (miles) unsupported by DB wrapper; approximate ±1-degree box filtering used instead
    radius: Optional[int] = Query(None, description="Search radius in miles (not yet supported; approximate box filter used)"),
):
    """
    Doctor Discovery: Returns DB-backed list of doctors with ratings.
    Filters by specialty and/or approximate location bounding box.
    """
    rows = get_doctors(specialty=specialty, lat=latitude, lng=longitude)

    # Adapter: map DB field names to API model field names
    return [
        Doctor(
            id=row["id"],
            name=row.get("full_name", ""),       # DB: full_name -> API: name
            specialty=row.get("specialty", ""),
            location=row.get("address", ""),      # DB: address -> API: location
            rating=float(row.get("rating") or 0.0),
            review_count=int(row.get("review_count") or 0),
        )
        for row in rows
    ]


@router.get("/{doctor_id}/slots", response_model=List[AppointmentSlot], dependencies=[Depends(require_role("patient"))])
async def get_available_slots(doctor_id: str):
    """
    Returns deterministic time slots for a doctor (9 AM–1 PM tomorrow, 30 min each).
    Slot IDs and start_times are compatible with BookingRequest (doctor_id + scheduled_at).
    """
    tomorrow = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0) + timedelta(days=1)
    return [
        AppointmentSlot(
            id=f"slot-{doctor_id}-{i + 1}",
            doctor_id=doctor_id,
            start_time=tomorrow + timedelta(minutes=30 * i),
            is_available=(i != 2),  # Slot 3 deterministically unavailable for demo realism
        )
        for i in range(8)
    ]
