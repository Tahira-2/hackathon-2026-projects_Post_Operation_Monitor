-- ============================================================
-- RefAI Migration
-- Align referrals to doctor_id target and referred_by sender
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'referrals'
      AND column_name = 'doctor_id'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'referrals'
      AND column_name = 'target_doctor_id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'referrals'
      AND column_name = 'referred_by'
  ) THEN
    ALTER TABLE referrals RENAME COLUMN doctor_id TO referred_by;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'referrals'
      AND column_name = 'target_doctor_id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'referrals'
      AND column_name = 'doctor_id'
  ) THEN
    ALTER TABLE referrals RENAME COLUMN target_doctor_id TO doctor_id;
  END IF;
END $$;

ALTER TABLE referrals
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES doctors(id) ON DELETE CASCADE;
