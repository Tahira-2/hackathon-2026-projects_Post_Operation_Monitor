from __future__ import annotations

import os
import sys
import tempfile
from pathlib import Path
from unittest import TestCase, main


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.metrics import DailyMetricSummary, MetricsRepository, MetricsService


class MetricsServiceTest(TestCase):
    def setUp(self) -> None:
        self.tempdir = tempfile.TemporaryDirectory()
        self.db_path = str(Path(self.tempdir.name) / "metrics.db")
        self.repository = MetricsRepository(self.db_path)
        self.service = MetricsService(self.repository)

    def tearDown(self) -> None:
        self.tempdir.cleanup()

    def test_device_ingest_persists_partial_summary(self) -> None:
        summaries = self.service.ingest_summaries(
            [
                DailyMetricSummary(
                    worker_id="worker-1",
                    local_date="2026-04-25",
                    source_platform="ios_healthkit",
                    permissions={
                        "sleep_duration_hours": "granted",
                        "sleep_quality_proxy": "denied",
                        "step_count": "granted",
                        "resting_heart_rate_bpm": "granted",
                        "heart_rate_variability_ms": "granted",
                        "activity_minutes": "granted",
                        "workout_count": "granted",
                        "sleep_quality_manual": "unavailable",
                        "shift_count": "unavailable",
                        "overtime_hours": "unavailable",
                        "fatigue_rating": "unavailable",
                        "stress_rating": "unavailable",
                    },
                    availability={
                        "sleep_duration_hours": "present",
                        "sleep_quality_proxy": "unavailable",
                        "step_count": "present",
                        "resting_heart_rate_bpm": "present",
                        "heart_rate_variability_ms": "missing",
                        "activity_minutes": "present",
                        "workout_count": "present",
                        "sleep_quality_manual": "missing",
                        "shift_count": "missing",
                        "overtime_hours": "missing",
                        "fatigue_rating": "missing",
                        "stress_rating": "missing",
                    },
                    sleep_duration_hours=7.2,
                    step_count=8540,
                    resting_heart_rate_bpm=57,
                    activity_minutes=42,
                    workout_count=1,
                    source_recorded_at="2026-04-25T20:00:00Z",
                )
            ]
        )

        self.assertEqual(len(summaries), 1)
        summary = summaries[0]
        self.assertEqual(summary.sleep_duration_hours, 7.2)
        self.assertEqual(summary.step_count, 8540)
        self.assertIsNone(summary.heart_rate_variability_ms)
        self.assertEqual(summary.field_sources["sleep_duration_hours"], "device")

    def test_manual_health_fills_only_null_device_fields(self) -> None:
        self.service.ingest_summaries(
            [
                DailyMetricSummary(
                    worker_id="worker-2",
                    local_date="2026-04-25",
                    source_platform="android_health_connect",
                    permissions={"sleep_duration_hours": "granted"},
                    availability={"sleep_duration_hours": "present"},
                    sleep_duration_hours=6.1,
                    step_count=None,
                    source_recorded_at="2026-04-25T18:00:00Z",
                )
            ]
        )

        merged = self.service.ingest_summaries(
            [
                DailyMetricSummary(
                    worker_id="worker-2",
                    local_date="2026-04-25",
                    source_platform="manual",
                    permissions={
                        "sleep_duration_hours": "granted",
                        "sleep_quality_manual": "granted",
                        "shift_count": "granted",
                        "overtime_hours": "granted",
                        "fatigue_rating": "granted",
                        "stress_rating": "granted",
                    },
                    availability={
                        "sleep_duration_hours": "present",
                        "sleep_quality_manual": "present",
                        "shift_count": "present",
                        "overtime_hours": "present",
                        "fatigue_rating": "present",
                        "stress_rating": "present",
                    },
                    sleep_duration_hours=8.0,
                    sleep_quality_manual=4,
                    shift_count=2,
                    overtime_hours=1.5,
                    fatigue_rating=7,
                    stress_rating=6,
                    source_recorded_at="2026-04-25T21:00:00Z",
                )
            ]
        )[0]

        self.assertEqual(merged.sleep_duration_hours, 6.1)
        self.assertEqual(merged.field_sources["sleep_duration_hours"], "device")
        self.assertEqual(merged.shift_count, 2)
        self.assertEqual(merged.field_sources["shift_count"], "manual")
        self.assertEqual(merged.sleep_quality_manual, 4)

    def test_repeated_device_sync_replaces_authoritative_health_values(self) -> None:
        self.service.ingest_summaries(
            [
                DailyMetricSummary(
                    worker_id="worker-3",
                    local_date="2026-04-24",
                    source_platform="ios_healthkit",
                    permissions={"step_count": "granted"},
                    availability={"step_count": "present"},
                    step_count=3000,
                    source_recorded_at="2026-04-24T10:00:00Z",
                )
            ]
        )

        merged = self.service.ingest_summaries(
            [
                DailyMetricSummary(
                    worker_id="worker-3",
                    local_date="2026-04-24",
                    source_platform="ios_healthkit",
                    permissions={"step_count": "granted"},
                    availability={"step_count": "present"},
                    step_count=9100,
                    source_recorded_at="2026-04-24T22:00:00Z",
                )
            ]
        )[0]

        self.assertEqual(merged.step_count, 9100)
        self.assertEqual(merged.last_device_sync_at, "2026-04-24T22:00:00Z")

    def test_list_daily_summaries_filters_by_worker_and_date(self) -> None:
        self.service.ingest_summaries(
            [
                DailyMetricSummary(
                    worker_id="worker-4",
                    local_date="2026-04-20",
                    source_platform="manual",
                    shift_count=1,
                ),
                DailyMetricSummary(
                    worker_id="worker-4",
                    local_date="2026-04-21",
                    source_platform="manual",
                    shift_count=2,
                ),
                DailyMetricSummary(
                    worker_id="worker-9",
                    local_date="2026-04-21",
                    source_platform="manual",
                    shift_count=9,
                ),
            ]
        )

        summaries = self.service.list_daily_summaries("worker-4", "2026-04-21", "2026-04-22")

        self.assertEqual(len(summaries), 1)
        self.assertEqual(summaries[0].shift_count, 2)


if __name__ == "__main__":
    main()
