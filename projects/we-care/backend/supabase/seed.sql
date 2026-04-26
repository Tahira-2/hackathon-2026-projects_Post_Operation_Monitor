-- ============================================================
-- Seed Data — Specialists
-- Run this after schema.sql
-- ============================================================

INSERT INTO specialties (name) VALUES
  ('Cardiology'),
  ('Neurology'),
  ('Orthopedics'),
  ('Dermatology'),
  ('Psychiatry'),
  ('Oncology'),
  ('Pediatrics'),
  ('Ophthalmology')
ON CONFLICT (name) DO NOTHING;

INSERT INTO hospitals (name, location) VALUES
  ('Apollo Hospital', 'Downtown District'),
  ('City Medical Center', 'Northside Campus'),
  ('Metro Hospital', 'Central Avenue'),
  ('Skin & Care Clinic', 'West End'),
  ('Wellness Center', 'South Park'),
  ('Cancer Care Institute', 'Medical Research Zone'),
  ('City Children Hospital', 'Riverfront'),
  ('Eye Care Clinic', 'Old Town')
ON CONFLICT (name) DO NOTHING;


