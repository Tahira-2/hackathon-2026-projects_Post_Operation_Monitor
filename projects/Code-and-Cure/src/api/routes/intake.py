from fastapi import APIRouter, HTTPException, Depends
from src.api.models import IntakeForm
from src.api.dependencies import require_role
import uuid

"""
COMPLIANCE REFERENCES:
- Responsibilities.md: Patient submits form (POST), Doctor reads it (GET).
- context.md: The intake form bridges the Patient Portal to the Doctor Portal.
- ai.md: SRP (Single Responsibility Principle) - Routing/validation only.
- ToDo.md: Future readiness for review-required states.
"""

router = APIRouter()

# --- MOCK DATABASE (Person 4 Layer) ---
# Simulates Supabase storage for the hackathon
MOCK_INTAKE_DB = {}

@router.post("/", dependencies=[Depends(require_role("patient"))])
async def submit_intake_form(form: IntakeForm):
    """
    Patient-only route. 
    Accepts the appointment ID and intake fields, writes to DB, returns record ID.
    """
    # 1. Validation (Traffic Controller role)
    if not form.chief_complaint:
        raise HTTPException(status_code=400, detail="Chief complaint is required.")

    # 2. Mock Person 4 Database Call
    record_id = str(uuid.uuid4())
    
    # Store the form using appointment_id as the lookup key for the doctor
    MOCK_INTAKE_DB[form.appointment_id] = {
        "id": record_id,
        "appointment_id": form.appointment_id,
        "chief_complaint": form.chief_complaint,
        "medical_history": form.medical_history,
        "current_medications": form.current_medications,
        "allergies": form.allergies,
        "status": "PENDING_REVIEW" # Prepares for ToDo.md review-required states
    }

    # 3. Clean JSON response per ai.md contract
    return {
        "intake_record_id": record_id,
        "status": "success",
        "message": "Intake form submitted successfully. Ready for doctor review."
    }

@router.get("/{appointment_id}", response_model=IntakeForm, dependencies=[Depends(require_role("doctor"))])
async def get_intake_form(appointment_id: str):
    """
    Doctor-only route.
    Fetches the read-only intake form for a specific appointment.
    """
    # 1. Mock Person 4 Database Call
    record = MOCK_INTAKE_DB.get(appointment_id)
    
    # 2. Validation
    if not record:
        raise HTTPException(status_code=404, detail="Intake form not found for this appointment.")

    # 3. Return the Pydantic model contract
    return IntakeForm(**record)
