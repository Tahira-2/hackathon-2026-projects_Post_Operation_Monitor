from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

# --- Auth Models ---
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: str  # 'patient' or 'doctor'

class UserLogin(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    role: str  # 'patient' or 'doctor'

# --- Symptom & Triage Models ---
class SymptomRequest(BaseModel):
    symptoms: str                          # Free-text input
    red_flag_context: Optional[str] = None # Additional escalation context

class TriageResponse(BaseModel):
    recommended_specialty: str
    department: str
    rationale: str
    extracted_symptom_cues: List[str]
    confidence: Optional[float] = None

# --- Doctor & Appointment Models ---
class Doctor(BaseModel):
    id: str
    name: str       # mapped from DB full_name
    specialty: str
    location: str   # mapped from DB address
    rating: float
    review_count: int

class AppointmentSlot(BaseModel):
    id: str
    doctor_id: str
    start_time: datetime
    is_available: bool

class BookingRequest(BaseModel):
    doctor_id: str              # doctors.id (DB primary key from /doctors list)
    scheduled_at: str           # ISO-8601 datetime string (from slot start_time)
    slot_id: Optional[str] = None  # UI context only; not persisted to DB

# --- Intake Models ---
# Field names align with DB schema (intake_forms table)
class IntakeForm(BaseModel):
    appointment_id: str
    symptoms: str                        # DB: symptoms (was: chief_complaint)
    medical_history: Optional[str] = None
    medications: Optional[str] = None   # DB: medications (was: current_medications)
    allergies: Optional[str] = None
    patient_id: Optional[str] = None    # Populated on GET from DB; ignored from client on POST

# --- Transcript streaming models ---
class TranscriptChunkRequest(BaseModel):
    appointment_id: str
    chunk: str  # Incremental transcript text from the consultation session

class TranscriptChunkResponse(BaseModel):
    appointment_id: str
    transcript_so_far: str   # Full accumulated transcript for this session
    soap_draft: "SOAPNote"   # Live SOAP draft re-parsed from full transcript
    is_updated: bool

# --- Consultation & SOAP Models ---
class ConsultationTranscript(BaseModel):
    appointment_id: str
    transcript: str

class SOAPNote(BaseModel):
    subjective: str
    objective: str
    assessment: str
    plan: str

class SOAPApprovalRequest(BaseModel):
    appointment_id: str
    edited_note: SOAPNote

class FHIRRecord(BaseModel):
    resourceType: str = "Bundle"
    entry: List[Dict]

# --- Digital Prescription Models (MedicationRequest) ---
class PrescriptionItem(BaseModel):
    medication_name: str
    dosage: str
    frequency: str
    duration: str

class DigitalPrescription(BaseModel):
    appointment_id: str
    patient_id: str
    doctor_id: str
    medications: List[PrescriptionItem]
    notes: Optional[str] = None
    prescribed_at: datetime = Field(default_factory=datetime.now)

# --- EHR Export Models (FHIR R4 Alignment) ---
class EHRExportRequest(BaseModel):
    appointment_id: str
    target_emr: str = "Athenahealth"

class EHRExportResponse(BaseModel):
    export_id: str
    status: str  # "success" or "pending"
    fhir_bundle: Dict  # Raw FHIR R4 JSON
    submission_timestamp: datetime

# --- Synthetic EMR Handoff Models ---
class EMRHandoffResponse(BaseModel):
    submission_id: str
    target_emr: str                        # e.g. "Athenahealth-sim"
    status: str                            # "acknowledged_simulated" | "failed_simulated"
    fhir_bundle_id: str                    # fhir_records.id of the source Bundle
    payload_hash: str                      # first 16 hex chars of SHA-256(bundle JSON)
    submitted_at: datetime
    acknowledged_at: Optional[datetime] = None
    simulated_response: Dict = {}          # synthetic ACK payload shown to judges


# --- Real-time Session Models ---

class SessionStartRequest(BaseModel):
    appointment_id: str
    language: str = "en"
    source_language: str = "en"
    target_language: str = "en"


class SessionStartResponse(BaseModel):
    session_id: str
    appointment_id: str
    status: str              # "active"
    provider_mode: str       # "fallback" | "asr" | "asr_stub"
    language: str
    created_at: str


class SOAPDraftMeta(BaseModel):
    derived_from_transcript: bool = True
    transcript_chars_processed: int = 0
    update_timestamp: str = ""
    chunk_index: int = 0
    quality_hint: str = "minimal"    # "minimal" | "partial" | "sufficient"
    change_summary: str = ""


class SOAPDraftWithMeta(BaseModel):
    subjective: str = ""
    objective: str = ""
    assessment: str = ""
    plan: str = ""
    metadata: SOAPDraftMeta = Field(default_factory=SOAPDraftMeta)


class SessionChunkRequest(BaseModel):
    appointment_id: str
    chunk_index: int        # monotonic 0-based; server enforces ordering
    transcript_chunk: str   # pre-transcribed text (fallback mode) or raw audio ref (future)
    language: str = "en"


class SessionChunkResponse(BaseModel):
    session_id: str
    appointment_id: str
    chunk_index: int
    transcript_so_far: str
    soap_draft: SOAPDraftWithMeta
    provider_status: str    # "processed" | "fallback_mode" | "error:..."
    session_status: str     # "active" | "finalized"


class SessionStateResponse(BaseModel):
    session_id: str
    appointment_id: str
    status: str             # "active" | "finalized"
    transcript: str
    last_chunk_index: int
    soap_draft: Optional[SOAPDraftWithMeta] = None
    provider_mode: str
    language: str
    created_at: str
    updated_at: str


class SessionFinalizeResponse(BaseModel):
    session_id: str
    appointment_id: str
    status: str             # "finalized"
    transcript: str
    final_soap: SOAPDraftWithMeta
    handoff_ready: bool     # True when quality_hint is "partial" or "sufficient"
    message: str


# --- Video Upload Transcription Models ---

class TranscribeUploadResponse(BaseModel):
    appointment_id: str
    transcript: str
    soap_draft: SOAPDraftWithMeta
    transcription_provider: str      # "openai_whisper_api" | "local_whisper"
    language_detected: str
    duration_seconds: Optional[float] = None
    file_info: Dict                  # {filename, size_mb, content_type}
    warning: Optional[str] = None
