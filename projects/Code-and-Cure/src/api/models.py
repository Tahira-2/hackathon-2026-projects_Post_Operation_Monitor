from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

# --- Auth Models ---
class UserLogin(BaseModel):
    username: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    role: str # 'patient' or 'doctor'

# --- Symptom & Specialty Models ---
class SymptomRequest(BaseModel):
    symptoms: str

class SpecialtyResponse(BaseModel):
    specialty: str
    confidence: float

# --- Doctor & Appointment Models ---
class Doctor(BaseModel):
    id: str
    name: str
    specialty: str
    location: str

class AppointmentSlot(BaseModel):
    id: str
    doctor_id: str
    start_time: datetime
    is_available: bool

class BookingRequest(BaseModel):
    slot_id: str
    patient_id: str

# --- Consultation & SOAP Models ---
class ConsultationTranscript(BaseModel):
    appointment_id: str
    transcript: str

class SOAPNote(BaseModel):
    subjective: str
    objective: str
    assessment: str
    plan: str

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
