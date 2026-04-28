# Responsible AI Documentation - BurnoutWatch

## Data Sources

### Device Health Data
BurnoutWatch integrates with native health platforms to collect health metrics:

- **HealthKit (iOS):** Sleep duration, sleep quality proxy, step count, resting heart rate, heart rate variability, activity minutes, workout count
- **Health Connect (Android):** Same metrics as HealthKit

Data is collected only after explicit user permission is granted. Users can revoke permissions at any time through their device settings.

### Manual Input Data
Users manually enter:
- Shift count
- Overtime hours
- Self-reported fatigue rating (1-10)
- Self-reported stress rating (1-10)

### Facial Image Data
The app captures facial images during check-in for fatigue analysis. Images are processed locally or sent to the backend for analysis and are not stored long-term.

## Model Choices

### Burnout Scoring Model
- **Type:** Deterministic weighted scoring algorithm
- **Architecture:** Rule-based with configurable weights
- **Rationale:** Interpretable and auditable; healthcare settings require explainable decisions

### Facial Fatigue Detection
- **Current:** Mock model with deterministic outputs for demo stability
- **Planned Replacement:** 
  - MediaPipe Face Landmarker for geometry and scan quality
  - ONNX or TFLite expression model for engagement and affect
- **Rationale:** Mock models ensure reliable demos; real models require additional validation before clinical use

### Recommendation Engine
- **Primary:** Mock rule-based recommendations
- **Optional:** Hugging Face Gemma 2B model for generative recommendations
- **Rationale:** Mock ensures safety and consistency; LLM can be enabled for more diverse outputs with human oversight

## Bias Considerations

### Data Collection Bias
- **Health API Bias:** HealthKit/Health Connect data may be incomplete for users without wearables or those who do not carry their phones during sleep
- **Mitigation:** Manual entry fallback available for all key metrics; app clearly displays data completeness to users

### Scoring Model Bias
- **Recovery Metrics:** Sleep requirements may vary by age, health conditions, or cultural norms
- **Workload Metrics:** Shift/overtime thresholds are generalized; may not account for role-specific demands
- **Mitigation:** Confidence scores indicate data completeness; recommendations emphasize personalization

### Facial Analysis Bias
- **Demographic Bias:** ML models may perform differently across skin tones, ages, or facial features
- **Mitigation:** Scan quality and confidence scores are reported; low-confidence scans are flagged

### Self-Report Bias
- **Cultural Factors:** Willingness to report fatigue/stress varies by culture and workplace culture
- **Mitigation:** Self-report is one of four scoring categories; not the sole input

## Failure Cases

### Data Unavailability
- **Scenario:** User denies health API permissions or has no data for a time period
- **Impact:** Scoring confidence decreases; risk tier may not be calculable
- **Mitigation:** App displays clear messaging about missing data; manual entry fills gaps

### Incorrect Risk Classification
- **Scenario:** Algorithm misclassifies burnout risk due to incomplete data or unusual patterns
- **Impact:** User receives inappropriate recommendations
- **Mitigation:** All recommendations include safety disclaimer; high-risk scores prompt professional help suggestions

### Facial Analysis Errors
- **Scenario:** Poor lighting, camera quality, or unusual facial features cause incorrect fatigue assessment
- **Impact:** Facial fatigue score may be inaccurate
- **Mitigation:** Confidence scores reported; user can skip facial scan

### API/Network Failures
- **Scenario:** Backend unreachable or mobile offline
- **Impact:** Cannot sync data or get recommendations
- **Mitigation:** Demo mode works offline; local data persists until sync succeeds

### Model Limitations
- **Scenario:** Mock ML models produce unrealistic outputs in edge cases
- **Impact:** Demo may show inconsistent fatigue scores
- **Mitigation:** Demo mode uses predefined profiles; real model replacement planned for production

## Safety Measures

1. **No Medical Diagnosis:** All outputs explicitly state this is a wellness recommendation, not a medical diagnosis
2. **Professional Help Escalation:** High-risk scores recommend consulting healthcare professionals
3. **Data Privacy:** Health data stored locally and securely; only processed for scoring
4. **User Control:** Users can delete all data or revoke permissions at any time
5. **Transparent Scoring:** Users can see which metrics contributed to their score

## Regulatory Awareness

- Not a FDA-approved medical device
- HIPAA considerations: Health data handled locally; minimal transmission to backend
- User consent required for all data collection
- Compliant with iOS App Store and Google Play health app guidelines