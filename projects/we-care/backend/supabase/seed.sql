-- ============================================================
-- RefAI Seed Data
-- Run this after schema.sql and migrations
-- ============================================================

BEGIN;

-- ============================================================
-- Fixed IDs for deterministic local/demo data
-- ============================================================

-- Specialties
-- Cardiology:   11111111-1111-1111-1111-111111111111
-- Neurology:    22222222-2222-2222-2222-222222222222
-- Orthopedics:  33333333-3333-3333-3333-333333333333
-- Dermatology:  44444444-4444-4444-4444-444444444444
-- Psychiatry:   55555555-5555-5555-5555-555555555555
-- Oncology:     66666666-6666-6666-6666-666666666666

-- Hospitals
-- Northside Medical Center:  aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1
-- River Valley Hospital:     aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2
-- Westlake Specialty Clinic: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3
-- Midtown Cancer Institute:  aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4

-- Doctors / auth.users
-- Maya Patel:      bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1
-- Ethan Brooks:    bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2
-- Sophia Nguyen:   bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3
-- Daniel Kim:      bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4
-- Priya Shah:      bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5
-- Marcus Reed:     bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6

-- Patients
-- Eleanor Thompson: cccccccc-cccc-cccc-cccc-ccccccccccc1
-- Michael Alvarez:  cccccccc-cccc-cccc-cccc-ccccccccccc2
-- Jasmine Carter:   cccccccc-cccc-cccc-cccc-ccccccccccc3
-- Robert Ellis:     cccccccc-cccc-cccc-cccc-ccccccccccc4
-- Olivia Foster:    cccccccc-cccc-cccc-cccc-ccccccccccc5
-- Henry Walker:     cccccccc-cccc-cccc-cccc-ccccccccccc6

-- Referrals
-- REF-1: dddddddd-dddd-dddd-dddd-ddddddddddd1
-- REF-2: dddddddd-dddd-dddd-dddd-ddddddddddd2
-- REF-3: dddddddd-dddd-dddd-dddd-ddddddddddd3
-- REF-4: dddddddd-dddd-dddd-dddd-ddddddddddd4
-- REF-5: dddddddd-dddd-dddd-dddd-ddddddddddd5
-- REF-6: dddddddd-dddd-dddd-dddd-ddddddddddd6

-- Appointments
-- APPT-1: eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1
-- APPT-2: eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2
-- APPT-3: eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3

-- Referral status history
-- HIST-01 ... HIST-15: ffffffff-ffff-ffff-ffff-fffffffffff1..15

-- ============================================================
-- Clean existing deterministic seed rows
-- ============================================================

DELETE FROM appointments
WHERE id IN (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3'
);

DELETE FROM patient_tokens
WHERE token IN (
  'seed-token-eleanor-cardiology',
  'seed-token-jasmine-dermatology',
  'seed-token-henry-oncology'
);

DELETE FROM referral_status_history
WHERE id IN (
  'ffffffff-ffff-ffff-ffff-fffffffffff1',
  'ffffffff-ffff-ffff-ffff-fffffffffff2',
  'ffffffff-ffff-ffff-ffff-fffffffffff3',
  'ffffffff-ffff-ffff-ffff-fffffffffff4',
  'ffffffff-ffff-ffff-ffff-fffffffffff5',
  'ffffffff-ffff-ffff-ffff-fffffffffff6',
  'ffffffff-ffff-ffff-ffff-fffffffffff7',
  'ffffffff-ffff-ffff-ffff-fffffffffff8',
  'ffffffff-ffff-ffff-ffff-fffffffffff9',
  'ffffffff-ffff-ffff-ffff-ffffffffff10',
  'ffffffff-ffff-ffff-ffff-ffffffffff11',
  'ffffffff-ffff-ffff-ffff-ffffffffff12',
  'ffffffff-ffff-ffff-ffff-ffffffffff13',
  'ffffffff-ffff-ffff-ffff-ffffffffff14',
  'ffffffff-ffff-ffff-ffff-ffffffffff15'
);

DELETE FROM referrals
WHERE id IN (
  'dddddddd-dddd-dddd-dddd-ddddddddddd1',
  'dddddddd-dddd-dddd-dddd-ddddddddddd2',
  'dddddddd-dddd-dddd-dddd-ddddddddddd3',
  'dddddddd-dddd-dddd-dddd-ddddddddddd4',
  'dddddddd-dddd-dddd-dddd-ddddddddddd5',
  'dddddddd-dddd-dddd-dddd-ddddddddddd6'
);

DELETE FROM patients
WHERE id IN (
  'cccccccc-cccc-cccc-cccc-ccccccccccc1',
  'cccccccc-cccc-cccc-cccc-ccccccccccc2',
  'cccccccc-cccc-cccc-cccc-ccccccccccc3',
  'cccccccc-cccc-cccc-cccc-ccccccccccc4',
  'cccccccc-cccc-cccc-cccc-ccccccccccc5',
  'cccccccc-cccc-cccc-cccc-ccccccccccc6'
);

DELETE FROM doctors
WHERE id IN (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6'
);

DELETE FROM auth.users
WHERE id IN (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6'
);

DELETE FROM hospitals
WHERE id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'
);

DELETE FROM specialties
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);

-- ============================================================
-- Lookup tables
-- ============================================================

INSERT INTO specialties (id, name, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Cardiology',  '2026-04-01T08:00:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'Neurology',   '2026-04-01T08:01:00Z'),
  ('33333333-3333-3333-3333-333333333333', 'Orthopedics', '2026-04-01T08:02:00Z'),
  ('44444444-4444-4444-4444-444444444444', 'Dermatology', '2026-04-01T08:03:00Z'),
  ('55555555-5555-5555-5555-555555555555', 'Psychiatry',  '2026-04-01T08:04:00Z'),
  ('66666666-6666-6666-6666-666666666666', 'Oncology',    '2026-04-01T08:05:00Z');

INSERT INTO hospitals (id, name, location, contact, created_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Northside Medical Center',  'Chicago, IL',      '(312) 555-0101', '2026-04-01T08:10:00Z'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'River Valley Hospital',     'Naperville, IL',   '(312) 555-0102', '2026-04-01T08:11:00Z'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Westlake Specialty Clinic', 'Evanston, IL',     '(312) 555-0103', '2026-04-01T08:12:00Z'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'Midtown Cancer Institute',  'Oak Brook, IL',    '(312) 555-0104', '2026-04-01T08:13:00Z');

-- ============================================================
-- Auth users required by doctors.id foreign key
-- Password for seeded users: Password123!
-- ============================================================

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  "role",
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'authenticated',
    'authenticated',
    'maya.patel@refai.demo',
    crypt('Password123!', gen_salt('bf')),
    '2026-04-01T09:00:00Z',
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    '2026-04-20T09:00:00Z',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dr. Maya Patel"}'::jsonb,
    FALSE,
    '2026-04-01T09:00:00Z',
    '2026-04-20T09:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    'authenticated',
    'authenticated',
    'ethan.brooks@refai.demo',
    crypt('Password123!', gen_salt('bf')),
    '2026-04-01T09:05:00Z',
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    '2026-04-21T08:10:00Z',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dr. Ethan Brooks"}'::jsonb,
    FALSE,
    '2026-04-01T09:05:00Z',
    '2026-04-21T08:10:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
    'authenticated',
    'authenticated',
    'sophia.nguyen@refai.demo',
    crypt('Password123!', gen_salt('bf')),
    '2026-04-01T09:10:00Z',
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    '2026-04-22T07:45:00Z',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dr. Sophia Nguyen"}'::jsonb,
    FALSE,
    '2026-04-01T09:10:00Z',
    '2026-04-22T07:45:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4',
    'authenticated',
    'authenticated',
    'daniel.kim@refai.demo',
    crypt('Password123!', gen_salt('bf')),
    '2026-04-01T09:15:00Z',
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    '2026-04-23T10:20:00Z',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dr. Daniel Kim"}'::jsonb,
    FALSE,
    '2026-04-01T09:15:00Z',
    '2026-04-23T10:20:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5',
    'authenticated',
    'authenticated',
    'priya.shah@refai.demo',
    crypt('Password123!', gen_salt('bf')),
    '2026-04-01T09:20:00Z',
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    '2026-04-23T12:45:00Z',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dr. Priya Shah"}'::jsonb,
    FALSE,
    '2026-04-01T09:20:00Z',
    '2026-04-23T12:45:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6',
    'authenticated',
    'authenticated',
    'marcus.reed@refai.demo',
    crypt('Password123!', gen_salt('bf')),
    '2026-04-01T09:25:00Z',
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    '2026-04-24T14:05:00Z',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dr. Marcus Reed"}'::jsonb,
    FALSE,
    '2026-04-01T09:25:00Z',
    '2026-04-24T14:05:00Z'
  );

-- ============================================================
-- Doctors
-- doctor_id = target doctor on referral
-- referred_by = sending doctor on referral
-- ============================================================

INSERT INTO doctors (
  id,
  full_name,
  email,
  contact_number,
  specialty_id,
  license_number,
  avatar_url,
  hospital_id,
  created_at
) VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'Dr. Maya Patel',
    'maya.patel@refai.demo',
    '(312) 555-1001',
    '11111111-1111-1111-1111-111111111111',
    'IL-MED-1001',
    NULL,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '2026-04-01T09:30:00Z'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    'Dr. Ethan Brooks',
    'ethan.brooks@refai.demo',
    '(312) 555-1002',
    '22222222-2222-2222-2222-222222222222',
    'IL-MED-1002',
    NULL,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '2026-04-01T09:31:00Z'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
    'Dr. Sophia Nguyen',
    'sophia.nguyen@refai.demo',
    '(312) 555-1003',
    '33333333-3333-3333-3333-333333333333',
    'IL-MED-1003',
    NULL,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '2026-04-01T09:32:00Z'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4',
    'Dr. Daniel Kim',
    'daniel.kim@refai.demo',
    '(312) 555-1004',
    '44444444-4444-4444-4444-444444444444',
    'IL-MED-1004',
    NULL,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    '2026-04-01T09:33:00Z'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5',
    'Dr. Priya Shah',
    'priya.shah@refai.demo',
    '(312) 555-1005',
    '55555555-5555-5555-5555-555555555555',
    'IL-MED-1005',
    NULL,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    '2026-04-01T09:34:00Z'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6',
    'Dr. Marcus Reed',
    'marcus.reed@refai.demo',
    '(312) 555-1006',
    '66666666-6666-6666-6666-666666666666',
    'IL-MED-1006',
    NULL,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
    '2026-04-01T09:35:00Z'
  );

-- ============================================================
-- Patients
-- ============================================================

INSERT INTO patients (
  id,
  mrn,
  full_name,
  date_of_birth,
  gender,
  email,
  phone,
  medical_history,
  created_at
) VALUES
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    'MRN-10001',
    'Eleanor Thompson',
    '1954-03-12',
    'female',
    'eleanor.thompson@example.com',
    '(312) 555-2001',
    'Hypertension, hyperlipidemia, exertional dyspnea.',
    '2026-04-10T10:00:00Z'
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    'MRN-10002',
    'Michael Alvarez',
    '1978-11-04',
    'male',
    'michael.alvarez@example.com',
    '(312) 555-2002',
    'Recurrent migraine headaches, photophobia, poor sleep.',
    '2026-04-11T10:15:00Z'
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc3',
    'MRN-10003',
    'Jasmine Carter',
    '1991-06-18',
    'female',
    'jasmine.carter@example.com',
    '(312) 555-2003',
    'Changing pigmented lesion on left shoulder.',
    '2026-04-12T10:30:00Z'
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc4',
    'MRN-10004',
    'Robert Ellis',
    '1963-08-22',
    'male',
    'robert.ellis@example.com',
    '(312) 555-2004',
    'Right knee osteoarthritis, reduced mobility, chronic pain.',
    '2026-04-13T10:45:00Z'
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc5',
    'MRN-10005',
    'Olivia Foster',
    '1988-02-07',
    'female',
    'olivia.foster@example.com',
    '(312) 555-2005',
    'Anxiety, intermittent panic symptoms, insomnia.',
    '2026-04-14T11:00:00Z'
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc6',
    'MRN-10006',
    'Henry Walker',
    '1959-12-30',
    'male',
    'henry.walker@example.com',
    '(312) 555-2006',
    'Unintentional weight loss and persistent fatigue under active workup.',
    '2026-04-15T11:15:00Z'
  );

-- ============================================================
-- Referrals
-- doctor_id = receiving doctor
-- referred_by = sending doctor
-- ============================================================

INSERT INTO referrals (
  id,
  doctor_id,
  patient_id,
  clinical_notes,
  extracted_data,
  diagnosis,
  required_specialty,
  urgency,
  status,
  created_at,
  updated_at,
  referred_by
) VALUES
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd1',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    E'CHIEF CONCERN:\nProgressive exertional dyspnea with intermittent chest tightness.\n\nHISTORY OF PRESENT ILLNESS:\n71-year-old female with hypertension and hyperlipidemia reports 3 weeks of worsening shortness of breath when climbing one flight of stairs. She also notes substernal chest pressure lasting 5 to 10 minutes, relieved by rest. No syncope. No palpitations. No lower extremity edema.\n\nEXAM:\nBP 148/86, HR 82, SpO2 96% on room air.\nCardiac exam with regular rhythm and no audible murmur.\nLungs clear to auscultation bilaterally.\n\nASSESSMENT:\nConcern for stable angina versus other ischemic heart disease.\n\nREFERRAL REQUEST:\nPlease evaluate for cardiology workup and determine need for stress testing and echocardiography.',
    '{"patientName":"Eleanor Thompson","requiredSpecialty":"Cardiology","urgency":"high","diagnosis":"Atypical angina"}',
    'Atypical angina',
    'Cardiology',
    'high',
    'accepted',
    '2026-04-16T08:15:00Z',
    '2026-04-17T10:30:00Z',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd2',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    E'CHIEF CONCERN:\nRecurrent migraine headaches with escalating frequency.\n\nHISTORY OF PRESENT ILLNESS:\n47-year-old male with long-standing migraine history now having headaches 4 to 5 days per week over the last 2 months. Associated photophobia, nausea, and reduced work tolerance. Trial of sumatriptan and sleep hygiene has provided incomplete relief. No focal weakness, no speech difficulty, and no loss of consciousness.\n\nEXAM:\nNeurologic exam grossly nonfocal in clinic.\nVitals stable.\n\nASSESSMENT:\nChronic migraine with poor response to first-line management.\n\nREFERRAL REQUEST:\nNeurology consultation for medication optimization, consideration of preventive therapy, and further evaluation if indicated.',
    '{"patientName":"Michael Alvarez","requiredSpecialty":"Neurology","urgency":"medium","diagnosis":"Chronic migraine"}',
    'Chronic migraine',
    'Neurology',
    'medium',
    'pending',
    '2026-04-17T09:00:00Z',
    '2026-04-17T09:00:00Z',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd3',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4',
    'cccccccc-cccc-cccc-cccc-ccccccccccc3',
    E'CHIEF CONCERN:\nChanging pigmented skin lesion on left shoulder.\n\nHISTORY OF PRESENT ILLNESS:\n32-year-old female reports a dark mole that has enlarged over the last 6 months and has become intermittently pruritic. She denies bleeding but notes more irregular borders than previously. No prior dermatology evaluation for this lesion.\n\nEXAM:\nApproximately 9 mm asymmetric pigmented lesion with irregular border and color variation on posterior left shoulder.\nNo surrounding cellulitis.\n\nASSESSMENT:\nAtypical nevus, cannot rule out dysplastic process.\n\nREFERRAL REQUEST:\nPlease evaluate and consider dermatoscopic assessment and biopsy as appropriate.',
    '{"patientName":"Jasmine Carter","requiredSpecialty":"Dermatology","urgency":"medium","diagnosis":"Atypical nevus"}',
    'Atypical nevus',
    'Dermatology',
    'medium',
    'sent',
    '2026-04-18T11:20:00Z',
    '2026-04-18T12:00:00Z',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd4',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
    'cccccccc-cccc-cccc-cccc-ccccccccccc4',
    E'CHIEF CONCERN:\nChronic right knee pain with worsening mobility.\n\nHISTORY OF PRESENT ILLNESS:\n62-year-old male with known osteoarthritis reports progressive pain over the past year, now limiting stair climbing and routine walking. Conservative treatment with NSAIDs, home exercises, and activity modification has provided only partial relief. No recent trauma.\n\nEXAM:\nReduced range of motion in the right knee with crepitus and medial joint line tenderness. Mild antalgic gait noted.\n\nASSESSMENT:\nAdvanced symptomatic knee osteoarthritis.\n\nREFERRAL REQUEST:\nOrthopedic consultation for further management, including consideration of injection therapy versus operative planning.',
    '{"patientName":"Robert Ellis","requiredSpecialty":"Orthopedics","urgency":"low","diagnosis":"Knee osteoarthritis"}',
    'Knee osteoarthritis',
    'Orthopedics',
    'low',
    'completed',
    '2026-04-12T14:10:00Z',
    '2026-04-20T15:30:00Z',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5'
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd5',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5',
    'cccccccc-cccc-cccc-cccc-ccccccccccc5',
    E'CHIEF CONCERN:\nAnxiety symptoms with associated insomnia.\n\nHISTORY OF PRESENT ILLNESS:\n36-year-old female describes persistent worry, episodic panic sensations, and poor sleep over the last 4 months. Symptoms are affecting concentration and work performance. Denies suicidal ideation, psychosis, or substance misuse. Trial of counseling referral initiated, but medication review is requested due to ongoing functional impairment.\n\nEXAM:\nAlert, oriented, mildly anxious affect, no acute distress.\n\nASSESSMENT:\nGeneralized anxiety symptoms with sleep disturbance.\n\nREFERRAL REQUEST:\nPsychiatry evaluation for diagnostic clarification and medication management recommendations.',
    '{"patientName":"Olivia Foster","requiredSpecialty":"Psychiatry","urgency":"medium","diagnosis":"Generalized anxiety disorder"}',
    'Generalized anxiety disorder',
    'Psychiatry',
    'medium',
    'pending',
    '2026-04-19T13:40:00Z',
    '2026-04-19T13:40:00Z',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd6',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6',
    'cccccccc-cccc-cccc-cccc-ccccccccccc6',
    E'CHIEF CONCERN:\nUnintentional weight loss and persistent fatigue.\n\nHISTORY OF PRESENT ILLNESS:\n66-year-old male with 18-pound unintentional weight loss over 3 months, early satiety, and worsening fatigue. Initial outpatient evaluation notable for anemia and abnormal inflammatory markers. No overt bleeding reported. Further malignancy workup is recommended.\n\nEXAM:\nFatigued appearance, hemodynamically stable, no acute respiratory distress.\n\nASSESSMENT:\nConstitutional symptoms concerning for underlying malignant process.\n\nREFERRAL REQUEST:\nPlease evaluate urgently for oncology workup and recommend next diagnostic steps.',
    '{"patientName":"Henry Walker","requiredSpecialty":"Oncology","urgency":"high","diagnosis":"Suspected malignancy"}',
    'Suspected malignancy',
    'Oncology',
    'high',
    'accepted',
    '2026-04-20T08:25:00Z',
    '2026-04-21T09:35:00Z',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'
  );

-- ============================================================
-- Appointments
-- Note: real trigger would normally mutate referral status. We set
-- referral rows explicitly above, then seed timeline/history below.
-- ============================================================

INSERT INTO appointments (
  id,
  referral_id,
  preferred_date,
  time_slot,
  status,
  notes,
  created_at,
  updated_at
) VALUES
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    'dddddddd-dddd-dddd-dddd-ddddddddddd1',
    '2026-04-24',
    'morning',
    'requested',
    'Prefers first available morning consult.',
    '2026-04-17T10:35:00Z',
    '2026-04-17T10:35:00Z'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2',
    'dddddddd-dddd-dddd-dddd-ddddddddddd4',
    '2026-04-22',
    'afternoon',
    'confirmed',
    'Patient confirmed transport and availability.',
    '2026-04-18T09:10:00Z',
    '2026-04-20T15:30:00Z'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3',
    'dddddddd-dddd-dddd-dddd-ddddddddddd6',
    '2026-04-26',
    'evening',
    'requested',
    'Family requested an evening slot if available.',
    '2026-04-21T09:40:00Z',
    '2026-04-21T09:40:00Z'
  );

-- ============================================================
-- Patient tokens
-- ============================================================

INSERT INTO patient_tokens (
  token,
  referral_id,
  expires_at,
  used,
  created_at
) VALUES
  (
    'seed-token-eleanor-cardiology',
    'dddddddd-dddd-dddd-dddd-ddddddddddd1',
    '2026-05-01T10:35:00Z',
    FALSE,
    '2026-04-17T10:36:00Z'
  ),
  (
    'seed-token-jasmine-dermatology',
    'dddddddd-dddd-dddd-dddd-ddddddddddd3',
    '2026-05-02T12:00:00Z',
    FALSE,
    '2026-04-18T12:01:00Z'
  ),
  (
    'seed-token-henry-oncology',
    'dddddddd-dddd-dddd-dddd-ddddddddddd6',
    '2026-05-03T09:40:00Z',
    TRUE,
    '2026-04-21T09:41:00Z'
  );

-- ============================================================
-- Rebuild referral status history to match desired demo timeline
-- ============================================================

DELETE FROM referral_status_history
WHERE referral_id IN (
  'dddddddd-dddd-dddd-dddd-ddddddddddd1',
  'dddddddd-dddd-dddd-dddd-ddddddddddd2',
  'dddddddd-dddd-dddd-dddd-ddddddddddd3',
  'dddddddd-dddd-dddd-dddd-ddddddddddd4',
  'dddddddd-dddd-dddd-dddd-ddddddddddd5',
  'dddddddd-dddd-dddd-dddd-ddddddddddd6'
);

INSERT INTO referral_status_history (id, referral_id, status, changed_at) VALUES
  ('ffffffff-ffff-ffff-ffff-fffffffffff1',  'dddddddd-dddd-dddd-dddd-ddddddddddd1', 'pending',   '2026-04-16T08:15:00Z'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff2',  'dddddddd-dddd-dddd-dddd-ddddddddddd1', 'sent',      '2026-04-16T08:45:00Z'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff3',  'dddddddd-dddd-dddd-dddd-ddddddddddd1', 'accepted',  '2026-04-17T10:30:00Z'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff4',  'dddddddd-dddd-dddd-dddd-ddddddddddd2', 'pending',   '2026-04-17T09:00:00Z'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff5',  'dddddddd-dddd-dddd-dddd-ddddddddddd3', 'pending',   '2026-04-18T11:20:00Z'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff6',  'dddddddd-dddd-dddd-dddd-ddddddddddd3', 'sent',      '2026-04-18T12:00:00Z'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff7',  'dddddddd-dddd-dddd-dddd-ddddddddddd4', 'pending',   '2026-04-12T14:10:00Z'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff8',  'dddddddd-dddd-dddd-dddd-ddddddddddd4', 'sent',      '2026-04-13T08:30:00Z'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff9',  'dddddddd-dddd-dddd-dddd-ddddddddddd4', 'accepted',  '2026-04-18T09:10:00Z'),
  ('ffffffff-ffff-ffff-ffff-ffffffffff10',  'dddddddd-dddd-dddd-dddd-ddddddddddd4', 'completed', '2026-04-20T15:30:00Z'),
  ('ffffffff-ffff-ffff-ffff-ffffffffff11',  'dddddddd-dddd-dddd-dddd-ddddddddddd5', 'pending',   '2026-04-19T13:40:00Z'),
  ('ffffffff-ffff-ffff-ffff-ffffffffff12',  'dddddddd-dddd-dddd-dddd-ddddddddddd6', 'pending',   '2026-04-20T08:25:00Z'),
  ('ffffffff-ffff-ffff-ffff-ffffffffff13',  'dddddddd-dddd-dddd-dddd-ddddddddddd6', 'sent',      '2026-04-20T09:00:00Z'),
  ('ffffffff-ffff-ffff-ffff-ffffffffff14',  'dddddddd-dddd-dddd-dddd-ddddddddddd6', 'accepted',  '2026-04-21T09:35:00Z'),
  ('ffffffff-ffff-ffff-ffff-ffffffffff15',  'dddddddd-dddd-dddd-dddd-ddddddddddd6', 'accepted',  '2026-04-21T09:40:00Z');

COMMIT;
