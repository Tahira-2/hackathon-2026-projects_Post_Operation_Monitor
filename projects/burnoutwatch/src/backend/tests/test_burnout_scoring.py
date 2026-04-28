from __future__ import annotations

import sys
import tempfile
from pathlib import Path
from unittest import TestCase, main


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import HTTPException

from app.main import analyze_facial_fatigue_photo, get_burnout_score
from app.metrics import DailyMetricSummary, MetricsRepository, MetricsService
from app.ml.photo_scan import PhotoScanRequest
from app.scoring import NoScorableDataError, calculate_burnout_score


def summary(worker_id: str, local_date: str, **overrides) -> DailyMetricSummary:
    return DailyMetricSummary(
        worker_id=worker_id,
        local_date=local_date,
        source_platform="ios_healthkit",
        **overrides,
    )


class BurnoutScoringTest(TestCase):
    def test_low_moderate_and_high_profiles_map_to_expected_tiers(self) -> None:
        low = calculate_burnout_score(
            "worker-score",
            "2026-04-26",
            "2026-04-26",
            [
                summary(
                    "worker-score",
                    "2026-04-26",
                    sleep_duration_hours=8.0,
                    sleep_quality_proxy=0.85,
                    step_count=9000,
                    resting_heart_rate_bpm=60,
                    heart_rate_variability_ms=70,
                    activity_minutes=60,
                    shift_count=1,
                    overtime_hours=0,
                    fatigue_rating=2,
                    stress_rating=2,
                    ingested_at="2026-04-26T12:00:00Z",
                )
            ],
        )
        moderate = calculate_burnout_score(
            "worker-score",
            "2026-04-26",
            "2026-04-26",
            [
                summary(
                    "worker-score",
                    "2026-04-26",
                    sleep_duration_hours=6.0,
                    sleep_quality_proxy=0.55,
                    step_count=5000,
                    resting_heart_rate_bpm=75,
                    heart_rate_variability_ms=40,
                    activity_minutes=20,
                    shift_count=2,
                    overtime_hours=2,
                    fatigue_rating=6,
                    stress_rating=6,
                    ingested_at="2026-04-26T12:00:00Z",
                )
            ],
        )
        high = calculate_burnout_score(
            "worker-score",
            "2026-04-26",
            "2026-04-26",
            [
                summary(
                    "worker-score",
                    "2026-04-26",
                    sleep_duration_hours=5.0,
                    sleep_quality_proxy=0.30,
                    step_count=2000,
                    resting_heart_rate_bpm=90,
                    heart_rate_variability_ms=20,
                    activity_minutes=5,
                    shift_count=3,
                    overtime_hours=5,
                    fatigue_rating=9,
                    stress_rating=9,
                    ingested_at="2026-04-26T12:00:00Z",
                )
            ],
        )

        self.assertEqual(low.risk_tier, "low")
        self.assertEqual(moderate.risk_tier, "moderate")
        self.assertEqual(high.risk_tier, "high")
        self.assertLess(low.burnout_score, moderate.burnout_score)
        self.assertLess(moderate.burnout_score, high.burnout_score)

    def test_missing_data_still_scores_with_lower_confidence(self) -> None:
        result = calculate_burnout_score(
            "worker-score",
            "2026-04-26",
            "2026-04-26",
            [
                summary(
                    "worker-score",
                    "2026-04-26",
                    sleep_duration_hours=5.5,
                    ingested_at="2026-04-26T12:00:00Z",
                )
            ],
        )

        self.assertGreater(result.burnout_score, 0)
        self.assertLess(result.confidence, 1)
        self.assertEqual(result.days_used, 1)
        self.assertEqual(result.contributors[0].metric, "sleep_duration_hours")

    def test_no_usable_fields_raises(self) -> None:
        with self.assertRaises(NoScorableDataError):
            calculate_burnout_score(
                "worker-score",
                "2026-04-26",
                "2026-04-26",
                [summary("worker-score", "2026-04-26", ingested_at="2026-04-26T12:00:00Z")],
            )

    def test_facial_fatigue_score_adjusts_burnout_score(self) -> None:
        base = calculate_burnout_score(
            "worker-score",
            "2026-04-26",
            "2026-04-26",
            [
                summary(
                    "worker-score",
                    "2026-04-26",
                    sleep_duration_hours=6.2,
                    sleep_quality_proxy=0.58,
                    step_count=5200,
                    resting_heart_rate_bpm=75,
                    heart_rate_variability_ms=41,
                    activity_minutes=20,
                    shift_count=2,
                    overtime_hours=1.5,
                    fatigue_rating=6,
                    stress_rating=6,
                    ingested_at="2026-04-26T12:00:00Z",
                )
            ],
        )
        adjusted = calculate_burnout_score(
            "worker-score",
            "2026-04-26",
            "2026-04-26",
            [
                summary(
                    "worker-score",
                    "2026-04-26",
                    sleep_duration_hours=6.2,
                    sleep_quality_proxy=0.58,
                    step_count=5200,
                    resting_heart_rate_bpm=75,
                    heart_rate_variability_ms=41,
                    activity_minutes=20,
                    shift_count=2,
                    overtime_hours=1.5,
                    fatigue_rating=6,
                    stress_rating=6,
                    ingested_at="2026-04-26T12:00:00Z",
                )
            ],
            facial_fatigue_score=92.0,
        )

        self.assertGreater(adjusted.burnout_score, base.burnout_score)
        self.assertTrue(any(item.metric == "facial_fatigue_score" for item in adjusted.contributors))

    def test_facial_only_fallback_scores_without_daily_metrics(self) -> None:
        result = calculate_burnout_score(
            "worker-score",
            "2026-04-26",
            "2026-04-26",
            summaries=[],
            facial_fatigue_score=72.0,
        )

        self.assertEqual(result.days_used, 0)
        self.assertEqual(result.risk_tier, "high")
        self.assertEqual(result.burnout_score, 72.0)


class BurnoutScoringApiTest(TestCase):
    def setUp(self) -> None:
        self.tempdir = tempfile.TemporaryDirectory()
        self.service = MetricsService(MetricsRepository(str(Path(self.tempdir.name) / "score.db")))

    def tearDown(self) -> None:
        self.tempdir.cleanup()

    def test_endpoint_scores_persisted_canonical_summaries(self) -> None:
        self.service.ingest_summaries(
            [
                DailyMetricSummary(
                    worker_id="worker-api-score",
                    local_date="2026-04-26",
                    source_platform="android_health_connect",
                    sleep_duration_hours=5.0,
                    sleep_quality_proxy=0.30,
                    step_count=2000,
                    resting_heart_rate_bpm=90,
                    heart_rate_variability_ms=20,
                    activity_minutes=5,
                    source_recorded_at="2026-04-26T20:00:00Z",
                ),
                DailyMetricSummary(
                    worker_id="worker-api-score",
                    local_date="2026-04-26",
                    source_platform="manual",
                    shift_count=3,
                    overtime_hours=5,
                    fatigue_rating=9,
                    stress_rating=9,
                    source_recorded_at="2026-04-26T21:00:00Z",
                ),
            ]
        )

        result = get_burnout_score(
            worker_id="worker-api-score",
            start_date="2026-04-26",
            end_date="2026-04-26",
            service=self.service,
        )

        self.assertEqual(result.risk_tier, "high")
        self.assertGreaterEqual(result.burnout_score, 65)
        self.assertEqual(result.days_used, 1)

    def test_endpoint_returns_422_when_no_scorable_data_exists(self) -> None:
        with self.assertRaises(HTTPException) as context:
            get_burnout_score(
                worker_id="missing-worker",
                start_date="2026-04-26",
                end_date="2026-04-26",
                service=self.service,
            )

        self.assertEqual(context.exception.status_code, 422)

    def test_query_param_facial_fatigue_score_adjusts_endpoint_result(self) -> None:
        self.service.ingest_summaries(
            [
                DailyMetricSummary(
                    worker_id="worker-api-adjust",
                    local_date="2026-04-26",
                    source_platform="manual",
                    shift_count=1,
                    overtime_hours=0.0,
                    fatigue_rating=4,
                    stress_rating=4,
                    source_recorded_at="2026-04-26T12:00:00Z",
                )
            ]
        )

        baseline = get_burnout_score(
            worker_id="worker-api-adjust",
            start_date="2026-04-26",
            end_date="2026-04-26",
            service=self.service,
        )
        adjusted = get_burnout_score(
            worker_id="worker-api-adjust",
            start_date="2026-04-26",
            end_date="2026-04-26",
            facial_fatigue_score=90.0,
            service=self.service,
        )

        self.assertGreater(adjusted.burnout_score, baseline.burnout_score)

    def test_photo_analysis_endpoint_returns_facial_and_burnout_scores(self) -> None:
        self.service.ingest_summaries(
            [
                DailyMetricSummary(
                    worker_id="worker-photo",
                    local_date="2026-04-26",
                    source_platform="manual",
                    shift_count=2,
                    overtime_hours=2,
                    fatigue_rating=6,
                    stress_rating=6,
                    source_recorded_at="2026-04-26T12:00:00Z",
                )
            ]
        )

        response = analyze_facial_fatigue_photo(
            request=PhotoScanRequest(
                worker_id="worker-photo",
                start_date="2026-04-26",
                end_date="2026-04-26",
                width=1920,
                height=1080,
                file_size_bytes=900_000,
            ),
            service=self.service,
        )

        self.assertIn(response.profile_used, ("low_risk", "moderate_risk", "high_risk"))
        self.assertGreaterEqual(response.facial_fatigue.score, 0)
        self.assertLessEqual(response.facial_fatigue.score, 100)
        self.assertEqual(response.burnout_score.worker_id, "worker-photo")


if __name__ == "__main__":
    main()
