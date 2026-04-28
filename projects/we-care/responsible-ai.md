# Responsible AI Documentation — RefAI

**Team:** We Care
**Project:** RefAI — AI Referral Management Portal

---

## 1. Data Sources

| Data Type | Source | Notes |
|---|---|---|
| Patient referral notes | Mock/demo data only | No real patient data used |
| Specialist profiles | Hardcoded mock data | Names, specialties, availability are fictional |
| Clinical terminology | Google Gemini general knowledge | No proprietary medical database used |

> No real patient health information (PHI) is collected, stored, or transmitted. All data shown in the demo is synthetic.

---

## 2. Model Choices

**Model used:** Google Gemini 2.5 Flash

**Why Gemini 2.5 Flash:**
- Improved performance and speed over Gemini 1.5 Flash
- Strong performance extracting structured information from unstructured clinical text
- Reliable instruction-following for JSON-formatted output
- Free tier with generous limits — suitable for hackathon scale

**How it is used:**
- Extracts structured fields (patient name, diagnosis, urgency, required specialty) from doctor's free-text notes
- Suggests a specialist category — does NOT make clinical decisions

---

## 3. Bias Considerations

| Risk | Mitigation |
|---|---|
| Specialty assignment may reflect biases in training data | Suggestion is advisory only — referring doctor makes the final decision |
| Urgency classification may be inconsistent for ambiguous notes | Urgency level is always editable before submission |
| Underrepresented conditions may extract poorly | Free-text fallback available if AI extraction is incomplete |

**RefAI does not make clinical decisions. All AI outputs require human review before any action is taken.**

---

## 4. Failure Cases

| Failure | How the system handles it |
|---|---|
| AI extracts incorrect patient details | Doctor reviews and edits all fields before submitting |
| AI suggests wrong specialty | Manual override always available via dropdown |
| Gemini API is unavailable | Form falls back to fully manual entry |
| Ambiguous or very short clinical notes | System prompts doctor for more detail |
| Supabase is unavailable | Clear error message shown; no silent data loss |

---

## 5. Human Oversight

Every AI-generated output is reviewed by the referring doctor before submission. RefAI is designed as a time-saving assistant — not an autonomous decision-maker. Doctors retain full control at every step.
