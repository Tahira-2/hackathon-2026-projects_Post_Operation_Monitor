-- ============================================================
-- RefAI Migration
-- Normalize doctor and specialist lookup values
-- ============================================================

CREATE TABLE IF NOT EXISTS specialties (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hospitals (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  location   TEXT,
  contact    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS specialty_id UUID,
  ADD COLUMN IF NOT EXISTS hospital_id UUID;

INSERT INTO specialties (name)
SELECT DISTINCT specialty
FROM doctors
WHERE specialty IS NOT NULL AND specialty <> ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO hospitals (name)
SELECT DISTINCT hospital
FROM doctors
WHERE hospital IS NOT NULL AND hospital <> ''
ON CONFLICT (name) DO NOTHING;

UPDATE doctors d
SET specialty_id = s.id
FROM specialties s
WHERE d.specialty = s.name;

UPDATE doctors d
SET hospital_id = h.id
FROM hospitals h
WHERE d.hospital = h.name;

ALTER TABLE doctors
  DROP COLUMN IF EXISTS specialty,
  DROP COLUMN IF EXISTS hospital;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'doctors_specialty_id_fkey'
  ) THEN
    ALTER TABLE doctors
      ADD CONSTRAINT doctors_specialty_id_fkey
      FOREIGN KEY (specialty_id) REFERENCES specialties(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'doctors_hospital_id_fkey'
  ) THEN
    ALTER TABLE doctors
      ADD CONSTRAINT doctors_hospital_id_fkey
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id);
  END IF;
END $$;
