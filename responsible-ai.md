# Responsible AI Documentation
## MedRoute — CareDevi AI Innovation Hackathon 2026

---

## 1. Project Overview
MedRoute is a conversational triage tool that uses a large language model (LLM) to help patients understand the urgency of their symptoms and identify the appropriate care setting. After a short multi-turn interview, it returns a structured urgency assessment (emergency / urgent / semi_urgent / non_urgent / self_care), concrete next steps, and a map of nearby relevant care facilities.

**Live URL:** https://hackathon-2026-projects-production.up.railway.app/

---

## 2. Data Sources
- **Patient input:** Free-text symptom descriptions entered by the user
- **No real patient data is used.** All testing conducted with synthetic and hypothetical symptom scenarios.
- **OpenStreetMap / Overpass API:** Used to surface nearby care facilities based on urgency level. Public data, no PHI involved.
- **Model:** Groq API — `llama-3.3-70b-versatile`

---

## 3. Model Choices & Rationale
| Decision | Rationale |
|---|---|
| Groq + llama-3.3-70b-versatile | Fast inference, strong instruction-following, suitable for conversational triage |
| Server-side API proxy | API key never reaches the browser; reduces misuse risk |
| Structured JSON output (delimited) | Reduces hallucination risk vs. open-ended prose; enables reliable parsing |
| Multi-turn interview (3–6 turns) | Gathers enough context before assessing; avoids premature or under-informed triage |
| Urgency-specific next steps | Gives users concrete, actionable guidance rather than generic advice |
| Nearby facility map | Closes the loop from assessment to action without requiring users to search independently |

---

## 4. Intended Use
- **For:** Patients seeking guidance on how urgently they need care
- **Not for:** Clinical diagnosis, treatment decisions, or replacing professional medical judgment
- **Intended setting:** Pre-visit triage support only

---

## 5. Known Limitations & Failure Cases
| Failure Case | Mitigation |
|---|---|
| Vague or incomplete symptom input | Model asks focused follow-up questions before assessing |
| Rare or complex presentations | Model may under-triage; system prompt includes red flag escalation to emergency |
| Non-English or informal language | May reduce accuracy of symptom interpretation |
| Pediatric edge cases | Model not specialized for pediatric physiology |
| Mental health crises | Tool routes to appropriate care but is not a crisis counselor |
| Groq free-tier rate limits | 100k tokens/day limit; heavy testing can exhaust quota |

---

## 6. Bias Considerations
- LLMs trained on general data may reflect historical biases in healthcare (e.g., underrepresentation of certain demographics in training data)
- Symptom descriptions using non-clinical or culturally specific language may be interpreted inconsistently
- The tool has not been validated across diverse patient populations

---

## 7. Hallucination Risk & Mitigations
- Model is explicitly instructed to only use patient-provided information
- Structured JSON output (wrapped in `|||ASSESSMENT|||` delimiters) reduces free-form fabrication
- No drug dosages, diagnoses, or treatment plans are generated
- Mandatory disclaimer is appended to every assessment

---

## 8. Human Oversight
- This tool is designed as a **decision support aid**, not a decision-maker
- All outputs include a mandatory disclaimer directing users to seek professional medical advice
- A clinician or triage nurse should always make the final call

---

## 9. Disclaimer (displayed in product)
*"Not a substitute for professional medical advice. In emergencies, call 911."*

---

## 10. Team
| Name | Role |
|---|---|
| Fidel | Deployment (Railway), infrastructure |
| Eladio | Frontend, nearby facility map (Leaflet + Overpass API) |
| Jeheon | History persistence (localStorage), session management |
