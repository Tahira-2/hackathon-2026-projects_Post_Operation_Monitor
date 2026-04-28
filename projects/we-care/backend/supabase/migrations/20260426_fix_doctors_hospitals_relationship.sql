-- ============================================================
-- RefAI Migration
-- Ensure doctors -> hospitals relationship exists for PostgREST
-- ============================================================

ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS hospital_id UUID;

DO $$
BEGIN
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

DO $$
BEGIN
  IF to_regclass('public.pgrst') IS NOT NULL THEN
    PERFORM pg_notify('pgrst', 'reload schema');
  END IF;
END $$;
