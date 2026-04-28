# Responsible AI — MediClaim AI

> This document covers model choices, data handling, bias considerations, failure cases, and ethical constraints for MediClaim AI. It is required reading for anyone deploying or extending this system.

---

## Who This Tool Is For

MediClaim AI is designed for **patients** — people who receive a medical bill and want to understand what they are being charged for and whether those charges are reasonable. It is not designed for clinical decision-making, professional medical billing review, or insurance claims adjudication.

The tool is **not** intended for:
- Healthcare providers auditing their own billing practices
- Insurance companies making coverage determinations
- Legal or regulatory proceedings
- Any context involving real-time clinical decisions

---

## Model Choices & Rationale

### Llama3-OpenBioLLM-70B (HuggingFace Inference API)
Used exclusively for generating **plain-English explanations** of medical bill line items. This model was chosen over general-purpose LLMs because it is fine-tuned on biomedical text, which reduces hallucination of clinical terminology (e.g., inventing plausible-sounding but incorrect CPT code definitions).

**Critical constraint:** The LLM is never used for numeric decisions. It does not calculate overcharges, set severity levels, or determine coverage amounts. All of those are handled by deterministic Python against publicly available CMS benchmark data.

### Medical NER — Layered Approach
Entity extraction uses three layers, in order of priority:

1. **Regex-based extraction** (always runs): CPT codes, dollar amounts, and drug names are extracted with pattern matching. This is deterministic, auditable, and not subject to hallucination.
2. **HuggingFace `d4data/biomedical-ner-all`** (optional enhancement): Adds entity spans when available. Results are merged with, not replacements for, the regex output.
3. **Google Gemini API** (fallback): Used only when HuggingFace is unavailable. Same constraints apply — used for entity identification, not numeric decisions.

This layered design means the system degrades gracefully and the most safety-critical extractions (dollar amounts, CPT codes) are never delegated to a generative model.

### CMS Benchmarking — Fully Deterministic
Overcharge detection compares extracted charges against the CMS Medicare Physician Fee Schedule using simple thresholds:
- **HIGH**: Charged amount > 150% of CMS benchmark
- **MEDIUM**: Charged amount > 120% of CMS benchmark
- **LOW**: Charged amount within 20% of CMS benchmark

These thresholds are configurable via environment variables and are documented in `config.py`. No model is involved in this calculation.

---

## Data Sources

| Source | What It Contains | Privacy Risk | Usage |
|--------|-----------------|-------------|-------|
| CMS Medicare Physician Fee Schedule | National average reimbursement rates by procedure code | None — public aggregate data | Overcharge benchmarking |
| Synthea synthetic patient data | Procedurally generated fictional patient records | None — zero PHI by design | Demo bill generation and testing |
| OpenFDA | Public drug database and recall information | None — public regulatory data | Drug verification in NER enrichment |
| RxNorm (NLM) | Drug name normalization database | None — public reference data | Drug name standardization |
| NLM Clinical Tables | CPT and HCPCS code reference | None — public reference data | CPT code validation |

**No real patient data is collected, stored, or transmitted by this application.**

---

## Data Handling & Privacy

- **No persistent storage of uploaded bills.** PDF files are read into memory, processed, and discarded within the same request lifecycle. Nothing is written to disk.
- **No user accounts or session tracking.** The application has no authentication layer and collects no identifying information.
- **External API calls transmit anonymized text only.** When calling HuggingFace or Google Gemini, only the extracted medical text (not the raw PDF or any patient identifiers) is sent. Calls are made over HTTPS.
- **FHIR output is stored in-memory only.** Generated ExplanationOfBenefit resources are held in a process-level dictionary and are lost on server restart. No database is involved.
- **This application is not HIPAA-compliant.** It is a hackathon prototype. It should not be used with real Protected Health Information (PHI) in any production setting without a full HIPAA compliance review, Business Associate Agreement with all API providers, and proper audit logging.

---

## Bias Considerations

### Population Coverage Bias
CMS Medicare rates reflect the demographics of the **Medicare population** — predominantly adults over 65. These benchmarks may not accurately represent:
- Pediatric procedure pricing
- Procedures disproportionately affecting younger or working-age populations
- Rural versus urban cost-of-living differences in healthcare delivery
- Uninsured or underinsured patient populations who face different negotiated rates

### Geographic Bias
CMS rates are national averages. Actual charges vary significantly by region. A charge flagged as HIGH in a low-cost rural area may be entirely standard in a high-cost urban market. The system does not account for geographic locality adjustments.

### Format Bias
The NER pipeline has been tested primarily against US medical billing formats using standard CMS-1500 and UB-04 bill structures. Bills that deviate from these formats — including:
- International billing formats
- Handwritten or paper bills
- Non-English language bills
- Specialty billing formats (e.g., dental, vision, behavioral health)

…may produce lower extraction accuracy, leading to missed charges or incorrect entity classification.

### Language Bias
All prompts, explanations, and output are in English. Non-English input is not explicitly handled and will likely produce degraded NER results.

### Insurance Simulation Bias
The insurance coverage calculations use simplified, simulated plan rules. Real insurance plans include plan-specific exclusions, prior authorization requirements, network restrictions, and coordination of benefits rules that are not modeled here. Coverage estimates should be treated as rough directional guidance only.

---

## Failure Cases & Mitigations

| Failure Case | Likelihood | User Impact | Mitigation |
|-------------|-----------|------------|------------|
| Poor OCR on scanned bills | Medium | Missed line items, incorrect amounts | Raw extracted text shown alongside AI output; user can cross-check |
| LLM explanation contains clinical inaccuracies | Low-Medium | Misleading plain-English description | Disclaimer shown on every output screen; LLM output labeled clearly as AI-generated |
| Hallucinated or incorrect CPT code explanation | Low | User misunderstands a charge | CPT codes cross-validated against NLM Clinical Tables before LLM explanation is generated |
| CMS benchmark mismatch (code not in database) | Medium | Charge not benchmarked, not flagged | Unrecognized charges flagged as HIGH severity with recommendation to request itemized explanation from provider |
| Overconfident coverage estimate | High | User underpays or disputes incorrectly | All estimates labeled "verify with your insurer"; CMS-vs-private rate discrepancy noted in UI |
| HuggingFace API unavailable | Low | Degraded NER; LLM falls back to template | Automatic fallback chain: HuggingFace → Google Gemini → template-based analysis |
| Google Gemini API unavailable | Low | Template-based analysis used | Template analysis still surfaces all deterministic flags and benchmarks |
| Bill contains non-standard charge codes | Medium | Charges not benchmarked | Logged and surfaced in output as unverified items |
| User uploads non-medical PDF | Low | Nonsensical output | Error returned if no medical entities detected above threshold |

---

## What This System Is NOT

| ❌ Not This | Notes |
|------------|-------|
| A legal advisor | Output cannot be used in billing disputes or legal proceedings |
| A financial advisor | Coverage estimates are simulations, not binding insurance determinations |
| An FDA-cleared medical device | Not regulated, not certified, not clinically validated |
| A HIPAA-compliant system | Not suitable for production use with real PHI without significant engineering and legal review |
| A replacement for a professional medical biller | Complex cases, denials, and appeals require human expertise |
| Connected to real insurance systems | Coverage is estimated from simulated plan rules |

---

## Transparency Commitments

- All severity classification rules are documented and configurable in `config.py` — no hidden weights or black-box thresholds.
- CMS benchmark source data is bundled in the repository at `src/backend/data/cms_rates.json` and can be inspected directly.
- The system clearly distinguishes in the UI between LLM-generated explanations and deterministic calculations.
- Confidence scores are provided for NER entity extraction results.
- This document is committed alongside the source code and updated with any model or data source changes.

---

## Disclaimer

> This tool is for informational purposes only. It does not constitute medical, legal, or financial advice. All charge comparisons are against CMS Medicare benchmarks and may not reflect your actual insurer's contracted rates. Always verify charges and coverage directly with your healthcare provider and insurance company.
>
> This application has not been reviewed or approved by the FDA, CMS, or any other regulatory body. It is a prototype built for an educational hackathon and is not suitable for production clinical or financial use.
