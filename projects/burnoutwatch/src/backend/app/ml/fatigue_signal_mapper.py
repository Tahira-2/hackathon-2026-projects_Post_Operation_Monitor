from __future__ import annotations

from .types import ExpressionOutput, FaceLandmarkOutput, FatigueSignals


def _clamp(value: float, lower: float = 0.0, upper: float = 100.0) -> float:
    return max(lower, min(upper, value))


def _clamp_unit(value: float) -> float:
    return max(0.0, min(1.0, value))


class FatigueSignalMapper:
    def map(
        self,
        landmark_output: FaceLandmarkOutput,
        expression_output: ExpressionOutput,
    ) -> FatigueSignals:
        blink_deviation = min(abs(landmark_output.blink_rate - 15.0) / 15.0, 1.0)
        eye_fatigue = (
            (1.0 - landmark_output.eye_openness) * 55.0
            + blink_deviation * 25.0
            + (1.0 - landmark_output.gaze_stability) * 20.0
        )

        facial_tension = (
            expression_output.brow_tension * 35.0
            + expression_output.jaw_tension * 30.0
            + expression_output.mouth_tension * 25.0
            + (1.0 - landmark_output.facial_symmetry) * 10.0
        )

        low_engagement = (
            expression_output.low_engagement * 50.0
            + (1.0 - expression_output.expression_variance) * 30.0
            + (1.0 - landmark_output.head_movement) * 20.0
        )

        negative_affect = expression_output.negative_affect * 75.0 + expression_output.brow_tension * 25.0
        scan_quality = landmark_output.scan_quality * 100.0
        confidence = (
            landmark_output.confidence * 0.40
            + expression_output.confidence * 0.40
            + landmark_output.scan_quality * 0.20
        )

        return FatigueSignals(
            eye_fatigue=round(_clamp(eye_fatigue), 2),
            facial_tension=round(_clamp(facial_tension), 2),
            low_engagement=round(_clamp(low_engagement), 2),
            negative_affect=round(_clamp(negative_affect), 2),
            scan_quality=round(_clamp(scan_quality), 2),
            confidence=round(_clamp_unit(confidence), 4),
        )
