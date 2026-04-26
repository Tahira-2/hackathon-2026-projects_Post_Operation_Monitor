-- ============================================================
-- RefAI Schema
-- Team: We Care
-- ============================================================

-- Lookup tables to avoid repeating hospital and specialty strings everywhere
CREATE TABLE specialties (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE hospitals (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  location   TEXT,
  contact    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctors (linked to Supabase Auth)
CREATE TABLE doctors (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  contact_number TEXT,
  specialty_id UUID REFERENCES specialties(id),
  license_number TEXT,
  avatar_url TEXT,
  hospital_id UUID REFERENCES hospitals(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients (created when referral is submitted)
CREATE TABLE patients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mrn             TEXT UNIQUE,
  full_name       TEXT NOT NULL,
  date_of_birth   DATE,
  gender          TEXT CHECK (gender IN ('male', 'female', 'other')),
  email           TEXT,
  phone           TEXT,
  medical_history TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals (core table)
CREATE TABLE referrals (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id          UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  referred_by        UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id         UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinical_notes     TEXT NOT NULL,
  extracted_data     JSONB,
  diagnosis          TEXT,
  required_specialty TEXT,
  urgency            TEXT CHECK (urgency IN ('low', 'medium', 'high')) DEFAULT 'low',
  status             TEXT CHECK (status IN ('pending', 'sent', 'accepted', 'completed')) DEFAULT 'pending',
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Referral status history (drives the status timeline UI with per-step timestamps)
CREATE TABLE referral_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  status      TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'accepted', 'completed')),
  changed_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Patient access tokens (token-based patient portal, no login required)
CREATE TABLE patient_tokens (
  token       TEXT PRIMARY KEY,
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments (patient books via portal after receiving referral link)
-- One appointment per referral enforced by UNIQUE constraint
CREATE TABLE appointments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id    UUID NOT NULL UNIQUE REFERENCES referrals(id) ON DELETE CASCADE,
  preferred_date DATE NOT NULL,
  time_slot      TEXT NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  status         TEXT CHECK (status IN ('requested', 'confirmed', 'cancelled')) DEFAULT 'requested',
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Functions
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Log each referral status change into history
CREATE OR REPLACE FUNCTION log_referral_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO referral_status_history (referral_id, status)
    VALUES (NEW.id, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sync referral status when appointment is created or updated
CREATE OR REPLACE FUNCTION sync_referral_on_appointment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'requested' THEN
    UPDATE referrals SET status = 'accepted' WHERE id = NEW.referral_id;
  ELSIF NEW.status = 'confirmed' THEN
    UPDATE referrals SET status = 'completed' WHERE id = NEW.referral_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Triggers
-- ============================================================

CREATE TRIGGER referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER referrals_log_status
  AFTER INSERT OR UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION log_referral_status_change();

CREATE TRIGGER appointments_sync_referral
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION sync_referral_on_appointment();

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_referrals_doctor_id   ON referrals (doctor_id);
CREATE INDEX idx_referrals_patient_id  ON referrals (patient_id);
CREATE INDEX idx_referrals_status      ON referrals (status);
CREATE INDEX idx_doctors_specialty_id  ON doctors (specialty_id);
CREATE INDEX idx_doctors_hospital_id   ON doctors (hospital_id);
CREATE INDEX idx_status_history_referral ON referral_status_history (referral_id);
CREATE INDEX idx_patient_tokens_referral ON patient_tokens (referral_id);

-- ============================================================
-- Supabase Security
-- ============================================================

ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE specialties DISABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE referral_status_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
