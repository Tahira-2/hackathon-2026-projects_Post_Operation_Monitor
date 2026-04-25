# GuardianPost-Op

Continuous remote monitoring for high-risk surgical recovery — software demo.

This repository implements the proposal in [PROPOSAL.md](PROPOSAL.md) as two
deliverables:

1. **End-to-end analysis pipeline** (`src/`) — the AI "referee" that turns a
   24-hour vital-sign stream into a clinician-facing recovery dashboard.
2. **Gateway PWA** (`server/` + `webapp/`) — the role the proposal's
   BLE-to-mobile gateway will play once real hardware exists. Two-role login
   (patient + clinician), third-party ID verification for clinicians, doctor
   permission gating, automatic 12-hour summary delivery, and manual
   patient-triggered sends.

```
plain-text prescription
        │   (LLM parser, src/prescription_parser.py)
        ▼
   CSV-1 envelope ──┐
                    │   30-min analysis cycle:
   2-min sensor     │     1. average each vital across the window
   stream  ─────►   ├──►  2. compare to envelope
   (CSV-2 buffer)   │     3. classify Normal / Warning / Critical
                    │     4. append to Recovery Log + emit dual alert
                    └──┐
                       ▼            ┌────────────────────────────────┐
              Recovery Log + alerts │ Gateway PWA (server/ + webapp/)│
                       │            │  - patient app (live vitals,    │
                       ▼            │    manual send)                 │
              dashboard.png (PNG)   │  - doctor app (patients,        │
                                    │    permissions, inbox)          │
                                    └────────────────────────────────┘
```

## Quick start

```bash
python -m pip install -r requirements.txt
```

### Run the gateway PWA (the new bit)

```bash
python -m server.app
# open http://127.0.0.1:5050/
```

Then on the landing page click **Reset & seed demo data** — that creates one
verified doctor and one paired patient, with summary permission already granted:

| Role | Credentials |
|---|---|
| Patient | phone `+1-555-0200`, device `GPO-2026-0001` |
| Doctor  | email `dr.singh@example.com`, password `demopass1!` |

Open the patient and doctor logins in two browser tabs (or one normal + one
incognito) to see both sides at once.

For demo speed the wearable's clock runs much faster than wall time. Set
`GUARDIAN_TIME_SCALE` to override (default 240 = 1 wall-second is 4 simulated
minutes; bump to 4800 for very fast demos):

```bash
GUARDIAN_TIME_SCALE=4800 python -m server.app
```

### Run the original analysis pipeline (no server needed)

```bash
python -m src.run_demo
```

This runs the full 24h sensor stream through the 30-min cycle and produces:

| Path | What it is |
|---|---|
| `data/csv1_prescription.csv` | The parsed envelope per vital sign (CSV-1). |
| `data/sensor_full_24h.csv`   | The full 24h simulated stream (720 samples). |
| `data/csv2_buffer.csv`       | The rolling 30-min buffer for the *final* cycle. |
| `data/recovery_log.csv`      | One row per 30-min cycle (48 rows). |
| `data/alerts.jsonl`          | One JSON line per non-normal cycle. |
| `demo_output/dashboard.png`  | Clinician-facing visualization. |
| `demo_output/transcript.txt` | Cycle-by-cycle human-readable log. |

## Gateway PWA — what each role sees

**Patient app** (`#/patient`):
- Live vitals tile (HR, HRV, RR, SpO2, body temp), polled every 2 seconds from
  the in-memory buffer the wearable would push over BLE.
- "Send summary now" button — generates a 12h summary and delivers it to every
  doctor with `permission_granted = true`. **403 if no consenting doctor.**
- List of recent summaries with their overall status pill.
- List of "my clinicians" with the receiving-summaries pill (doctor controls
  this — patient just sees the state).

**Doctor app** (`#/doctor`):
- Patient list with one toggle per patient to enable/disable summary delivery.
  Toggle is the **only** consent gate; flipping it off immediately stops auto +
  manual delivery to that doctor.
- Add patients by phone number (the patient must have signed up first; their
  device number is the auth secret, never typed by the doctor).
- Inbox of received summaries, polled every 4 seconds. Each item shows the
  status pill, trigger (`auto`/`manual`), 12h sim window, per-vital averages,
  and the human-readable narrative.
- "Run scheduler tick" button — manually fires the auto-summary scheduler for
  the demo without waiting the full 12 simulated hours.

**ID verification** is implemented behind the `IdVerifier` interface in
[server/id_verification.py](server/id_verification.py). The shipped
`MockIdVerifier` opens a fake hosted page (`#/verify/mock?session=…`) where
the demo operator clicks Approve / Reject. Swapping in Persona, Stripe Identity,
Onfido, or Veriff is a single-class change — the rest of the auth flow already
matches their session-id + hosted-URL + poll/webhook contract.

## Auth model summary

| Role | Identity | Secret | Extra step |
|---|---|---|---|
| Patient | phone | device number printed on the wearable | — |
| Doctor  | email | password (8+ chars) | third-party ID verification before adding patients |

Sessions are opaque random tokens (32 bytes from `secrets`), stored in the
`sessions` table with a 12h TTL. Passwords and device numbers are hashed with
PBKDF2-SHA256 (200k iterations). No JWT, no cookies — the SPA stores the token
in `localStorage` and sends it as `Authorization: Bearer …`.

## Scheduler

`server/scheduler.py` runs a daemon thread that ticks every 5 wall seconds.
For each known patient it asks the per-patient `PatientStream` what the current
simulated time is; if `AUTO_SUMMARY_PERIOD_HOURS` of simulated time has
elapsed since that patient's last summary, it generates one and inserts a
`summary_sends` row for every doctor with `permission_granted = 1`.

## Layout

```
src/                        Original analysis pipeline (unchanged)
  vitals.py                 vital-sign specs + population defaults
  prescription_parser.py    plain text -> CSV-1 (Claude or fallback)
  sensor_simulator.py       24h synthetic stream w/ engineered crisis
  analysis_engine.py        30-min averaging, classification, recovery log
  alerts.py                 dual-alert (device + push) payloads
  dashboard.py              matplotlib clinician visualization
  run_demo.py               end-to-end orchestrator (one-shot CLI)

server/                     Flask + SQLite gateway
  config.py                 paths, demo time-scale, summary cadence
  schema.sql                SQLite schema
  db.py                     thin sqlite3 wrapper, per-request connection
  auth.py                   PBKDF2 hashing, session tokens, role decorator
  id_verification.py        MockIdVerifier + IdVerifier protocol
  sim_runner.py             one PatientStream per patient — feeds /vitals/live
  summary.py                generates a 12h summary row + narrative + delivery
  scheduler.py              background thread for auto-summary every 12h
  app.py                    Flask routes + entry point

webapp/                     Vanilla-JS PWA frontend
  index.html
  app.js                    hash-based router, all views
  styles.css
PROPOSAL.md                 full project proposal (clinician track)
```

## Out of scope (Phase 2)

- Hardware fabrication. The wearable design and BoM are in
  [PROPOSAL.md](PROPOSAL.md); the in-memory `PatientStream` simulates the BLE
  feed so the gateway code is real.
- Real third-party ID verification — `MockIdVerifier` is a drop-in stand-in.
- Cellular push delivery to clinicians — the inbox is polled in the browser
  rather than pushed via APNs / FCM. The data shape and delivery gates are
  already in place.
