from __future__ import annotations

import sys
from pathlib import Path
from unittest import TestCase, main


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.ml import (
    FrameInput,
    build_facial_fatigue_pipeline,
    build_mock_scan_frames,
    risk_tier_for_score,
)


def _build_low_quality_frames() -> list[FrameInput]:
    return [
        FrameInput(
            frame_id=f"low-quality-{index:03d}",
            timestamp_ms=index * 1_000,
            face_detected=index % 5 == 0,
            eye_openness=0.50,
            blink_detected=False,
            gaze_stability=0.38,
            head_movement=0.15,
            facial_symmetry=0.55,
            scan_quality=0.10,
            low_engagement=0.40,
            negative_affect=0.32,
            brow_tension=0.35,
            jaw_tension=0.34,
            mouth_tension=0.31,
            expression_variance=0.30,
            confidence=0.12,
        )
        for index in range(10)
    ]


class FacialFatiguePipelineTest(TestCase):
    def test_profile_scores_are_ordered_by_risk(self) -> None:
        pipeline = build_facial_fatigue_pipeline()

        low = pipeline.analyze(build_mock_scan_frames("low_risk"))
        moderate = pipeline.analyze(build_mock_scan_frames("moderate_risk"))
        high = pipeline.analyze(build_mock_scan_frames("high_risk"))

        self.assertLess(low.score, moderate.score)
        self.assertLess(moderate.score, high.score)
        self.assertEqual(low.risk_tier, "low")
        self.assertEqual(moderate.risk_tier, "moderate")
        self.assertEqual(high.risk_tier, "high")

    def test_score_is_normalized(self) -> None:
        pipeline = build_facial_fatigue_pipeline()
        results = [
            pipeline.analyze(build_mock_scan_frames("low_risk")),
            pipeline.analyze(build_mock_scan_frames("moderate_risk")),
            pipeline.analyze(build_mock_scan_frames("high_risk")),
            pipeline.analyze(_build_low_quality_frames()),
            pipeline.analyze([]),
        ]

        for result in results:
            self.assertGreaterEqual(result.score, 0)
            self.assertLessEqual(result.score, 100)

    def test_fatigue_signals_are_normalized(self) -> None:
        result = build_facial_fatigue_pipeline().analyze(build_mock_scan_frames("moderate_risk"))
        signal_values = result.signals.as_dict()

        for name, value in signal_values.items():
            self.assertGreaterEqual(value, 0)
            if name == "confidence":
                self.assertLessEqual(value, 1)
            else:
                self.assertLessEqual(value, 100)

    def test_confidence_is_normalized(self) -> None:
        pipeline = build_facial_fatigue_pipeline()
        results = [
            pipeline.analyze(build_mock_scan_frames("low_risk")),
            pipeline.analyze(build_mock_scan_frames("moderate_risk")),
            pipeline.analyze(build_mock_scan_frames("high_risk")),
            pipeline.analyze(_build_low_quality_frames()),
            pipeline.analyze([]),
        ]

        for result in results:
            self.assertGreaterEqual(result.confidence, 0)
            self.assertLessEqual(result.confidence, 1)

    def test_risk_tiers_match_score_thresholds(self) -> None:
        self.assertEqual(risk_tier_for_score(0.0), "low")
        self.assertEqual(risk_tier_for_score(34.99), "low")
        self.assertEqual(risk_tier_for_score(35.0), "moderate")
        self.assertEqual(risk_tier_for_score(64.99), "moderate")
        self.assertEqual(risk_tier_for_score(65.0), "high")
        self.assertEqual(risk_tier_for_score(100.0), "high")

    def test_empty_and_low_quality_scans_do_not_crash(self) -> None:
        pipeline = build_facial_fatigue_pipeline()

        empty_result = pipeline.analyze([])
        low_quality_result = pipeline.analyze(_build_low_quality_frames())

        self.assertLessEqual(empty_result.confidence, 0.2)
        self.assertLessEqual(low_quality_result.confidence, 0.2)
        self.assertGreaterEqual(empty_result.score, 0)
        self.assertLessEqual(empty_result.score, 100)
        self.assertGreaterEqual(low_quality_result.score, 0)
        self.assertLessEqual(low_quality_result.score, 100)

    def test_result_payload_is_api_ready(self) -> None:
        result = build_facial_fatigue_pipeline().analyze(build_mock_scan_frames("high_risk"))
        payload = result.as_dict()

        self.assertEqual(payload["score"], result.score)
        self.assertEqual(payload["risk_tier"], "high")
        self.assertIn("signals", payload)
        self.assertIn("raw_outputs", payload)
        self.assertIn("landmark", payload["raw_outputs"])
        self.assertIn("expression", payload["raw_outputs"])
        self.assertIn("confidence", payload)
        self.assertIn("explanation", payload)


if __name__ == "__main__":
    main()
