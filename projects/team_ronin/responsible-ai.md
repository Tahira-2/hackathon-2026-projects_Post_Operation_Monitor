# Responsible AI Documentation - Navjeevan
## Track: Population Health Intelligence

## 1. Data Sources

- District immunization counts: Nepal HMIS district records (2024)
- National schedule reference: Nepal National Immunization Program (NIP), Department of Health Services
- IMR classification and district metadata: HMIS district profile data

## 2. Model Choices

- Model: Groq-hosted `llama-3.1-8b-instant`
- Architecture: RAG-lite (live retrieval from Django API + prompt context injection)
- Fine-tuning: not used
- Temperature: `0.2` for factual consistency and lower hallucination risk

Why this approach:
- Live data stays current by year and district
- Low-latency responses suitable for dashboard chat
- No expensive training cycle needed for hackathon scope

## 3. Bias Considerations

- District averages can hide intra-district inequities (remote wards, minority groups)
- HMIS data quality can vary by reporting completeness
- IMR labels can lag current on-ground conditions
- English output may reduce accessibility for Nepali-only users

Mitigation:
- AI is instructed to avoid claims beyond provided context
- Insights are displayed alongside raw district metrics
- Recommendations are advisory and non-diagnostic

## 4. Failure Cases and Mitigations

- Hallucinated numbers -> Prompt guardrails require using only provided data
- Missing district-year data -> API returns not found, frontend shows recoverable error
- Overconfident intervention suggestions -> Prompt enforces practical and cautious phrasing
- API downtime -> Dashboard still works without AI insight panel

## 5. System Boundaries

- Does not diagnose disease
- Does not prescribe treatment
- Does not replace epidemiologists or clinicians
- Does not make autonomous decisions

## 6. Human Oversight

- All AI insights are marked as informational
- Users should validate decisions with district/public health teams
- Individual-level recommendations must defer to local health posts and clinicians
