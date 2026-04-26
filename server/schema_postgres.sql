-- GuardianPost-Op gateway schema — Postgres variant.
-- Applied automatically when DATABASE_URL is set. Mirrors schema.sql but uses
-- BIGSERIAL for autoincrement and BIGINT for unix timestamps (so 2038-safe).

CREATE TABLE patients (
  id                  BIGSERIAL PRIMARY KEY,
  phone               TEXT    NOT NULL,
  phone_normalized    TEXT    NOT NULL UNIQUE,
  device_number       TEXT    NOT NULL,
  device_secret       TEXT    NOT NULL,
  device_salt         TEXT    NOT NULL,
  full_name           TEXT    NOT NULL DEFAULT '',
  prescription        TEXT    NOT NULL DEFAULT '',
  envelope_csv        TEXT    NOT NULL DEFAULT '',
  envelope_set_by     BIGINT,
  envelope_set_at     BIGINT,
  created_at          BIGINT  NOT NULL
);

CREATE TABLE doctors (
  id              BIGSERIAL PRIMARY KEY,
  email           TEXT    NOT NULL UNIQUE,
  password_hash   TEXT    NOT NULL,
  password_salt   TEXT    NOT NULL,
  full_name       TEXT    NOT NULL DEFAULT '',
  phone           TEXT    NOT NULL DEFAULT '',
  verified        INTEGER NOT NULL DEFAULT 0,
  verification_id TEXT    NOT NULL DEFAULT '',
  created_at      BIGINT  NOT NULL
);

CREATE TABLE care_links (
  id                    BIGSERIAL PRIMARY KEY,
  doctor_id             BIGINT  NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id            BIGINT  NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  permission_granted    INTEGER NOT NULL DEFAULT 0,
  permission_changed_at BIGINT  NOT NULL,
  created_at            BIGINT  NOT NULL,
  UNIQUE(doctor_id, patient_id)
);

CREATE TABLE sessions (
  token       TEXT    PRIMARY KEY,
  role        TEXT    NOT NULL CHECK (role IN ('patient', 'doctor')),
  user_id     BIGINT  NOT NULL,
  expires_at  BIGINT  NOT NULL
);

CREATE TABLE summaries (
  id                   BIGSERIAL PRIMARY KEY,
  patient_id           BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  generated_at         BIGINT NOT NULL,
  sim_hour_start       DOUBLE PRECISION NOT NULL,
  sim_hour_end         DOUBLE PRECISION NOT NULL,
  status_overall       TEXT   NOT NULL,
  hr_avg               DOUBLE PRECISION NOT NULL,
  hrv_avg              DOUBLE PRECISION NOT NULL,
  rr_avg               DOUBLE PRECISION NOT NULL,
  spo2_avg             DOUBLE PRECISION NOT NULL,
  temp_avg             DOUBLE PRECISION NOT NULL,
  alert_count_warn     INTEGER NOT NULL,
  alert_count_critical INTEGER NOT NULL,
  narrative            TEXT   NOT NULL DEFAULT ''
);

CREATE TABLE summary_sends (
  id          BIGSERIAL PRIMARY KEY,
  summary_id  BIGINT NOT NULL REFERENCES summaries(id) ON DELETE CASCADE,
  doctor_id   BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  trigger     TEXT   NOT NULL CHECK (trigger IN ('auto', 'manual')),
  sent_at     BIGINT NOT NULL,
  read_at     BIGINT
);

CREATE TABLE live_alerts (
  id                   BIGSERIAL PRIMARY KEY,
  patient_id           BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  sim_hour             DOUBLE PRECISION NOT NULL,
  status               TEXT NOT NULL CHECK (status IN ('WARNING', 'CRITICAL')),
  vital                TEXT NOT NULL,
  value                DOUBLE PRECISION NOT NULL,
  message              TEXT NOT NULL,
  created_at           BIGINT NOT NULL,
  acked_by_patient_at  BIGINT,
  acked_by_doctor_id   BIGINT REFERENCES doctors(id) ON DELETE SET NULL,
  acked_by_doctor_at   BIGINT
);

CREATE INDEX idx_care_links_doctor   ON care_links(doctor_id);
CREATE INDEX idx_care_links_patient  ON care_links(patient_id);
CREATE INDEX idx_summaries_patient   ON summaries(patient_id, generated_at DESC);
CREATE INDEX idx_summary_sends_doctor ON summary_sends(doctor_id, sent_at DESC);
CREATE INDEX idx_live_alerts_patient ON live_alerts(patient_id, created_at DESC);
