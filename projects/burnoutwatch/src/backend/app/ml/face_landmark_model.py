from __future__ import annotations

from .types import FaceLandmarkOutput, FrameInput


def _clamp(value: float, lower: float = 0.0, upper: float = 1.0) -> float:
    return max(lower, min(upper, value))


def _average(values: list[float | None], fallback: float) -> float:
    filtered = [value for value in values if value is not None]
    return sum(filtered) / len(filtered) if filtered else fallback


class FaceLandmarkModel:
    def predict(self, frames: list[FrameInput]) -> FaceLandmarkOutput:
        if not frames:
            return FaceLandmarkOutput(
                eye_openness=0.0,
                blink_rate=0.0,
                gaze_stability=0.0,
                head_movement=0.0,
                facial_symmetry=0.0,
                scan_quality=0.0,
                confidence=0.0,
            )

        face_detection_rate = sum(1 for frame in frames if frame.face_detected) / len(frames)
        eye_openness = _clamp(_average([frame.eye_openness for frame in frames], 0.62))
        gaze_stability = _clamp(_average([frame.gaze_stability for frame in frames], 0.70))
        head_movement = _clamp(_average([frame.head_movement for frame in frames], 0.35))
        facial_symmetry = _clamp(_average([frame.facial_symmetry for frame in frames], 0.82))
        scan_quality = _clamp(_average([frame.scan_quality for frame in frames], 0.75) * face_detection_rate)
        frame_confidence = _clamp(_average([frame.confidence for frame in frames], 0.78))

        return FaceLandmarkOutput(
            eye_openness=eye_openness,
            blink_rate=self._blink_rate(frames),
            gaze_stability=gaze_stability,
            head_movement=head_movement,
            facial_symmetry=facial_symmetry,
            scan_quality=scan_quality,
            confidence=_clamp((frame_confidence + scan_quality + face_detection_rate) / 3),
        )

    def _blink_rate(self, frames: list[FrameInput]) -> float:
        blink_frames = sum(1 for frame in frames if frame.blink_detected)
        if len(frames) < 2:
            return float(blink_frames)

        duration_ms = max(frames[-1].timestamp_ms - frames[0].timestamp_ms, 1)
        minutes = duration_ms / 60_000
        return blink_frames / minutes
