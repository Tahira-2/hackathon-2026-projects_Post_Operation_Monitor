-- Doctor users (4 — includes General Practice to match core_logic fallback specialty)
insert into users (email, password_hash, full_name, role)
values
  ('derm.doc@test.com', 'hash', 'Dr. Alice Skinner', 'doctor'),
  ('cardio.doc@test.com', 'hash', 'Dr. Brian Heart', 'doctor'),
  ('neuro.doc@test.com', 'hash', 'Dr. Clara Neuro', 'doctor'),
  ('gp.doc@test.com', 'hash', 'Dr. Dana Ellis', 'doctor');

-- Patient users (2)
insert into users (email, password_hash, full_name, role)
values
  ('patient.one@test.com', 'hash', 'Pat One', 'patient'),
  ('patient.two@test.com', 'hash', 'Pat Two', 'patient');

-- Doctor profiles (licensed + review metadata)
insert into doctors (
  user_id,
  full_name,
  specialty,
  license_no,
  provider_npi,
  provider_dea,
  credential_verification_status,
  is_licensed,
  rating,
  review_count,
  review_source,
  lat,
  lng,
  address,
  availability
)
values
  (
    (select id from users where email = 'derm.doc@test.com'),
    'Dr. Alice Skinner',
    'Dermatology',
    'LIC-DERM-1001',
    '1111111111',
    'BD1111111',
    'verified',
    true,
    4.8,
    126,
    'google',
    29.4260,
    -98.4895,
    '120 Skin St, San Antonio, TX',
    '{"monday":["09:00","10:00"],"wednesday":["13:00","14:00"]}'::jsonb
  ),
  (
    (select id from users where email = 'cardio.doc@test.com'),
    'Dr. Brian Heart',
    'Cardiology',
    'LIC-CARD-1002',
    '2222222222',
    'BD2222222',
    'verified',
    true,
    4.7,
    98,
    'google',
    29.4241,
    -98.4936,
    '221 Heart Ave, San Antonio, TX',
    '{"tuesday":["09:30","11:30"],"thursday":["15:00","16:00"]}'::jsonb
  ),
  (
    (select id from users where email = 'neuro.doc@test.com'),
    'Dr. Clara Neuro',
    'Neurology',
    'LIC-NEUR-1003',
    '3333333333',
    'BD3333333',
    'verified',
    true,
    4.9,
    143,
    'google',
    29.4305,
    -98.4950,
    '98 Brain Blvd, San Antonio, TX',
    '{"friday":["10:00","11:00"],"saturday":["12:00"]}'::jsonb
  );

-- General Practice doctor (aligns with DEFAULT_FALLBACK_SPECIALTY in core_logic symptom_mapper)
insert into doctors (
  user_id,
  full_name,
  specialty,
  license_no,
  provider_npi,
  provider_dea,
  credential_verification_status,
  is_licensed,
  rating,
  review_count,
  review_source,
  lat,
  lng,
  address,
  availability
)
values (
  (select id from users where email = 'gp.doc@test.com'),
  'Dr. Dana Ellis',
  'General Practice',
  'LIC-GP-1004',
  '4444444444',
  'BD4444444',
  'verified',
  true,
  4.6,
  87,
  'google',
  29.4280,
  -98.4910,
  '55 Primary Care Blvd, San Antonio, TX',
  '{"monday":["09:00","10:00","11:00"],"thursday":["13:00","14:00"]}'::jsonb
);

-- 1 completed appointment
insert into appointments (patient_id, doctor_id, scheduled_at, status, workflow_status, notes)
values (
  (select id from users where email = 'patient.one@test.com'),
  (select id from doctors where specialty = 'Cardiology'),
  now() - interval '1 day',
  'completed',
  'signer',
  'Follow-up visit for chest discomfort.'
);

-- 1 intake form
insert into intake_forms (appointment_id, patient_id, symptoms, allergies, medications, medical_history)
values (
  (select id from appointments order by created_at desc limit 1),
  (select id from users where email = 'patient.one@test.com'),
  'Mild chest pain during exercise.',
  'Penicillin',
  'Atorvastatin 10mg daily',
  'Family history of hypertension.'
);

-- 1 approved SOAP note
insert into soap_notes (
  appointment_id,
  doctor_id,
  subjective,
  objective,
  assessment,
  plan,
  raw_transcript,
  clinic_name,
  provider_display_name,
  provider_license_id,
  clinic_logo_url,
  soap_pdf_generated_at,
  document_reference_id,
  coding_review_required,
  clinician_signed_at,
  export_status,
  target_vendor,
  approved,
  approved_at
)
values (
  (select id from appointments order by created_at desc limit 1),
  (select id from doctors where specialty = 'Cardiology'),
  'Patient reports intermittent chest tightness with exertion.',
  'Vitals stable, normal ECG in clinic.',
  'Likely stable angina; low immediate risk.',
  'Schedule stress test, continue statin, follow-up in two weeks.',
  'Auto-transcribed consultation text goes here.',
  'CareIT Virtual Clinic - San Antonio',
  'Dr. Brian Heart, MD',
  'LIC-CARD-1002',
  'https://example.com/logo-careit.png',
  now(),
  'DOC-SOAP-0001',
  false,
  now(),
  'ready',
  'athenahealth',
  true,
  now()
);

-- 1 FHIR record (legacy Composition document; resource_type set explicitly to avoid default mismatch)
insert into fhir_records (soap_note_id, resource_type, fhir_json)
values (
  (select id from soap_notes order by created_at desc limit 1),
  'Composition',
  '{
    "resourceType":"Composition",
    "status":"final",
    "type":{"text":"Clinical Note"},
    "title":"Cardiology Follow-Up SOAP Note"
  }'::jsonb
);

-- Medication policy reference support (general/non-controlled + controlled)
insert into medication_policies (medication_name, category, is_allowed, reference_source, notes)
values
  ('Acetaminophen', 'general', true, 'internal_demo_policy_v1', 'Non-controlled pain reliever allowed for telehealth demo.'),
  ('Ibuprofen', 'general', true, 'internal_demo_policy_v1', 'Non-controlled anti-inflammatory allowed.'),
  ('Amoxicillin', 'general', true, 'internal_demo_policy_v1', 'Common antibiotic example.'),
  ('Oxycodone', 'controlled', false, 'internal_demo_policy_v1', 'Controlled substance blocked by policy.'),
  ('Adderall', 'controlled', false, 'internal_demo_policy_v1', 'Controlled stimulant blocked by policy.');

-- Prescription order status persistence sample rows
insert into prescriptions (
  appointment_id,
  patient_id,
  doctor_id,
  requested_medication,
  approval_status,
  block_reason,
  clinic_name,
  provider_display_name,
  provider_license_id,
  clinic_logo_url,
  prescription_pdf_generated_at,
  document_reference_id
)
values
  (
    (select id from appointments order by created_at desc limit 1),
    (select id from users where email = 'patient.one@test.com'),
    (select id from doctors where specialty = 'Cardiology'),
    'Acetaminophen',
    'approved',
    null,
    'CareIT Virtual Clinic - San Antonio',
    'Dr. Brian Heart, MD',
    'LIC-CARD-1002',
    'https://example.com/logo-careit.png',
    now(),
    'DOC-RX-0001'
  ),
  (
    (select id from appointments order by created_at desc limit 1),
    (select id from users where email = 'patient.one@test.com'),
    (select id from doctors where specialty = 'Cardiology'),
    'Oxycodone',
    'blocked',
    'Controlled medications are blocked by telehealth policy.',
    'CareIT Virtual Clinic - San Antonio',
    'Dr. Brian Heart, MD',
    'LIC-CARD-1002',
    'https://example.com/logo-careit.png',
    null,
    'DOC-RX-0002'
  );

-- Department workflow logs for legal/signer/coordination
insert into department_logs (
  appointment_id,
  soap_note_id,
  actor_user_id,
  department,
  action,
  version_label,
  details
)
values
  (
    (select id from appointments order by created_at desc limit 1),
    (select id from soap_notes order by created_at desc limit 1),
    (select id from users where email = 'patient.one@test.com'),
    'legal',
    'consent_verified',
    'v1',
    'Patient consent and jurisdiction checks passed.'
  ),
  (
    (select id from appointments order by created_at desc limit 1),
    (select id from soap_notes order by created_at desc limit 1),
    (select id from users where email = 'cardio.doc@test.com'),
    'signer',
    'soap_authorized',
    'v1',
    'Doctor reviewed and signed SOAP note.'
  ),
  (
    (select id from appointments order by created_at desc limit 1),
    (select id from soap_notes order by created_at desc limit 1),
    (select id from users where email = 'patient.one@test.com'),
    'coordination',
    'follow_up_routed',
    'v1',
    'Follow-up routed to care coordination.'
  );