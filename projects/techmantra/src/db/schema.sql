-- db/schema.sql

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id           TEXT PRIMARY KEY,
    email        TEXT UNIQUE,
    name         TEXT NOT NULL,
    age          INTEGER,
    sex          TEXT,
    height_cm    REAL,
    weight_kg    REAL,
    place        TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Allergies Table
CREATE TABLE IF NOT EXISTS allergies (
    id         TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES patients(id),
    allergen   TEXT NOT NULL,
    severity   TEXT DEFAULT 'unknown'
);

-- 3. Known Conditions Table
CREATE TABLE IF NOT EXISTS known_conditions (
    id             TEXT PRIMARY KEY,
    patient_id     TEXT NOT NULL REFERENCES patients(id),
    condition_name TEXT NOT NULL,
    icd10_code     TEXT DEFAULT ''
);

-- 4. Physician Details Table
CREATE TABLE IF NOT EXISTS physician_details (
    id            TEXT PRIMARY KEY,
    patient_id    TEXT NOT NULL REFERENCES patients(id),
    doctor_name   TEXT NOT NULL,
    hospital_name TEXT,
    email         TEXT
);

-- 5. Sessions Table (Updated to match db.py variables)
CREATE TABLE IF NOT EXISTS sessions (
    id                  TEXT PRIMARY KEY,
    patient_id          TEXT NOT NULL REFERENCES patients(id),
    symptoms            TEXT,  -- The raw text/transcript
    risk_tier           TEXT,  -- LOW, MEDIUM, HIGH
    diagnosis           TEXT,  -- The structured JSON from LLM (replaces llm_output)
    fhir_report         TEXT,  -- The full FHIR DiagnosticReport JSON
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);