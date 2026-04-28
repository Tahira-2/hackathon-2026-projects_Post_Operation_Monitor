from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Literal


RiskTier = Literal["low", "moderate", "high"]
RawModelOutputs = dict[str, dict[str, float]]


def _rounded_dataclass_values(value: object) -> dict[str, float]:
    return {key: round(float(item), 4) for key, item in asdict(value).items()}


@dataclass(frozen=True)
class FrameInput:
    frame_id: str
    timestamp_ms: int
    width: int = 640
    height: int = 480
    face_detected: bool = True
    eye_openness: float | None = None
    blink_detected: bool | None = None
    gaze_stability: float | None = None
    head_movement: float | None = None
    facial_symmetry: float | None = None
    scan_quality: float | None = None
    low_engagement: float | None = None
    negative_affect: float | None = None
    brow_tension: float | None = None
    jaw_tension: float | None = None
    mouth_tension: float | None = None
    expression_variance: float | None = None
    confidence: float | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class FaceLandmarkOutput:
    eye_openness: float
    blink_rate: float
    gaze_stability: float
    head_movement: float
    facial_symmetry: float
    scan_quality: float
    confidence: float

    def as_dict(self) -> dict[str, float]:
        return _rounded_dataclass_values(self)


@dataclass(frozen=True)
class ExpressionOutput:
    low_engagement: float
    negative_affect: float
    brow_tension: float
    jaw_tension: float
    mouth_tension: float
    expression_variance: float
    confidence: float

    def as_dict(self) -> dict[str, float]:
        return _rounded_dataclass_values(self)


@dataclass(frozen=True)
class FatigueSignals:
    eye_fatigue: float
    facial_tension: float
    low_engagement: float
    negative_affect: float
    scan_quality: float
    confidence: float

    def as_dict(self) -> dict[str, float]:
        return _rounded_dataclass_values(self)


@dataclass(frozen=True)
class FacialFatigueResult:
    score: float
    risk_tier: RiskTier
    signals: FatigueSignals
    raw_outputs: RawModelOutputs
    confidence: float
    explanation: list[str]

    def as_dict(self) -> dict[str, Any]:
        return {
            "score": self.score,
            "risk_tier": self.risk_tier,
            "signals": self.signals.as_dict(),
            "raw_outputs": self.raw_outputs,
            "confidence": self.confidence,
            "explanation": list(self.explanation),
        }
