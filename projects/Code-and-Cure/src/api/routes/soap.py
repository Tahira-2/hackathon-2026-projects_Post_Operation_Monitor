from fastapi import APIRouter, HTTPException, Depends
from src.api.models import ConsultationTranscript, SOAPNote, SOAPApprovalRequest
from src.api.dependencies import require_role

router = APIRouter()

# --- MOCK PERSON 3 & 4 SERVICES ---
# Simulates Supabase storage for the hackathon
MOCK_APPROVED_SOAP_DB = {}

def mock_ai_parse_transcript(transcript: str) -> SOAPNote:
    """Mock Person 3 core logic: Parses raw transcript into SOAP format using AI."""
    # In production, this imports Person 3's LangChain/LLM service.
    return SOAPNote(
        subjective="Patient reports worsening headaches over the past 3 days.",
        objective="Patient appears in mild distress. No visible physical trauma.",
        assessment="Tension headache, possible migraine.",
        plan="Prescribe ibuprofen 400mg PRN. Rest in dark room. Follow up in 1 week if no improvement."
    )

@router.post("/generate", response_model=SOAPNote, dependencies=[Depends(require_role("doctor"))])
async def generate_soap_note(request: ConsultationTranscript):
    """
    Doctor-only route.
    Accepts raw audio transcript, delegates to AI parser, returns draft SOAP note.
    """
    # 1. Validation (Traffic Controller role)
    if not request.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty.")
        
    # 2. DELEGATE TO LOGIC LAYER
    draft_note = mock_ai_parse_transcript(request.transcript)
    
    return draft_note

@router.patch("/approve", dependencies=[Depends(require_role("doctor"))])
async def approve_soap_note(request: SOAPApprovalRequest):
    """
    Doctor-only route.
    Accepts the final, human-edited SOAP note and securely saves it to the database.
    """
    # 1. DELEGATE TO DB LAYER (Person 4 Mock)
    # We save the final approved note using the appointment_id so the FHIR exporter can find it later.
    MOCK_APPROVED_SOAP_DB[request.appointment_id] = {
        "status": "APPROVED",
        "note": request.edited_note.dict()
    }
    
    # 2. Return success contract
    return {
        "status": "success",
        "message": f"SOAP note for appointment {request.appointment_id} has been securely approved and saved.",
        "record_status": "APPROVED"
    }
