create extension if not exists "uuid-ossp";

create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password_hash text not null,
  full_name text not null,
  role text not null check (role in ('patient', 'doctor', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table doctors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  full_name text not null,
  specialty text not null,
  license_no text not null,
  is_licensed boolean not null default true,
  rating numeric(2, 1) not null default 0.0,
  review_count integer not null default 0,
  review_source text not null default 'google',
  lat double precision not null,
  lng double precision not null,
  address text not null,
  availability jsonb not null default '{}'::jsonb
);

create table appointments (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references users(id) on delete cascade,
  doctor_id uuid not null references doctors(id) on delete cascade,
  scheduled_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

create table intake_forms (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  patient_id uuid not null references users(id) on delete cascade,
  symptoms text not null,
  allergies text not null,
  medications text not null,
  medical_history text not null,
  submitted_at timestamptz not null default now()
);

create table soap_notes (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  doctor_id uuid not null references doctors(id) on delete cascade,
  subjective text not null,
  objective text not null,
  assessment text not null,
  plan text not null,
  raw_transcript text not null,
  clinic_name text,
  provider_display_name text,
  provider_license_id text,
  clinic_logo_url text,
  soap_pdf_generated_at timestamptz,
  document_reference_id text,
  approved boolean not null default false,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table fhir_records (
  id uuid primary key default uuid_generate_v4(),
  soap_note_id uuid not null references soap_notes(id) on delete cascade,
  fhir_version text not null default 'R4',
  resource_type text not null default 'Composition',
  fhir_json jsonb not null,
  created_at timestamptz not null default now()
);

create table medication_policies (
  id uuid primary key default uuid_generate_v4(),
  medication_name text not null unique,
  category text not null check (category in ('general', 'controlled')),
  is_allowed boolean not null,
  reference_source text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table prescriptions (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  patient_id uuid not null references users(id) on delete cascade,
  doctor_id uuid not null references doctors(id) on delete cascade,
  requested_medication text not null,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'blocked')),
  block_reason text,
  clinic_name text,
  provider_display_name text,
  provider_license_id text,
  clinic_logo_url text,
  prescription_pdf_generated_at timestamptz,
  document_reference_id text,
  created_at timestamptz not null default now()
);

create table logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id),
  action text not null,
  resource text not null,
  ip_address text not null,
  created_at timestamptz not null default now()
);

create index idx_users_email on users(email);
create index idx_doctors_specialty on doctors(specialty);
create index idx_doctors_location on doctors(lat, lng);
create index idx_doctors_rating on doctors(rating);
create index idx_appointments_patient on appointments(patient_id);
create index idx_appointments_doctor on appointments(doctor_id);
create index idx_appointments_time on appointments(scheduled_at);
create index idx_prescriptions_patient on prescriptions(patient_id);
create index idx_prescriptions_appointment on prescriptions(appointment_id);
create index idx_prescriptions_status on prescriptions(approval_status);
create index idx_soap_notes_document_ref on soap_notes(document_reference_id);
create index idx_prescriptions_document_ref on prescriptions(document_reference_id);
create index idx_logs_user on logs(user_id);
create index idx_logs_created on logs(created_at);

alter table users enable row level security;
alter table doctors enable row level security;
alter table appointments enable row level security;
alter table intake_forms enable row level security;
alter table soap_notes enable row level security;
alter table fhir_records enable row level security;
alter table medication_policies enable row level security;
alter table prescriptions enable row level security;
alter table logs enable row level security;

create policy users_dev_all on users for all using (true) with check (true);
create policy doctors_dev_all on doctors for all using (true) with check (true);
create policy appointments_dev_all on appointments for all using (true) with check (true);
create policy intake_forms_dev_all on intake_forms for all using (true) with check (true);
create policy soap_notes_dev_all on soap_notes for all using (true) with check (true);
create policy fhir_records_dev_all on fhir_records for all using (true) with check (true);
create policy medication_policies_dev_all on medication_policies for all using (true) with check (true);
create policy prescriptions_dev_all on prescriptions for all using (true) with check (true);
create policy logs_dev_all on logs for all using (true) with check (true);