# Responsible AI Documentation — TriageTech

## Training Data Sources

- **Symptom–Condition Mapping**: Based on WHO ICD-10 published clinical categories and Nepal MoHP published symptom guidelines.
- **Red-Flag Rules**: Derived from NICE Clinical Guidelines (UK), WHO Emergency Triage Assessment & Treatment (ETAT), and peer-reviewed emergency medicine literature.
- **Nepali Vocabulary**: Bilingual symptom terms sourced from Nepal Health Research Council (NHRC) public health documents and Nepali Unicode Standard dictionaries.
- **Clinic Data**: Nepal MoHP public health facilities register (geospatial data).

> **Note**: No real patient data was used. The system is rule-based with a deterministic engine — no statistical ML model was trained on personal health records.

---

## Model Bias Analysis

| Dimension | Risk Level | Mitigation |
|---|---|---|
| **Age** | Medium | Engine applies explicit risk escalation for patients ≤2 or ≥65 years |
| **Gender** | Low | Symptom rules are gender-neutral; `gender` field is informational only |
| **Rural vs. Urban** | Medium | Clinic lookup uses haversine distance — serves rural users equitably |
| **Language** | High (mitigated) | Nepali Devanagari + Romanized Nepali both supported |
| **Literacy** | Medium | Voice input enabled; large touch targets for low-literacy users |

---

## Failure Modes

1. **Symptom Hallucination**: A user may enter a symptom that partially matches a more serious symptom keyword. Mitigated by requiring substring match of >7 characters before fuzzy matching.
2. **Under-triage**: Rare or novel symptom combinations not in the knowledge base may be classified GREEN when they should be YELLOW. Mitigated by defaulting to YELLOW when confidence is below 50%.
3. **Voice Misrecognition**: Browser speech recognition may misinterpret Nepali terms. Mitigated by showing recognized text to user before submission.
4. **Geolocation Failure**: If user denies location access, system defaults to Kathmandu center coordinates for clinic lookup. A manual district selector is planned.
5. **Network Failure**: Frontend shows a user-friendly error and does not crash if the API is unreachable.

---

## Nepali Language Equity

- **Devanagari Script**: Full support for typed Nepali (Unicode ०–९, क–ह).
- **Romanized Nepali**: Common Romanized forms (e.g. "jwaro" for ज्वरो) are mapped to English equivalents.
- **UI Strings**: All interface text available in Nepali via the language toggle; persisted to `localStorage`.
- **Voice**: `ne-NP` locale used for speech recognition when Nepali mode is active.
- **Known Gap**: Dialectal variation (Maithili, Tamang, Gurung terms) is not yet supported. This is a planned improvement.

---

## Misuse Scenarios

| Scenario | Risk | Safeguard |
|---|---|---|
| User enters false symptoms to get a specific result | Low clinical harm — tool is advisory only | Disclaimer on every result screen |
| Tool used instead of calling emergency services | High | RED results show emergency call button (102) and explicit warning |
| Reliance on tool for chronic disease management | Medium | Advice text always recommends professional consultation |
| Data harvesting (symptom data) | Low — no data stored | No backend database; no user authentication; no PII collected |
| Children using without adult supervision | Medium | Age escalation logic treats patients ≤2 as higher risk |

---

## Limitations Statement

This tool is **not a diagnostic device**. It is a **triage support tool** intended to help users decide the urgency of seeking care. It does not:
- Diagnose medical conditions
- Prescribe medications
- Replace a licensed healthcare provider

Always consult a qualified medical professional for diagnosis and treatment.
