# Responsible AI

## Data Sources Listed

This project uses the following data sources:

- src/Training.csv: Primary dataset used to train the disease classification model.
- src/Testing.csv: Holdout-style dataset used for external evaluation.
- src/ml_service/symptoms.json: Ordered symptom vocabulary used to build inference feature vectors.

Data format notes:

- Features are symptom indicators (binary style, present or absent).
- Target label is prognosis (disease name).
- Dataset is structured and relatively small, so results are suitable for prototype validation, not clinical validation.

## Model Choices Explained

The system uses a hybrid approach:

1. Supervised ML classifier

- Model: RandomForestClassifier (scikit-learn).
- Why this choice:
  - Works well with tabular binary features.
  - Handles non-linear interactions among symptoms.
  - Robust and fast for hackathon-scale training and inference.
  - Provides class probabilities (predict_proba) for confidence display.
- Current configuration in training script:
  - n_estimators = 100
  - max_depth = 20
  - random_state = 42

2. Rule-based risk adjustment engine

- Input: model confidence plus lifestyle factors (for example smoking, sleep, pollution).
- Purpose: convert base disease likelihood into an adjusted, explainable risk score with recommendations.
- Why this choice:
  - Improves transparency for users and judges.
  - Enables actionable guidance and intervention simulation.
  - Separates statistical prediction from policy-style risk communication.

## Bias Considerations Addressed

Potential bias and fairness risks:

- Dataset representativeness risk: Training data may not reflect all demographics, regions, or comorbidity patterns.
- Label quality risk: If labels are noisy or simplified, the model can learn biased associations.
- Feature coverage risk: Symptom-only input excludes socioeconomic, longitudinal, and clinical test context.
- Rule bias risk: Risk multipliers in the rule engine are heuristic and can over- or under-estimate risk for some populations.

Current mitigations:

- Explicit disclaimer that output is informational and not a medical diagnosis.
- Explainable outputs (factors, adjusted risk, recommendation blocks) to reduce blind trust.
- Separation between model score and rule adjustments to make assumptions auditable.
- Prototype framing in demo: performance is reported as dataset-level, not clinical-grade.

Planned improvements:

- Expand and diversify datasets before any real-world deployment.
- Add subgroup evaluation and calibration checks.
- Add clinician review for rule multipliers and recommendation safety.
- Add uncertainty communication (confidence bands and abstain/fallback logic).

## Failure Cases Documented

Known failure modes:

- Ambiguous symptoms across multiple diseases can cause incorrect top-1 prediction.
- Rare or unseen symptom patterns may produce unstable predictions.
- Missing or incorrect symptom inputs can significantly alter model output.
- Rule adjustments may overreact when lifestyle data is incomplete or self-reported inaccurately.
- High confidence does not imply clinical correctness in real-world settings.

Operational limitations:

- No online learning from each user execution.
- No clinician-in-the-loop validation step in the current prototype.
- Not designed for emergency diagnosis or treatment decisions.

Safety handling and response strategy:

- Include clear medical disclaimer in user-facing output.
- Provide urgency messaging and encourage professional consultation.
- Keep human-readable explanation for risk drivers to support review.
- Treat this system as decision support, not autonomous diagnosis.
