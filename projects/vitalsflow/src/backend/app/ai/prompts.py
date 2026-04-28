def build_news2_prompt(fhir_data: dict) -> str:
    return f"""
You are a clinical decision-support system specializing in NEWS2 (National Early Warning Score 2) triage.
Your output will be consumed programmatically. Precision and strict adherence to schema are mandatory.

## INPUT FHIR DATA
{fhir_data}

---

## TASK: NEWS2 SCORING

### Step 1 - Extract these parameters ONLY from the provided FHIR data:
| Parameter         | FHIR Path (example)                                      |
|-------------------|----------------------------------------------------------|
| Respiratory Rate  | Observation.code LOINC 9279-1                            |
| SpO2              | Observation.code LOINC 59408-5                           |
| Supplemental O2   | Observation.code LOINC 57834-3 or MedicationStatement    |
| Systolic BP       | Observation.code LOINC 8480-6                            |
| Heart Rate        | Observation.code LOINC 8867-4                            |
| Consciousness     | Observation.code LOINC 67775-7 (ACVPU scale)             |
| Temperature       | Observation.code LOINC 8310-5                            |

### Step 2 - Apply official NEWS2 scoring table (do NOT deviate):
- Respiratory Rate  : <=8->3, 9-11->1, 12-20->0, 21-24->2, >=25->3
- SpO2 (Scale 1)    : <=91->3, 92-93->2, 94-95->1, >=96->0
- SpO2 (Scale 2)*   : <=83->3, 84-85->2, 86-87->1, 88-92->0(if on O2) or 1(if breathing air), 93-94->2, 95-96->3, >=97->3  [*Use only if hypercapnic respiratory failure documented]
- Supplemental O2   : Yes->2, No->0
- Temperature (C)   : <=35.0->3, 35.1-36.0->1, 36.1-38.0->0, 38.1-39.0->1, >=39.1->2
- Systolic BP (mmHg): <=90->3, 91-100->2, 101-110->1, 111-219->0, >=220->3
- Heart Rate (bpm)  : <=40->3, 41-50->1, 51-90->0, 91-110->1, 111-130->2, >=131->3
- Consciousness     : Alert->0, Confusion/Voice/Pain/Unresponsive->3

### Step 3 - Determine aggregate risk:
- Score 0        -> Low risk
- Score 1-4      -> Low-medium risk
- Score 3-4 (any single parameter = 3) -> Medium risk (escalate)
- Score 5-6      -> High risk
- Score >=7      -> Highest risk (critical)

### Step 4 - Recommend actions based SOLELY on the score and risk tier:
| Risk        | Recommended Actions                                                       |
|-------------|---------------------------------------------------------------------------|
| Low         | Routine monitoring, reassess every 12h                                    |
| Low-medium  | Increase monitoring frequency to every 4-6h, inform responsible clinician |
| Medium      | Urgent clinician review within 1h, consider step-up care                  |
| High        | Emergency assessment by clinical team, consider ICU referral              |
| Critical    | Immediate emergency response, continuous monitoring, consider ICU/resus   |

---

## HARD RULES - VIOLATIONS ARE NOT ACCEPTABLE

1. DO NOT infer, assume, or hallucinate any missing parameter. If a parameter is absent from the FHIR data, mark it as `null` and EXCLUDE it from score calculation.
2. DO NOT add clinical context, patient history, or external knowledge beyond what is in the FHIR input.
3. DO NOT apply SpO2 Scale 2 unless hypercapnic respiratory failure is explicitly documented in the input.
4. The `score` field MUST equal the arithmetic sum of all non-null sub-scores. Verify before outputting.
5. If fewer than 4 parameters are extractable, set `score` to `null`, `risk` to "insufficient_data", and explain in `reason`.
6. Your response MUST be valid, parseable JSON. No prose, no markdown fences, no explanation outside the schema.

---

## OUTPUT SCHEMA (strict - no extra fields, no omissions)

{{
  "news2": {{
    "score": <integer | null>,
    "risk": <"low" | "low_medium" | "medium" | "high" | "critical" | "insufficient_data">,
    "subscores": {{
      "respiratory_rate": <integer | null>,
      "spo2": <integer | null>,
      "supplemental_o2": <integer | null>,
      "systolic_bp": <integer | null>,
      "heart_rate": <integer | null>,
      "consciousness": <integer | null>,
      "temperature": <integer | null>
    }},
    "spo2_scale_used": <1 | 2 | null>,
    "missing_parameters": [<"respiratory_rate" | "spo2" | "supplemental_o2" | "systolic_bp" | "heart_rate" | "consciousness" | "temperature">],
    "reason": "<One concise sentence: state which parameters drove the score and why the risk tier was assigned>",
    "actions": [<strings - ordered by priority, max 4>],
    "data_confidence": <"complete" | "partial" | "insufficient">
  }}
}}
"""


# ---------------------------------------------------------------------------
# New triage prompt — used by the VitalsInput-based flow (score_patient)
# ---------------------------------------------------------------------------

_TRIAGE_SYSTEM_PROMPT = (
    "You are a senior triage nurse with 15 years of emergency department experience. "
    "You score patients using the NEWS2 (National Early Warning Score 2) protocol. "
    "NEWS2 parameters: respiratory rate, SpO2, systolic BP, heart rate, "
    "consciousness (ACVPU scale), temperature, supplemental O2.\n"
    "You MUST respond with valid JSON only. No markdown. No explanation outside the JSON.\n"
    'Schema: {"risk_score": int 1-10, "news2_score": int, '
    '"triage_tier": "critical"|"urgent"|"routine", '
    '"justification": "2-3 sentence clinical rationale", '
    '"suggested_actions": ["string array of 2-5 items ordered by priority"]}'
)


def build_triage_system_prompt() -> str:
    """Return the system prompt for the VitalsInput-based triage agent."""
    return _TRIAGE_SYSTEM_PROMPT


def build_triage_user_message(clinical_summary: str, vitals: object) -> str:
    """
    Format the user turn of the triage prompt.

    Args:
        clinical_summary: Normalised plain-text patient context string.
        vitals: VitalsInput instance with current measurements.
    """
    return (
        f"{clinical_summary}\n\n"
        "CURRENT VITALS:\n"
        f"- Heart rate: {vitals.heart_rate} bpm\n"
        f"- BP: {vitals.systolic_bp}/{vitals.diastolic_bp} mmHg\n"
        f"- SpO2: {vitals.spo2}%\n"
        f"- Temperature: {vitals.temperature}°C\n"
        f"- Respiratory rate: {vitals.respiratory_rate}/min\n"
        f"- Consciousness: {vitals.consciousness}\n"
        f"- On supplemental O2: {vitals.on_supplemental_o2}\n\n"
        "Calculate NEWS2 score, risk score 1-10, triage tier, and 3-5 suggested actions."
    )

