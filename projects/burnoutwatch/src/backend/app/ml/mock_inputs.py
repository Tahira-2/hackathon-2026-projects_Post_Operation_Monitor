from __future__ import annotations

from .types import FrameInput


_PROFILES: dict[str, dict[str, float]] = {
    "low_risk": {
        "eye_openness": 0.78,
        "blink_interval": 4,
        "gaze_stability": 0.90,
        "head_movement": 0.62,
        "facial_symmetry": 0.94,
        "scan_quality": 0.95,
        "low_engagement": 0.16,
        "negative_affect": 0.12,
        "brow_tension": 0.18,
        "jaw_tension": 0.14,
        "mouth_tension": 0.12,
        "expression_variance": 0.76,
        "confidence": 0.94,
    },
    "moderate_risk": {
        "eye_openness": 0.56,
        "blink_interval": 7,
        "gaze_stability": 0.68,
        "head_movement": 0.42,
        "facial_symmetry": 0.84,
        "scan_quality": 0.82,
        "low_engagement": 0.46,
        "negative_affect": 0.34,
        "brow_tension": 0.43,
        "jaw_tension": 0.38,
        "mouth_tension": 0.34,
        "expression_variance": 0.48,
        "confidence": 0.84,
    },
    "high_risk": {
        "eye_openness": 0.34,
        "blink_interval": 15,
        "gaze_stability": 0.42,
        "head_movement": 0.18,
        "facial_symmetry": 0.68,
        "scan_quality": 0.66,
        "low_engagement": 0.76,
        "negative_affect": 0.62,
        "brow_tension": 0.70,
        "jaw_tension": 0.66,
        "mouth_tension": 0.61,
        "expression_variance": 0.24,
        "confidence": 0.76,
    },
}


def build_mock_scan_frames(profile: str = "high_risk") -> list[FrameInput]:
    if profile not in _PROFILES:
        supported = ", ".join(sorted(_PROFILES))
        raise ValueError(f"Unsupported profile '{profile}'. Expected one of: {supported}")

    values = _PROFILES[profile]
    blink_interval = int(values["blink_interval"])

    return [
        FrameInput(
            frame_id=f"{profile}-{index:03d}",
            timestamp_ms=index * 1_000,
            eye_openness=values["eye_openness"],
            blink_detected=index % blink_interval == 0,
            gaze_stability=values["gaze_stability"],
            head_movement=values["head_movement"],
            facial_symmetry=values["facial_symmetry"],
            scan_quality=values["scan_quality"],
            low_engagement=values["low_engagement"],
            negative_affect=values["negative_affect"],
            brow_tension=values["brow_tension"],
            jaw_tension=values["jaw_tension"],
            mouth_tension=values["mouth_tension"],
            expression_variance=values["expression_variance"],
            confidence=values["confidence"],
        )
        for index in range(60)
    ]
