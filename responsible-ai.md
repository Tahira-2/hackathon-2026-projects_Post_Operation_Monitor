# Responsible AI — GuardianPost-Op

This document lays out how AI is used in GuardianPost-Op, what data feeds it,
where its judgement is bounded, and the failure modes we know about. It
covers the system as it exists in this hackathon submission, not a future
production version. Nothing here is a substitute for clinical review or
regulatory clearance.

---

## 1. Data sources

### 1.1 Sensor data — fully synthetic

GuardianPost-Op does **not** ingest real patient data. The "wearable" in this
submission is simulated entirely in software:

* `src/sensor_simulator.py` generates a 24-hour trace of vitals at a 3-minute
  cadence (480 samples per patient) using a fixed seed for reproducibility.
* The trace combines a circadian baseline (mild overnight HR dip, gentle
  daytime rise) with Gaussian per-vital noise.
* An **engineered cardiac event** is hard-coded between simulated hours 18
  and 20: heart rate ramps from 73 → 118 bpm, HRV collapses from 45 → 22 ms,
  respiratory rate climbs from 14 → 24 bpm, SpO2 drifts 97 → 92, body
  temperature drifts 36.7 → 37.6 °C, and movement collapses to "None" /
  "little." The simulator produces this same trajectory for every demo run.
* Six vital channels are exposed: heart rate, HRV, respiratory rate, SpO2,
  body temperature, movement bucket (`None | little | medium | intense`).

No PHI was collected, processed, transmitted, or stored at any point. The
SQLite / Postgres tables only ever hold synthetic data plus accounts that
demo users create themselves with throwaway test phone numbers.

### 1.2 Doctor's note — free text supplied per session

The doctor writes a plain-English note describing each patient's safe-range
expectations (e.g., *"Post-CABG day 2, on metoprolol. Expect resting HR
60-78. Warn above 95, page critical above 110."*). This text is the only
patient-specific input the AI sees. It is supplied by the demo operator
during the session and stored on the patient row alongside the parsed
envelope CSV.

### 1.3 What we do NOT use

* No external medical databases.
* No training data — every model call is zero-shot, in-context only.
* No audio, video, or imaging.
* No demographic data fields (age, sex, ethnicity, comorbidities) beyond
  whatever the doctor chooses to write into the free-text note.

---

## 2. Where AI is used (and where it isn't)

GuardianPost-Op is intentionally narrow about where it leans on AI. Two
surfaces only:

| Component | Where | What it decides |
|---|---|---|
| **Prescription parser** | `src/prescription_parser.py` | Converts the doctor's free-text note into a structured CSV-1 envelope (per-vital baseline / warn / critical bands). |
| **Summary narrative** | `server/summary.py` `_build_narrative()` | Templated text — not LLM-generated. |

Everything else is **deterministic**:

* The 30-minute comparison cycle (`src/analysis_engine.py`) is straight
  numeric comparison: average vs. envelope thresholds → enum classification.
* The hourly alert batching (`server/scheduler.py`) is a counter + summarize
  pass with no learned components.
* The 12-hour summary record (`server/summary.py`) rolls up cycle averages
  and counts; the narrative is a template populated with those numbers.
* Status pills, CSV exports, and notification routing are all rule-based.

This split is deliberate. The AI's only job is the one thing rules can't do
well — turning unstructured English into structured thresholds. Once we have
the thresholds, we want the alert path to be auditable, repeatable, and
explainable line-by-line.

---

## 3. Model choices

### 3.1 LLM: Anthropic Claude Sonnet 4.6

The prescription parser uses `claude-sonnet-4-6` via the Anthropic API. The
call is structured as a **forced tool call**:

```python
tools=[_envelope_tool_schema()],
tool_choice={"type": "tool", "name": "set_envelope"},
```

Forcing the tool call eliminates free-form output — the model has to produce
a JSON object whose shape matches the envelope schema (every vital, every
band, all numeric). Anything that doesn't fit the schema is rejected before
it ever reaches the analysis engine.

**Why Sonnet 4.6:** strong instruction-following and structured-output
performance for a model in its cost / latency tier; reliable tool-call
adherence so we don't have to hand-parse free text from the model.

**Why not a fine-tuned smaller model:** we have no labelled training data
and no evaluation harness, and a fine-tuned model on synthetic clinician
notes would likely be worse than a well-prompted general-purpose model on
real-world variation.

**Why not GPT / Gemini:** no principled reason — Claude is what we have
ANTHROPIC_API_KEY for, and the tool-call shape is identical across the major
providers, so a swap is mechanical if needed.

### 3.2 Deterministic fallback parser

`src/prescription_parser.py` ships a second parser that runs when no API key
is set (`parse_with_fallback()`). It walks the note sentence-by-sentence,
attributes each sentence to a vital via a small alias dictionary, and mines
for "warn above N", "critical below N", "stay above N", and "N-M" patterns.

This exists for two reasons: (1) the demo must run offline / in CI, and
(2) it gives us a non-AI baseline to compare against if we ever doubt the
LLM's output on a given note. It is much weaker than the LLM path on
non-trivial notes (see §5).

### 3.3 No model in the analysis loop

The 30-min comparison + hourly alert decisions are pure conditionals
(`value < critical_low`, `value > warn_high`, etc.). No probabilistic
scoring, no learned threshold drift, no anomaly detection. A clinician
reviewing an alert can trace the exact arithmetic that produced it.

---

## 4. Bias considerations

We have not run a formal bias audit. The biases we know to be present:

* **Population-default thresholds.** `src/vitals.py` ships defaults that
  reflect "average adult" reference ranges (e.g., HR 55–95 warn, 50–110
  critical). If a doctor never writes a note, those defaults apply, and they
  are not appropriate for pediatric patients, elderly patients with chronic
  conditions, athletes with low resting HR, or patients on rate-controlling
  medications. The system mitigates this by *expecting* a per-patient note
  to override defaults — but it doesn't *enforce* one.
* **English-only language assumption.** Both the LLM and the fallback parser
  are tuned to English clinical phrasing. Notes written in other languages
  will parse poorly. Common medical abbreviations from other systems
  (Spanish "lpm", German "Schläge/min") aren't recognized.
* **Western medical conventions.** Units (bpm, ms, °C, %), reference ranges,
  and band terminology (warn / critical) follow North American practice.
  Sites using Fahrenheit or different escalation tiers would need adaptation.
* **No demographic context.** The system has no field for patient age, sex,
  ethnicity, weight, or comorbidities other than whatever the doctor writes
  into the note. Two patients with the same envelope but different baseline
  physiology are treated identically.
* **Single-patient demo.** The engineered cardiac trajectory is one scenario
  out of many real-world post-op courses (sepsis, PE, internal bleeding,
  organ rejection, etc.). The system has not been exercised against
  non-cardiac decompensation patterns.
* **Skewed seed prescription.** The checked-in
  `data/sample_prescription.txt` describes a 67-year-old post-CABG patient
  on beta-blockers. The fallback parser was tuned against this note; other
  notes may parse less cleanly.

---

## 5. Failure cases

### 5.1 LLM parser

* **Numeric mis-extraction.** The LLM could pull "9.5" from "above 95" if a
  sentence is poorly punctuated. The forced tool-call schema constrains the
  *shape* of output but not the *correctness* of the values.
* **Hallucination of unspecified bands.** If the doctor only writes about
  HR, the model still has to fill the SpO2 / temp / RR / HRV bands. The
  prompt instructs it to use sensible post-op defaults in that case, but a
  model under pressure could invent specific values that seem authoritative.
* **API outage / rate limit.** The parser falls back to the deterministic
  path on any exception or missing key. The fallback's output is logged on
  the doctor's screen as `envelope_source: "fallback"` so the doctor knows
  which path ran.

### 5.2 Fallback parser

* **Context loss.** Heuristics like distinguishing "stay above 94" (a floor)
  from "warn if above 95" (a ceiling) are hand-coded and brittle. Notes
  using novel phrasing will be misinterpreted.
* **No negations.** "Do **not** warn above 100 unless sustained" is parsed
  as a literal "warn above 100." The fallback can't model conditions.
* **No medical reasoning.** It doesn't know that an HR of 30 is bradycardia
  even if the note doesn't mention it.

### 5.3 Analysis pipeline

* **30-min averaging masks short events.** A 60-second arrhythmia inside a
  30-min window may not move the average enough to cross the warn band. We
  trade resolution for alert-fatigue control. A clinical version would
  layer a fast-path for short-window critical events (e.g., HR > 150 for
  > 60 s).
* **Hourly batching delays notification.** A doctor sees at most one alert
  per simulated hour per patient. A truly emergent event could be sitting
  in the buffer for up to ~60 sim minutes before the doctor's app shows it.
  The patient-side banner has the same cadence.
* **Single-doctor envelope.** The patient's envelope is whichever doctor
  most recently saved a note. With multiple doctors of different
  specialties, last-write-wins may not reflect the right specialty's view.

### 5.4 Identity verification (mock)

* The third-party ID verification flow is a stand-in. **Any "doctor"
  account in the live demo is functionally unverified.** The
  `MockIdVerifier` accepts whoever clicks "Approve" on the mock provider
  page. This is fine for showing the flow but not for trust decisions.

### 5.5 Operational

* **Cold start on free-tier hosting.** The first request after ~15 min idle
  on Render's free tier takes ~30 s to wake.
* **Session expiry.** Server sessions live 12 hours. After expiry the
  patient or doctor must re-sign-in. The frontend now prefills the
  identifier on the login form (loggin-issue branch, merged) so the cost
  is one extra field, not a full re-entry — but it can still surprise a
  user mid-session.
* **No real BLE.** The "wearable" is fully simulated. There is no actual
  device pairing, no encryption negotiation, no battery profile, no signal
  loss handling — none of the operational realities of a real BLE link.

---

## 6. Safety boundaries

GuardianPost-Op in its current form is:

* **Not FDA-cleared.** It is not a medical device and has not been
  evaluated for diagnostic or therapeutic use.
* **Not HIPAA-compliant.** There is no audit trail, no role-based access
  control beyond patient/doctor split, no encryption at rest beyond
  whatever the hosting database provides, and no business-associate
  agreements with hosting providers.
* **Not for use with real patient data.** Anyone running this against real
  vitals from a real human is operating outside the system's design intent.

The proposal's roadmap (`PROPOSAL.md` §10) calls out fabrication, clinical
pilot, and regulatory pathway as Phase 2 work. Until that work is done,
this is a software demo that proves the data pipeline end to end — nothing
more.

---

## 7. What we would do before any clinical use

For honesty about what would be required to take this past the demo stage:

1. Clinical validation of the envelope-based approach against real
   post-operative monitoring datasets, broken out by surgery type, age,
   sex, and comorbidity profile.
2. Replace the mock ID verifier with a real provider (Persona / Stripe
   Identity / Onfido) tied to medical-board credential checks.
3. Add an audit log of every AI-driven decision (parsed envelope, alert
   classification, summary generation) with traceability back to the
   input note + raw vitals window.
4. Reduce the alert latency model — short-window fast-path for
   immediately-life-threatening readings, alongside the 30-min / hourly
   cadence for trend-based concerns.
5. Multi-language note parsing, validated by native-speaker clinicians.
6. A separate, formally-evaluated bias review across the dimensions in §4.
7. The hardware itself, fabricated to the BoM in the proposal and validated
   for sensor accuracy against medical-grade reference equipment.
