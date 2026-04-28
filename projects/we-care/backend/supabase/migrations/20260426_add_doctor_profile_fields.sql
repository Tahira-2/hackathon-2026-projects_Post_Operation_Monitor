-- ============================================================
-- RefAI Migration
-- Add profile fields for authenticated doctors
-- ============================================================

ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS specialty TEXT,
  ADD COLUMN IF NOT EXISTS license_number TEXT,
  ADD COLUMN IF NOT EXISTS hospital TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;
