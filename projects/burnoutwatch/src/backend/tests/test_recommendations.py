from __future__ import annotations

import sys
from pathlib import Path
from unittest import TestCase, main


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.llm import RecommendationContext, RecommendationService
from app.llm.llm_client import HuggingFaceClient, MockRuleBasedClient
from app.main import generate_recommendations


def sample_context(risk_tier: str = "high") -> RecommendationContext:
    return RecommendationContext(
        worker_id="worker-demo",
        local_date="2026-04-26",
        burnout_score=72.4,
        risk_tier=risk_tier,
        confidence=0.82,
        data_completeness="partial",
        top_contributors=[
            {
                "name": "sleep_duration_hours",
                "value": 4.8,
                "direction": "risk_increasing",
                "explanation": "Sleep was below the recovery target.",
            },
            {
                "name": "overtime_hours",
                "value": 3.5,
                "direction": "risk_increasing",
                "explanation": "Overtime increased workload strain.",
            },
        ],
        daily_metrics={
            "sleep_duration_hours": 4.8,
            "overtime_hours": 3.5,
            "stress_rating": 7,
        },
    )


class RecommendationServiceTest(TestCase):
    def test_mock_provider_returns_stable_high_risk_recommendations(self) -> None:
        service = RecommendationService(MockRuleBasedClient())

        result = service.generate(sample_context())

        self.assertEqual(result.worker_id, "worker-demo")
        self.assertEqual(result.risk_tier, "high")
        self.assertEqual(result.generated_by, "mock")
        self.assertGreaterEqual(len(result.recommendations), 2)
        self.assertIn("wellness recommendation", result.safety_note.lower())

    def test_api_function_returns_recommendation_result(self) -> None:
        service = RecommendationService(MockRuleBasedClient())

        result = generate_recommendations(sample_context("moderate"), service)

        self.assertEqual(result.risk_tier, "moderate")
        self.assertEqual(result.generated_by, "mock")

    def test_hugging_face_provider_falls_back_without_token(self) -> None:
        primary = HuggingFaceClient(
            api_token=None,
            model="google/gemma-2-2b-it",
            api_base_url="https://api-inference.huggingface.co",
            timeout_seconds=0.1,
        )
        service = RecommendationService(primary_client=primary, fallback_client=MockRuleBasedClient())

        result = service.generate(sample_context())

        self.assertEqual(result.generated_by, "mock")
        self.assertEqual(result.risk_tier, "high")


if __name__ == "__main__":
    main()
