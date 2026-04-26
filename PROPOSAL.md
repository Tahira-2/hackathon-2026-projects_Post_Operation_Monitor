# GuardianPost-Op

**Continuous Remote Monitoring for High-Risk Surgical Recovery**

*Project Proposal — Clinician Track*

---

## 1. Executive Summary

GuardianPost-Op is a custom forearm-worn medical wearable paired with an AI-driven clinical platform that continuously monitors patients recovering from **high-risk cardiac surgery** (CABG, valve repair / replacement, ablation). Post-operative complications such as new-onset arrhythmia, fluid overload, cardiac decompensation, and surgical-site infection often produce subtle vital-sign changes hours to days before the patient feels unwell. Current discharge practice relies on paper instructions and patient self-assessment, which creates a dangerous gap.

Our solution closes that gap with a **prescription-driven monitoring model**: a clinician defines the safe range for each individual patient, our hardware logs vitals continuously, and an AI "referee" compares live data against the prescription every 30 minutes. Concerning trends trigger a **dual-alert system** — a tactile warning on the device itself and a critical-priority push notification routed through the patient's phone to the clinical dashboard.

For this hackathon, we are delivering a working **software demonstration of the full data pipeline**. The hardware design is fully specified and ready for fabrication in a follow-on phase.

---

## 2. The Problem

Three observations frame the problem we are solving:

1. **Subtle deterioration is invisible.** Post-operative complications announce themselves through small shifts in heart rate, HRV, and respiratory rate long before the patient experiences symptoms.
2. **Patient self-assessment is unreliable.** Discharged patients are asked to "call if something feels wrong" — a high-stakes judgment call made under medication, fatigue, and anxiety.
3. **Generic wearables miss the clinical context.** Consumer smart watches use population-average thresholds. A post-CABG patient on beta-blockers needs a different baseline envelope than a post-valve patient with a preserved chronotropic response — and current consumer hardware cannot accept per-patient rules at all.

The cost of this gap is measured in preventable readmissions, permanent organ damage, and avoidable mortality.

---

## 3. The Solution

GuardianPost-Op is built around three ideas: prescription-based thresholds, continuous on-body monitoring, and a dual-alert escalation path.

### 3.1 Prescription-Based Thresholds

Clinicians describe each patient's safe ranges in plain text (e.g., *"high baseline HR due to beta-blockers, warn if it exceeds 95"*). An LLM parses this prescription and generates a structured rules file (**CSV-1**) that defines the personalized envelope for that patient's recovery.

### 3.2 Continuous On-Body Monitoring

A purpose-built forearm ring logs vitals every 2 minutes into a rolling buffer (**CSV-2**). Forearm placement was chosen over a wrist watch because it provides more stable contact during sleep and significantly reduces motion noise — both critical for accurate post-operative readings.

### 3.3 Dual-Alert Escalation

When data drifts from the prescribed envelope, alerts escalate through two channels simultaneously:

- **On-device feedback** via colored LEDs and an audible buzzer ensures the patient is alerted even if their phone is in another room.
- **Clinical-grade push notifications** are routed through the patient's phone to a clinician dashboard, using critical-priority delivery that bypasses Do Not Disturb modes — comparable to government emergency broadcasts.

---

## 4. Clinical Data Model

For post-cardiac-surgery recovery, six vital signs were selected for their early-warning value:

| Vital Sign | Why It Matters Post-Cardiac-Op | Concerning Trend |
|---|---|---|
| Resting Heart Rate | Early sign of infection, pain, or cardiac stress; tachycardia frequently precedes new-onset arrhythmia. | Sustained 15% rise over 24h |
| Heart Rate Variability | Reflects autonomic balance and recovery state; collapse is an early signal of cardiac decompensation. | Sharp decline |
| Respiratory Rate | Flags fluid overload, pulmonary edema, and pulmonary embolism — all common post-cardiac-surgery risks. | Sudden increase |
| SpO2 | Direct readout of cardiopulmonary efficiency; drops alongside HR/RR shifts during a decompensation event. | Below 94 sustained |
| Body Temperature | Rising temp is the earliest sign of surgical-site or sternotomy-wound infection. | > 38.0 °C sustained |
| Movement | Too much risks the sternotomy / chest incision; too little raises post-op DVT and PE risk. | Sustained "None" or repeated "intense" |

---

## 5. System Architecture

### 5.1 The Three-File Data Model

The platform's intelligence is built on three artifacts:

- **CSV-1 — The Prescription.** Generated once per patient by parsing the clinician's notes through an LLM. Defines expected ranges per vital.
- **CSV-2 — The Live Buffer.** A rolling 30-minute log written by the wearable every 2 minutes. Overwritten after each analysis cycle to conserve memory.
- **Recovery Log — The Long-Term Trend.** After each cycle, the 30-minute averages are appended here. This becomes the clinician's view of the patient's recovery trajectory.

### 5.2 The 30-Minute AI Cycle

Every 30 minutes the system performs a four-step comparison:

1. Compute the rolling average of each vital from CSV-2.
2. Compare each average against the prescribed range in CSV-1.
3. Classify the result as **Normal**, **Warning**, or **Critical** based on deviation magnitude.
4. Append the averages to the Recovery Log and clear CSV-2 for the next cycle.

### 5.3 Connectivity: BLE-to-Mobile Gateway

After evaluating both Direct-to-Backend Wi-Fi and a BLE-to-Mobile Gateway architecture, we are committing to the **BLE-to-Mobile Gateway** approach. The wearable streams sensor data over Bluetooth Low Energy 5.0 to a dedicated mobile application; the phone serves as the processing hub and the cellular relay to the clinical dashboard.

This decision rests on three factors:

- **Power efficiency.** BLE allows a forearm-form-factor device to run for days; Wi-Fi would drain the same battery in hours.
- **Reliability in clinical settings.** Hospitals and homes commonly have Wi-Fi dead zones and captive portals that headless IoT devices cannot navigate. A phone with cellular fallback eliminates this failure mode.
- **Emergency-grade alerting.** The mobile gateway can issue critical-priority notifications that bypass Do Not Disturb — a capability the device alone cannot provide.

---

## 6. Hardware Design (Specified, Not Yet Fabricated)

The hardware is fully designed and documented for a follow-on build phase. The hackathon demo will simulate the device using recorded sensor data; the design below is what we will fabricate next.

### 6.1 Form Factor

A flexible forearm ring printed in TPU. Forearm placement gives more stable skin contact than a wrist strap and is less prone to motion artifacts during sleep, when most early-warning trends emerge. The device has one job — sense and store data — keeping firmware simple and battery life long.

### 6.2 Bill of Materials

| Component | Selection | Role |
|---|---|---|
| Microcontroller | ESP32-C3 or Arduino Nano 33 BLE Sense | Compute + BLE radio |
| Heart Rate / SpO2 | MAX30102 optical sensor | HR, HRV, SpO2 |
| Body Temperature | MLX90614 IR thermometer | Skin/body temp |
| Feedback — Visual | Yellow + Red LEDs | Warning / Critical state |
| Feedback — Audio | Piezo buzzer | Audible alert |
| User Control | Physical kill-switch | Acknowledge & reset |
| Enclosure | 3D-printed flexible TPU ring | Forearm fit |
| Connectivity | Bluetooth Low Energy 5.0 | Phone gateway |

### 6.3 On-Device Alert Behavior

- **Yellow LED + 3 beeps:** Warning — vitals trending toward the danger zone.
- **Red LED + continuous beep:** Critical — vitals outside the safe envelope.
- **Kill-switch:** Manually silences the buzzer and resets LED state once the patient has acknowledged the alert.

---

## 7. Hackathon Scope: What We Are Building

For the hackathon demonstration, we are scoping to the **software layer** — the part that proves the system works end to end.

### 7.1 In Scope (Demo)

- LLM-based parser that converts a clinician's plain-text prescription into CSV-1.
- Simulated sensor stream that replays our 24-hour mock dataset, including the engineered cardiac crisis at hour 18.
- AI comparison engine running the 30-minute analysis cycle in Python.
- Long-term Recovery Log with averaged trend data.
- Alert classification (Normal / Warning / Critical) with the dual-alert message payload that would be sent to the device and to the clinician dashboard.
- A clinician-facing visualization of the recovery log and active alerts.

### 7.2 Out of Scope (Documented for Phase 2)

- Hardware fabrication — design, BoM, and form factor are specified but not yet built.
- BLE pairing and the production mobile app — the gateway role is simulated by a local script.
- Clinical validation and regulatory pathway.

---

## 8. Demo Storyline

The demo follows a 24-hour recovery timeline of a simulated post-cardiac-surgery patient. The first 17 hours show normal recovery patterns. **At hour 18, an arrhythmia begins** — heart rate climbs from 73 to 88 bpm, HRV drops from 45 ms to 30 ms, and respiratory rate ticks up. **By hour 20, the patient is in sustained tachycardia at 118 bpm.**

During the demo we will show:

1. The clinician writing a plain-text prescription, and the LLM generating CSV-1.
2. Live data streaming into CSV-2 in 2-minute increments.
3. The 30-minute AI cycle catching the deviation, classifying it as **Critical**, and emitting both the on-device alert payload and the clinician push notification.
4. The Recovery Log showing the trend that a clinician would actually see.

---

## 9. Why This Wins the Clinician Track

- **Safety first.** The on-device LED-and-buzzer layer means the patient is alerted even if the phone is unreachable — no other layer can fail past it silently.
- **Clinician-defined, not one-size-fits-all.** The prescription model lets the same platform serve a post-CABG patient on beta-blockers (low resting HR is normal, tachycardia must trigger fast) and a post-valve patient with intact rate response (different envelope entirely) with rules tailored to each.
- **Right level of detail at every layer.** Granular 2-minute samples on the device, 30-minute averages in the Recovery Log — clinicians get a clean trend view without losing the ability to drill in.
- **Realistic deployment story.** BLE-to-mobile is the architecture real medical wearables ship with. Our plan reflects that reality, not a hackathon shortcut.

---

## 10. Roadmap Beyond the Hackathon

1. Fabricate the forearm ring prototype using the documented BoM.
2. Replace the simulated stream with live BLE data from the prototype.
3. Build the production mobile gateway app and clinician dashboard.
4. Run a clinical pilot with a cardiac surgery unit to refine the prescription templates and alert thresholds for post-CABG and post-valve patients.
5. Extend the prescription-template library beyond cardiac to other high-risk recovery contexts (transplant, major abdominal, etc.) once the cardiac envelope is clinically validated.
6. Begin the regulatory pathway for medical-device classification.

---

## 11. Closing

Post-operative monitoring is one of the highest-leverage problems in patient safety: small signals, big consequences, and a measurement gap that current tools do not close. GuardianPost-Op closes it with a clinician-defined, hardware-backed, AI-mediated system. The hackathon demo proves the software pipeline end to end; the hardware design is ready to follow.
