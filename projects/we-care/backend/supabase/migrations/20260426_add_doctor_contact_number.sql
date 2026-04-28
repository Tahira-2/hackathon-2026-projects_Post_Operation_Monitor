-- ============================================================
-- RefAI Migration
-- Add contact number to doctor profiles
-- ============================================================

ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS contact_number TEXT;
