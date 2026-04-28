from __future__ import annotations

from .expression_fatigue_model import ExpressionFatigueModel
from .face_landmark_model import FaceLandmarkModel
from .fatigue_signal_mapper import FatigueSignalMapper
from .types import (
    ExpressionOutput,
    FaceLandmarkOutput,
    FacialFatigueResult,
    FatigueSignals,
    FrameInput,
    RawModelOutputs,
    RiskTier,
)


LOW_RISK_MAX_SCORE = 35.0
HIGH_RISK_MIN_SCORE = 65.0

_SCORE_WEIGHTS = {
    "eye_fatigue": 0.40,
    "facial_tension": 0.25,
    "low_engagement": 0.20,
    "negative_affect": 0.10,
    "quality_adjustment": 0.05,
}


def _clamp_score(value: float) -> float:
    return max(0.0, min(100.0, value))


def risk_tier_for_score(score: float) -> RiskTier:
    normalized_score = _clamp_score(score)
    if normalized_score < LOW_RISK_MAX_SCORE:
        return "low"
    if normalized_score < HIGH_RISK_MIN_SCORE:
        return "moderate"
    return "high"


class FacialFatiguePipeline:
    def __init__(
        self,
        landmark_model: FaceLandmarkModel | None = None,
        expression_model: ExpressionFatigueModel | None = None,
        mapper: FatigueSignalMapper | None = None,
    ) -> None:
        self.landmark_model = landmark_model or FaceLandmarkModel()
        self.expression_model = expression_model or ExpressionFatigueModel()
        self.mapper = mapper or FatigueSignalMapper()

    def analyze(self, frames: list[FrameInput]) -> FacialFatigueResult:
        landmark_output = self.landmark_model.predict(frames)
        expression_output = self.expression_model.predict(frames)
        signals = self.mapper.map(landmark_output, expression_output)
        quality_adjustment = 100.0 - signals.scan_quality

        score = (
            signals.eye_fatigue * _SCORE_WEIGHTS["eye_fatigue"]
            + signals.facial_tension * _SCORE_WEIGHTS["facial_tension"]
            + signals.low_engagement * _SCORE_WEIGHTS["low_engagement"]
            + signals.negative_affect * _SCORE_WEIGHTS["negative_affect"]
            + quality_adjustment * _SCORE_WEIGHTS["quality_adjustment"]
        )
        normalized_score = round(_clamp_score(score), 2)

        return FacialFatigueResult(
            score=normalized_score,
            risk_tier=risk_tier_for_score(normalized_score),
            signals=signals,
            raw_outputs=self._raw_outputs(landmark_output, expression_output),
            confidence=signals.confidence,
            explanation=self._explain(signals),
        )

    def _explain(self, signals: FatigueSignals) -> list[str]:
        contributions = {
            "eye fatigue": signals.eye_fatigue * _SCORE_WEIGHTS["eye_fatigue"],
            "facial tension": signals.facial_tension * _SCORE_WEIGHTS["facial_tension"],
            "low engagement": signals.low_engagement * _SCORE_WEIGHTS["low_engagement"],
            "negative affect": signals.negative_affect * _SCORE_WEIGHTS["negative_affect"],
            "scan quality penalty": (100.0 - signals.scan_quality)
            * _SCORE_WEIGHTS["quality_adjustment"],
        }
        ranked = sorted(contributions.items(), key=lambda item: item[1], reverse=True)
        return [f"{label}: {round(value, 2)} score points" for label, value in ranked[:3]]

    def _raw_outputs(
        self,
        landmark_output: FaceLandmarkOutput,
        expression_output: ExpressionOutput,
    ) -> RawModelOutputs:
        return {
            "landmark": landmark_output.as_dict(),
            "expression": expression_output.as_dict(),
        }
