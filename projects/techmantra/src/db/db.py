"""
db/db.py — base: Performs patient and session related operations using SQLite.
Includes FHIR R4 export logic and AI triage session storage.
"""

import json
import sqlite3
import uuid
from pathlib import Path
from datetime import datetime, timezone

# Use .resolve() to get the absolute, real path
DB_PATH     = Path(__file__).resolve().parent / "triage.db"
SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    """Create tables from schema.sql. Safe to call multiple times."""
    conn = get_connection()
    with open(SCHEMA_PATH) as f:
        conn.executescript(f.read())
    _ensure_patient_email_column(conn)
    conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_email ON patients(email)")
    conn.commit()
    conn.close()
    print(f"[db] Tables created/verified at {DB_PATH}")


# ── Patient Operations ───────────────────────────────────────────

def save_patient(email: str, name: str, age: int, sex: str,
                 height_cm: float, weight_kg: float, place: str) -> str:
    patient_id = str(uuid.uuid4())
    clean_email = (email or "").strip().lower()
    conn = get_connection()
    conn.execute(
        "INSERT INTO patients (id, email, name, age, sex, height_cm, weight_kg, place) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (patient_id, clean_email, name, age, sex, height_cm, weight_kg, place)
    )
    conn.commit()
    conn.close()
    return patient_id


def get_patient(patient_id: str) -> dict | None:
    conn = get_connection()
    row = conn.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_patient_by_email(email: str) -> dict | None:
    clean_email = (email or "").strip().lower()
    conn = get_connection()
    row = conn.execute("SELECT * FROM patients WHERE email = ?", (clean_email,)).fetchone()
    conn.close()
    return dict(row) if row else None


# ── Session & Triage Operations ──────────────────────────────────

def save_session(patient_id: str, symptoms: str, diagnosis: dict, risk: str) -> str:
    """
    Saves the final AI triage result to the sessions table.
    """
    session_id = str(uuid.uuid4())
    conn = get_connection()
    
    # Serialize the diagnosis dict to a JSON string for storage
    diag_json = json.dumps(diagnosis)
    
    conn.execute(
        """
        INSERT INTO sessions (id, patient_id, symptoms, risk_tier, diagnosis, created_at) 
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (session_id, patient_id, symptoms, risk, diag_json, _now_iso())
    )
    conn.commit()
    conn.close()
    return session_id


def save_diagnostic_report(patient_id: str, session_id: str, llm_output: dict) -> dict:
    """
    Converts AI triage output → FHIR DiagnosticReport and UPDATES the session.
    """
    # Extracting data from your BioMistral/LLM structure
    # Supports both nested 'doctor_output' or flat 'top_conditions'
    top_conditions = llm_output.get("doctor_output", {}).get("differential_diagnosis", 
                     llm_output.get("top_conditions", []))
    
    risk = llm_output.get("patient_output", {}).get("risk_level", 
           llm_output.get("risk_tier", "LOW"))

    report = {
        "resourceType": "DiagnosticReport",
        "id": session_id,
        "status": "final",
        "subject": {"reference": f"Patient/{patient_id}"},
        "issued": _now_iso(),
        "conclusion": llm_output.get("summary", "Preliminary AI Analysis"),
        "extension": [
            {"url": "http://example.org/risk-tier", "valueString": risk},
            {"url": "http://example.org/raw-diagnosis", "valueString": json.dumps(llm_output)}
        ]
    }

    # Update the sessions table with the generated FHIR JSON
    conn = get_connection()
    conn.execute(
        "UPDATE sessions SET fhir_report = ? WHERE id = ?", 
        (json.dumps(report), session_id)
    )
    conn.commit()
    conn.close()

    return report


# ── Metadata & Physician Operations ─────────────────────────────

def save_allergy(patient_id: str, allergen: str, severity: str = "unknown") -> str:
    allergy_id = str(uuid.uuid4())
    conn = get_connection()
    conn.execute(
        "INSERT INTO allergies (id, patient_id, allergen, severity) VALUES (?, ?, ?, ?)",
        (allergy_id, patient_id, allergen, severity)
    )
    conn.commit()
    conn.close()
    return allergy_id


def save_known_condition(patient_id: str, condition_name: str, icd10_code: str = "") -> str:
    cond_id = str(uuid.uuid4())
    conn = get_connection()
    conn.execute(
        "INSERT INTO known_conditions (id, patient_id, condition_name, icd10_code) "
        "VALUES (?, ?, ?, ?)",
        (cond_id, patient_id, condition_name, icd10_code)
    )
    conn.commit()
    conn.close()
    return cond_id


def save_physician(patient_id: str, doctor_name: str, hospital_name: str, email: str) -> str:
    phys_id = str(uuid.uuid4())
    conn = get_connection()
    conn.execute(
        "INSERT INTO physician_details (id, patient_id, doctor_name, hospital_name, email) "
        "VALUES (?, ?, ?, ?, ?)",
        (phys_id, patient_id, doctor_name, hospital_name, email)
    )
    conn.commit()
    conn.close()
    return phys_id


# ── FHIR & Context Helpers ─────────────────────────────────────

def get_patient_full_context(patient_id: str) -> dict:
    conn = get_connection()
    patient    = conn.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
    allergies  = conn.execute("SELECT allergen, severity FROM allergies WHERE patient_id = ?", (patient_id,)).fetchall()
    conditions = conn.execute("SELECT condition_name, icd10_code FROM known_conditions WHERE patient_id = ?", (patient_id,)).fetchall()
    physician  = conn.execute("SELECT * FROM physician_details WHERE patient_id = ?", (patient_id,)).fetchone()
    conn.close()
    return {
        "patient":          dict(patient)    if patient   else {},
        "allergies":        [dict(r) for r in allergies],
        "known_conditions": [dict(r) for r in conditions],
        "physician":        dict(physician)  if physician else {}
    }

def get_patient_as_fhir(patient_id: str) -> dict:
    ctx = get_patient_full_context(patient_id)
    p   = ctx["patient"]
    fhir_patient = {
        "resourceType": "Patient",
        "id": patient_id,
        "active": True,
        "name": [{"text": p.get("name", "")}],
        "gender": p.get("sex", "unknown").lower(),
        "birthDate": _age_to_birthdate(p.get("age")),
        "address": [{"text": p.get("place", ""), "line": [p.get("place", "")]}],
        # These extensions are what store your Height and Weight
        "extension": [
            {
                "url": "http://hl7.org/fhir/StructureDefinition/patient-height",
                "valueQuantity": {"value": p.get("height_cm"), "unit": "cm"}
            },
            {
                "url": "http://hl7.org/fhir/StructureDefinition/patient-weight",
                "valueQuantity": {"value": p.get("weight_kg"), "unit": "kg"}
            }
        ]
    }
    return fhir_patient # Simplified for brevity, same logic as your original


def get_sessions_for_doctor(doctor_email: str):
    conn = get_connection()
    query = """
    SELECT 
        p.name, p.age, p.sex,
        s.id as session_id, s.symptoms, s.risk_tier, s.diagnosis, s.created_at
    FROM physician_details pd
    JOIN patients p ON pd.patient_id = p.id
    JOIN sessions s ON p.id = s.patient_id
    WHERE LOWER(pd.email) = LOWER(?)
    ORDER BY 
        CASE s.risk_tier 
            WHEN 'HIGH' THEN 1 
            WHEN 'MEDIUM' THEN 2 
            WHEN 'LOW' THEN 3 
            ELSE 4 END
    """
    rows = conn.execute(query, (doctor_email.strip().lower(),)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ── Low Level Helpers ──────────────────────────────────────────

def _age_to_birthdate(age: int) -> str:
    if not age: return ""
    return f"{datetime.now().year - int(age)}-01-01"

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _map_severity(severity: str) -> str:
    mapping = {"severe": "high", "moderate": "low", "mild": "low"}
    return mapping.get((severity or "").lower(), "unable-to-assess")

def _ensure_patient_email_column(conn: sqlite3.Connection) -> None:
    cols = conn.execute("PRAGMA table_info(patients)").fetchall()
    col_names = [c["name"] for c in cols]
    if "email" not in col_names:
        conn.execute("ALTER TABLE patients ADD COLUMN email TEXT")

def get_recent_sessions(patient_id: str, limit: int = 2):
    """Fetches the last X sessions for a specific patient."""
    conn = get_connection()
    query = """
        SELECT symptoms, risk_tier, diagnosis, created_at 
        FROM sessions 
        WHERE patient_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
    """
    rows = conn.execute(query, (patient_id, limit)).fetchall()
    conn.close()
    return [dict(r) for r in rows]
# ── Main ──────────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    print("[db] Initialization complete.")