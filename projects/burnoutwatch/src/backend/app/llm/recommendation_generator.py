from __future__ import annotations

from datetime import datetime, timezone

from .llm_client import MockRuleBasedClient, RecommendationClient
from .models import RecommendationContext, RecommendationResult
from .safety_filters import apply_safety_filters


class RecommendationService:
    def __init__(
        self,
        primary_client: RecommendationClient,
        fallback_client: RecommendationClient | None = None,
    ) -> None:
        self.primary_client = primary_client
        self.fallback_client = fallback_client or MockRuleBasedClient()

    def generate(self, context: RecommendationContext) -> RecommendationResult:
        generated_by = self.primary_client.provider_name
        try:
            payload = self.primary_client.generate(context)
        except Exception:
            payload = self.fallback_client.generate(context)
            generated_by = self.fallback_client.provider_name

        payload = apply_safety_filters(payload)
        return RecommendationResult(
            worker_id=context.worker_id,
            local_date=context.local_date,
            risk_tier=context.risk_tier,
            summary=payload.summary,
            recommendations=payload.recommendations,
            safety_note=payload.safety_note,
            generated_by=generated_by,
            generated_at=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        )

