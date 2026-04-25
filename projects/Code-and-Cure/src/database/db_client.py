import os
from datetime import datetime, timezone
from typing import Any

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def _first_or_none(data: Any) -> dict | None:
    if isinstance(data, list):
        return data[0] if data else None
    return data if isinstance(data, dict) else None


def get_user_by_email(email: str) -> dict | None:
    res = (
        supabase.table("users")
        .select("id,email,password_hash,full_name,role,created_at,updated_at")
        .eq("email", email)
        .limit(1)
        .execute()
    )
    return _first_or_none(res.data)


def insert_user(email: str, password_hash: str, full_name: str, role: str) -> dict:
    res = (
        supabase.table("users")
        .insert(
            {
                "email": email,
                "password_hash": password_hash,
                "full_name": full_name,
                "role": role,
            }
        )
        .execute()
    )
    return _first_or_none(res.data) or {}


def insert_doctor_profile(
    user_id: str, specialty: str, license_no: str, lat: float, lng: float, address: str
) -> dict:
    user_row = supabase.table("users").select("full_name").eq("id", user_id).limit(1).execute()
    user = _first_or_none(user_row.data)
    full_name = user["full_name"] if user else "Doctor"
    res = (
        supabase.table("doctors")
        .insert(
            {
                "user_id": user_id,
                "full_name": full_name,
                "specialty": specialty,
                "license_no": license_no,
                "lat": lat,
                "lng": lng,
                "address": address,
            }
        )
        .execute()
    )
    return _first_or_none(res.data) or {}


def get_doctors(specialty: str | None, lat: float | None, lng: float | None) -> list[dict]:
    query = supabase.table("doctors").select(
        "id,user_id,full_name,specialty,license_no,is_licensed,rating,review_count,review_source,lat,lng,address,availability"
    )
    if specialty:
        query = query.eq("specialty", specialty)
    if lat is not None:
        query = query.gte("lat", lat - 1.0).lte("lat", lat + 1.0)
    if lng is not None:
        query = query.gte("lng", lng - 1.0).lte("lng", lng + 1.0)
    return query.execute().data or []


def insert_appointment(patient_id: str, doctor_id: str, scheduled_at: str) -> dict:
    res = (
        supabase.table("appointments")
        .insert(
            {
                "patient_id": patient_id,
                "doctor_id": doctor_id,
                "scheduled_at": scheduled_at,
            }
        )
        .execute()
    )
    return _first_or_none(res.data) or {}


def get_appointments_for_patient(patient_id: str) -> list[dict]:
    res = (
        supabase.table("appointments")
        .select("id,patient_id,doctor_id,scheduled_at,status,notes,created_at")
        .eq("patient_id", patient_id)
        .execute()
    )
    return res.data or []


def get_appointments_for_doctor(doctor_id: str) -> list[dict]:
    res = (
        supabase.table("appointments")
        .select("id,patient_id,doctor_id,scheduled_at,status,notes,created_at")
        .eq("doctor_id", doctor_id)
        .execute()
    )
    return res.data or []


def update_appointment_status(appointment_id: str, status: str) -> dict:
    res = (
        supabase.table("appointments")
        .update({"status": status})
        .eq("id", appointment_id)
        .execute()
    )
    return _first_or_none(res.data) or {}


def insert_intake_form(
    appointment_id: str,
    patient_id: str,
    symptoms: str,
    allergies: str,
    medications: str,
    medical_history: str,
) -> dict:
    res = (
        supabase.table("intake_forms")
        .insert(
            {
                "appointment_id": appointment_id,
                "patient_id": patient_id,
                "symptoms": symptoms,
                "allergies": allergies,
                "medications": medications,
                "medical_history": medical_history,
            }
        )
        .execute()
    )
    return _first_or_none(res.data) or {}


def get_intake_by_appointment(appointment_id: str) -> dict | None:
    res = (
        supabase.table("intake_forms")
        .select("id,appointment_id,patient_id,symptoms,allergies,medications,medical_history,submitted_at")
        .eq("appointment_id", appointment_id)
        .limit(1)
        .execute()
    )
    return _first_or_none(res.data)


def insert_soap_note(
    appointment_id: str,
    doctor_id: str,
    subjective: str,
    objective: str,
    assessment: str,
    plan: str,
    raw_transcript: str,
) -> dict:
    res = (
        supabase.table("soap_notes")
        .insert(
            {
                "appointment_id": appointment_id,
                "doctor_id": doctor_id,
                "subjective": subjective,
                "objective": objective,
                "assessment": assessment,
                "plan": plan,
                "raw_transcript": raw_transcript,
            }
        )
        .execute()
    )
    return _first_or_none(res.data) or {}


def approve_soap_note(note_id: str) -> dict:
    approved_at = datetime.now(timezone.utc).isoformat()
    res = (
        supabase.table("soap_notes")
        .update({"approved": True, "approved_at": approved_at})
        .eq("id", note_id)
        .execute()
    )
    return _first_or_none(res.data) or {}


def get_soap_note(note_id: str) -> dict | None:
    res = (
        supabase.table("soap_notes")
        .select(
            "id,appointment_id,doctor_id,subjective,objective,assessment,plan,raw_transcript,clinic_name,provider_display_name,provider_license_id,clinic_logo_url,soap_pdf_generated_at,document_reference_id,approved,approved_at,created_at"
        )
        .eq("id", note_id)
        .limit(1)
        .execute()
    )
    return _first_or_none(res.data)


def insert_fhir_record(soap_note_id: str, fhir_json: dict) -> dict:
    res = (
        supabase.table("fhir_records")
        .insert({"soap_note_id": soap_note_id, "fhir_json": fhir_json})
        .execute()
    )
    return _first_or_none(res.data) or {}


def insert_log(user_id: str, action: str, resource: str, ip_address: str) -> None:
    supabase.table("logs").insert(
        {
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "ip_address": ip_address,
        }
    ).execute()


def list_medication_policies() -> list[dict]:
    res = (
        supabase.table("medication_policies")
        .select("id,medication_name,category,is_allowed,reference_source,notes,created_at")
        .order("medication_name")
        .execute()
    )
    return res.data or []


def get_medication_policy(medication_name: str) -> dict | None:
    res = (
        supabase.table("medication_policies")
        .select("id,medication_name,category,is_allowed,reference_source,notes,created_at")
        .eq("medication_name", medication_name)
        .limit(1)
        .execute()
    )
    return _first_or_none(res.data)


def list_allowed_medications() -> list[dict]:
    res = (
        supabase.table("medication_policies")
        .select("id,medication_name,category,is_allowed,reference_source,notes,created_at")
        .eq("is_allowed", True)
        .order("medication_name")
        .execute()
    )
    return res.data or []


def insert_prescription_order(
    appointment_id: str,
    patient_id: str,
    doctor_id: str,
    requested_medication: str,
    approval_status: str = "pending",
    block_reason: str | None = None,
) -> dict:
    res = (
        supabase.table("prescriptions")
        .insert(
            {
                "appointment_id": appointment_id,
                "patient_id": patient_id,
                "doctor_id": doctor_id,
                "requested_medication": requested_medication,
                "approval_status": approval_status,
                "block_reason": block_reason,
            }
        )
        .execute()
    )
    return _first_or_none(res.data) or {}


def update_prescription_status(
    prescription_id: str, approval_status: str, block_reason: str | None = None
) -> dict:
    res = (
        supabase.table("prescriptions")
        .update({"approval_status": approval_status, "block_reason": block_reason})
        .eq("id", prescription_id)
        .execute()
    )
    return _first_or_none(res.data) or {}


def get_prescriptions_for_patient(patient_id: str) -> list[dict]:
    res = (
        supabase.table("prescriptions")
        .select(
            "id,appointment_id,patient_id,doctor_id,requested_medication,approval_status,block_reason,clinic_name,provider_display_name,provider_license_id,clinic_logo_url,prescription_pdf_generated_at,document_reference_id,created_at"
        )
        .eq("patient_id", patient_id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []


def set_soap_document_metadata(
    note_id: str,
    clinic_name: str,
    provider_display_name: str,
    provider_license_id: str,
    clinic_logo_url: str | None,
    document_reference_id: str,
) -> dict:
    generated_at = datetime.now(timezone.utc).isoformat()
    res = (
        supabase.table("soap_notes")
        .update(
            {
                "clinic_name": clinic_name,
                "provider_display_name": provider_display_name,
                "provider_license_id": provider_license_id,
                "clinic_logo_url": clinic_logo_url,
                "soap_pdf_generated_at": generated_at,
                "document_reference_id": document_reference_id,
            }
        )
        .eq("id", note_id)
        .execute()
    )
    return _first_or_none(res.data) or {}


def set_prescription_document_metadata(
    prescription_id: str,
    clinic_name: str,
    provider_display_name: str,
    provider_license_id: str,
    clinic_logo_url: str | None,
    document_reference_id: str,
) -> dict:
    generated_at = datetime.now(timezone.utc).isoformat()
    res = (
        supabase.table("prescriptions")
        .update(
            {
                "clinic_name": clinic_name,
                "provider_display_name": provider_display_name,
                "provider_license_id": provider_license_id,
                "clinic_logo_url": clinic_logo_url,
                "prescription_pdf_generated_at": generated_at,
                "document_reference_id": document_reference_id,
            }
        )
        .eq("id", prescription_id)
        .execute()
    )
    return _first_or_none(res.data) or {}