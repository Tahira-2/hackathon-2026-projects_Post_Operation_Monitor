-- ============================================================
-- RefAI Migration
-- Align specialist references to doctor profiles
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'referrals_specialist_id_fkey'
  ) THEN
    ALTER TABLE referrals
      DROP CONSTRAINT referrals_specialist_id_fkey;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'referrals_specialist_id_fkey'
  ) THEN
    ALTER TABLE referrals
      ADD CONSTRAINT referrals_specialist_id_fkey
      FOREIGN KEY (specialist_id) REFERENCES doctors(id) ON DELETE CASCADE;
  END IF;
END $$;

DROP TABLE IF EXISTS specialists;
