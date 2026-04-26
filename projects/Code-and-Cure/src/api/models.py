from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

# --- Auth Models ---
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: str # 'patient' or 'doctor'

class UserLogin(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    role: str # 'patient' or 'doctor'

# --- Symptom & Triage Models ---
class SymptomRequest(BaseModel):
    symptoms: str                          # Free-text input (e.g., "I have a bad headache and blurry vision")
    red_flag_context: Optional[str] = None # Escalation trigger (e.g., "patient reports chest tightness")

class TriageResponse(BaseModel):
    recommended_specialty: str             # e.g., "Neurology"
    department: str                        # e.g., "Navigation/Coordination"
    rationale: str                         # e.g., "Headache symptoms suggest neurological evaluation"
    extracted_symptom_cues: List[str]       # e.g., ["headache", "blurry vision"]
    confidence: Optional[float] = None     # e.g., 0.92

# --- Doctor & Appointment Models ---
class Doctor(BaseModel):
    id: str
    name: str
    specialty: str
    location: str
    rating: float          # e.g., 4.8 (from Google Reviews)
    review_count: int      # e.g., 127 (total reviews)

class AppointmentSlot(BaseModel):
    id: str
    doctor_id: str
    start_time: datetime
    is_available: bool

class BookingRequest(BaseModel):
    slot_id: str

# --- Intake Models ---
class IntakeForm(BaseModel):
    appointment_id: str
    chief_complaint: str
    medical_history: Optional[str] = None
    current_medications: Optional[str] = None
    allergies: Optional[str] = None

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
    dosage: str # e.g., "500mg"
    frequency: str # e.g., "Once daily"
    duration: str # e.g., "7 days"

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
    target_emr: str = "Athenahealth" # From Context.md

class EHRExportResponse(BaseModel):
    export_id: str
    status: str # "success" or "pending"
    fhir_bundle: Dict # The raw FHIR R4 JSON
    submission_timestamp: datetime
