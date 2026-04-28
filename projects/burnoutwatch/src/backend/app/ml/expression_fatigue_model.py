from __future__ import annotations

from .types import ExpressionOutput, FrameInput


def _clamp(value: float, lower: float = 0.0, upper: float = 1.0) -> float:
    return max(lower, min(upper, value))


def _average(values: list[float | None], fallback: float) -> float:
    filtered = [value for value in values if value is not None]
    return sum(filtered) / len(filtered) if filtered else fallback


class ExpressionFatigueModel:
    def predict(self, frames: list[FrameInput]) -> ExpressionOutput:
        if not frames:
            return ExpressionOutput(
                low_engagement=0.0,
                negative_affect=0.0,
                brow_tension=0.0,
                jaw_tension=0.0,
                mouth_tension=0.0,
                expression_variance=0.0,
                confidence=0.0,
            )

        low_engagement = _clamp(_average([frame.low_engagement for frame in frames], 0.45))
        negative_affect = _clamp(_average([frame.negative_affect for frame in frames], 0.32))
        brow_tension = _clamp(_average([frame.brow_tension for frame in frames], 0.35))
        jaw_tension = _clamp(_average([frame.jaw_tension for frame in frames], 0.30))
        mouth_tension = _clamp(_average([frame.mouth_tension for frame in frames], 0.28))
        expression_variance = _clamp(_average([frame.expression_variance for frame in frames], 0.50))
        confidence = _clamp(_average([frame.confidence for frame in frames], 0.76))

        return ExpressionOutput(
            low_engagement=low_engagement,
            negative_affect=negative_affect,
            brow_tension=brow_tension,
            jaw_tension=jaw_tension,
            mouth_tension=mouth_tension,
            expression_variance=expression_variance,
            confidence=confidence,
        )
