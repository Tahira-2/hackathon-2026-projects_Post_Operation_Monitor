# GuardianPost-Op
Continuous remote monitoring for high-risk surgical recovery — software demo.

This repository contains the hackathon software pipeline described in [PROPOSAL.md](PROPOSAL.md). The wearable hardware design lives in the proposal document; this codebase implements every layer above the BLE radio.

---

## The Problem
Post-operative recovery is currently a "black box" once a patient leaves the hospital.
* **Invisible Deterioration:** Sepsis, internal bleeding, and organ rejection often produce minor vital-sign changes hours or days before a patient feels symptomatic.
* **Unreliable Self-Assessment:** Patients are often fatigued or medicated, making the "call if you feel worse" instruction a dangerous gamble.
* **Context Blindness:** Generic wearables use population averages. A cardiac patient on beta-blockers needs personalized thresholds that consumer devices cannot provide.

## The Approach
GuardianPost-Op introduces a **Prescription-Driven Monitoring Model**. Instead of generic alerts, a clinician defines a "safe envelope" for each specific patient. An AI engine parses these instructions and continuously monitors the patient's data against that unique clinical context. If the data drifts, the system triggers a **Dual-Alert Escalation**—notifying both the patient via the wearable and the clinician via a high-priority dashboard.

---

## Architecture

```text
plain-text prescription
 |  (LLM parser)
 v
CSV-1 envelope ---┐
 |  30-min analysis cycle (every cycle):
 2-min sensor  |  1. average each vital across the window
 stream ------>|--> 2. compare to envelope
 (CSV-2 buffer)|  3. classify Normal / Warning / Critical
 |  4. append to Recovery Log + emit dual alert
 L----┐
      v
 Recovery Log + alerts.jsonl ----> clinician dashboard.png
```

### Data Pipeline Components
Outputs land in:

| Path | What it is |
|---|---|
| `data/csv1_prescription.csv` | The parsed envelope per vital sign (CSV-1). |
| `data/sensor_full_24h.csv`   | The full 24h simulated stream (720 samples). |
| `data/csv2_buffer.csv`       | The rolling 30-min buffer for the *final* cycle. |
| `data/recovery_log.csv`      | One row per 30-min cycle (48 rows). |
| `data/alerts.jsonl`          | One JSON line per non-normal cycle. |
| `demo_output/dashboard.png`  | Clinician-facing visualization. |
| `demo_output/transcript.txt` | Cycle-by-cycle human-readable log. |

---

## Data Sources
The system monitors six critical vital signs selected for their early-warning value in high-risk recovery:

| Vital Sign | Why It Matters Post-Op |
| :--- | :--- |
| **Resting Heart Rate** | Early indicator of infection, pain, or cardiac stress. |
| **HRV** | Reflects autonomic balance and overall recovery state. |
| **Respiratory Rate** | Flags fluid overload or pulmonary embolisms. |
| **Sleep Quality** | Essential for tissue repair and immune function. |
| **Activity (Steps)** | High risk of site injury vs. high risk of blood clots. |
| **Blood Pressure** | Essential for kidney and liver perfusion. |

*Note: For the hackathon phase, data is provided via a 24-hour simulated sensor stream replaying a mock cardiac crisis.*

---

## Prescription Parsing

`src/prescription_parser.py` has two paths:

1. **Anthropic Claude** (preferred). If `ANTHROPIC_API_KEY` is set in the environment, the parser asks Claude (`claude-sonnet-4-6`) to fill out an envelope schema via a forced `set_envelope` tool call. This is the path the demo uses on stage.
2. **Deterministic fallback**. If the API key is missing or `anthropic` isn't installed, the parser scans the text sentence-by-sentence, attributing each sentence to a vital (with last-mentioned-vital carry-over) and mining `"warn above N"`, `"critical below N"`, `"stay above N"`, `"N-M"` patterns to fill the envelope. This keeps the demo runnable offline / in CI.

The active path is reported in the demo's `[1/4]` line.

---

## What the demo shows

The simulated patient is post-CABG day 2, stable through hour 17, then begins an arrhythmia at hour 18 that escalates to sustained tachycardia at hour 20. The pipeline:

- classifies cycles 0-37 as **NORMAL**,
- raises a **WARNING** at cycle 38 (HR ≈ 101, SpO2 dipping below 94), and
- escalates to **CRITICAL** from cycle 39 onward (HR > 110, HRV collapsed, RR climbing, SpO2 in the low-90s).

Each non-normal cycle emits a **dual-alert payload**:

- **device payload** — what the wearable's MCU acts on (yellow/red LED + buzzer pattern + kill-switch state),
- **push payload** — what the mobile gateway forwards to the clinician dashboard, with `bypass_dnd: true` on critical so it cuts through Do Not Disturb (the "emergency-broadcast-grade" channel from the proposal).

The full demo runs in well under a second on a laptop — the proposal calls for real-time 30-minute cadence, but the demo replays the whole 24 hours back-to-back so you can see the entire story arc in one go.

---

## Layout

```text
src/
  vitals.py              # vital-sign specs + population defaults
  prescription_parser.py # plain text -> CSV-1 (Claude or fallback)
  sensor_simulator.py    # 24h synthetic stream w/ engineered crisis
  analysis_engine.py     # 30-min averaging, classification, recovery log
  alerts.py              # dual-alert (device + push) payloads
  dashboard.py           # matplotlib clinician visualization
  run_demo.py            # end-to-end orchestrator
data/
  sample_prescription.txt  # checked-in clinician text for the demo
PROPOSAL.md              # full project proposal (clinician track)
```

---

## Limitations (Out of scope for Phase 2)

Per the proposal, the hardware itself, the production BLE mobile gateway, and clinical / regulatory validation are documented but not built here. The CSV-2 write in `run_demo.py` simulates the wearable's behavior so the gateway role can be dropped in without changing the analysis or alert layers.

* **Hardware Fabrication:** The forearm ring is fully specified (ESP32-C3, MAX30102 sensors) but currently simulated via software.
* **Regulatory Pathway:** This is a functional demonstration and has not yet undergone FDA/clinical validation.

---

## Setup Instructions (Quick start)

### Prerequisites
* Python 3.9+

### Installation & Run
```bash
python -m pip install -r requirements.txt
python -m src.run_demo
```

---

## Team Credit
* **MD Siam Ahmed** – Lead & System Architect
    * *Computer Science, Texas State University*
* **Tahira Juhair Boshra** - Developer
    * *Electrical Engineering, Texas State University*
