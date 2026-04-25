"""Appointment slot generation logic."""

from src.core_logic.models import SlotRequest
from src.core_logic.models import SlotResult


def generate_available_slots(slot_request: SlotRequest) -> SlotResult:
    """Return available slots from doctor-specific candidates and booked times.

    The function is intentionally pure:
    - does not mutate inputs
    - preserves candidate ordering
    - removes duplicates in output
    - assumes candidate slots are provided by upstream doctor schedule logic
    """
    booked_lookup = set(slot_request.booked_slots)
    available: list[str] = []
    seen: set[str] = set()

    for slot in slot_request.candidate_slots:
        if slot in seen:
            continue
        seen.add(slot)
        if slot in booked_lookup:
            continue
        available.append(slot)

    return SlotResult(available_slots=available)

