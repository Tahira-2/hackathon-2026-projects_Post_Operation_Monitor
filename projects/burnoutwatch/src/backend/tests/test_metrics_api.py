from __future__ import annotations

import sys
import tempfile
from pathlib import Path
from unittest import TestCase, main

from pydantic import ValidationError


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import get_daily_summaries, ingest_metrics
from app.metrics import DailyMetricSummary, MetricsIngestRequest, MetricsRepository, MetricsService


class MetricsApiContractTest(TestCase):
    def setUp(self) -> None:
        self.tempdir = tempfile.TemporaryDirectory()
        self.service = MetricsService(MetricsRepository(str(Path(self.tempdir.name) / "api.db")))

    def tearDown(self) -> None:
        self.tempdir.cleanup()

    def test_ingest_and_retrieve_canonical_summaries(self) -> None:
        request = MetricsIngestRequest(
            summaries=[
                DailyMetricSummary(
                    worker_id="worker-api",
                    local_date="2026-04-25",
                    source_platform="ios_healthkit",
                    permissions={
                        "sleep_duration_hours": "granted",
                        "step_count": "granted",
                    },
                    availability={
                        "sleep_duration_hours": "present",
                        "step_count": "present",
                    },
                    sleep_duration_hours=7.6,
                    step_count=10002,
                    source_recorded_at="2026-04-25T22:10:00Z",
                )
            ]
        )

        response = ingest_metrics(request, self.service)

        self.assertEqual(response.ingested_count, 1)
        self.assertEqual(response.summaries[0].field_sources["step_count"], "device")

        summaries = get_daily_summaries(
            worker_id="worker-api",
            start_date="2026-04-25",
            end_date="2026-04-25",
            service=self.service,
        )

        self.assertEqual(len(summaries), 1)
        self.assertEqual(summaries[0].sleep_duration_hours, 7.6)
        self.assertEqual(summaries[0].field_sources["step_count"], "device")

    def test_invalid_manual_proxy_value_is_rejected(self) -> None:
        with self.assertRaises(ValidationError):
            MetricsIngestRequest(
                summaries=[
                    DailyMetricSummary(
                        worker_id="worker-api",
                        local_date="2026-04-25",
                        source_platform="manual",
                        sleep_quality_proxy=0.8,
                    )
                ]
            )


if __name__ == "__main__":
    main()
