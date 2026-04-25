-- GuardianPost-Op gateway schema. SQLite. Hackathon-grade — no migrations,
-- the schema is recreated whenever the DB file is missing or `?reset=1` is
-- passed to /api/admin/seed.

CREATE TABLE patients (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  phone               TEXT    NOT NULL,            -- as typed by patient (display)
  phone_normalized    TEXT    NOT NULL UNIQUE,     -- digits only; used for lookup
  device_number       TEXT    NOT NULL,            -- printed on the wearable
  device_secret       TEXT    NOT NULL,            -- pbkdf2 hash of device_number
  device_salt         TEXT    NOT NULL,
  full_name           TEXT    NOT NULL DEFAULT '',
  prescription        TEXT    NOT NULL DEFAULT '', -- raw clinician text (the doctor's note)
  envelope_csv        TEXT    NOT NULL DEFAULT '', -- AI-parsed envelope as CSV (CSV-1)
  envelope_set_by     INTEGER,                     -- doctors.id of last writer (NULL = patient self-set or seed)
  envelope_set_at     INTEGER,                     -- unix seconds
  created_at          INTEGER NOT NULL             -- unix seconds
);

CREATE TABLE doctors (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  email           TEXT    NOT NULL UNIQUE,
  password_hash   TEXT    NOT NULL,
  password_salt   TEXT    NOT NULL,
  full_name       TEXT    NOT NULL DEFAULT '',
  phone           TEXT    NOT NULL DEFAULT '',
  verified        INTEGER NOT NULL DEFAULT 0,  -- 0 = pending, 1 = verified
  verification_id TEXT    NOT NULL DEFAULT '', -- third-party session id
  created_at      INTEGER NOT NULL
);

-- Doctor-patient link with per-link permission flag.
CREATE TABLE care_links (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor_id           INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id          INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  permission_granted  INTEGER NOT NULL DEFAULT 0,
  permission_changed_at INTEGER NOT NULL,
  created_at          INTEGER NOT NULL,
  UNIQUE(doctor_id, patient_id)
);

CREATE TABLE sessions (
  token       TEXT    PRIMARY KEY,
  role        TEXT    NOT NULL CHECK (role IN ('patient', 'doctor')),
  user_id     INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);

-- Each row is a generated 12h summary for one patient. A summary may be sent
-- to zero, one, or many doctors (history is in summary_sends).
CREATE TABLE summaries (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id          INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  generated_at        INTEGER NOT NULL,        -- wall-clock unix seconds
  sim_hour_start      REAL    NOT NULL,        -- simulated-time window
  sim_hour_end        REAL    NOT NULL,
  status_overall      TEXT    NOT NULL,        -- NORMAL | WARNING | CRITICAL
  hr_avg              REAL    NOT NULL,
  hrv_avg             REAL    NOT NULL,
  rr_avg              REAL    NOT NULL,
  spo2_avg            REAL    NOT NULL,
  temp_avg            REAL    NOT NULL,
  alert_count_warn    INTEGER NOT NULL,
  alert_count_critical INTEGER NOT NULL,
  narrative           TEXT    NOT NULL DEFAULT ''
);

CREATE TABLE summary_sends (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  summary_id  INTEGER NOT NULL REFERENCES summaries(id) ON DELETE CASCADE,
  doctor_id   INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  trigger     TEXT    NOT NULL CHECK (trigger IN ('auto', 'manual')),
  sent_at     INTEGER NOT NULL,
  read_at     INTEGER          -- nullable
);

-- Real-time alerts emitted by the analysis loop on each new 3-min sample
-- whose value falls outside the patient's prescribed envelope. Both the
-- patient app and the doctor app poll this table.
CREATE TABLE live_alerts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  sim_hour        REAL    NOT NULL,            -- simulated hour the sample was taken
  status          TEXT    NOT NULL CHECK (status IN ('WARNING', 'CRITICAL')),
  vital           TEXT    NOT NULL,            -- e.g. heart_rate
  value           REAL    NOT NULL,            -- the offending reading
  message         TEXT    NOT NULL,            -- human-readable deviation note
  created_at      INTEGER NOT NULL,            -- wall-clock unix seconds
  acked_by_patient_at INTEGER,                  -- nullable
  acked_by_doctor_id  INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
  acked_by_doctor_at  INTEGER
);

CREATE INDEX idx_care_links_doctor  ON care_links(doctor_id);
CREATE INDEX idx_care_links_patient ON care_links(patient_id);
CREATE INDEX idx_summaries_patient  ON summaries(patient_id, generated_at DESC);
CREATE INDEX idx_summary_sends_doctor ON summary_sends(doctor_id, sent_at DESC);
CREATE INDEX idx_live_alerts_patient ON live_alerts(patient_id, created_at DESC);
