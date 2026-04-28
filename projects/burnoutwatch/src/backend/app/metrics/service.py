from __future__ import annotations

from .merge import merge_summary, public_summary_payload
from .models import DailyMetricSummary
from .repository import MetricsRepository


class MetricsService:
    def __init__(self, repository: MetricsRepository) -> None:
        self.repository = repository

    def ingest_summaries(self, summaries: list[DailyMetricSummary]) -> list[DailyMetricSummary]:
        canonical_summaries: list[DailyMetricSummary] = []

        for summary in summaries:
            existing = self.repository.get_summary(summary.worker_id, summary.local_date)
            merged = merge_summary(existing, summary)
            self.repository.upsert_summary(merged)
            canonical_summaries.append(DailyMetricSummary.model_validate(public_summary_payload(merged)))

        return canonical_summaries

    def list_daily_summaries(
        self,
        worker_id: str,
        start_date: str,
        end_date: str,
    ) -> list[DailyMetricSummary]:
        summaries = self.repository.list_summaries(worker_id, start_date, end_date)
        return [DailyMetricSummary.model_validate(public_summary_payload(summary)) for summary in summaries]
