from __future__ import annotations

import json
from typing import Protocol
from urllib import error, request

from pydantic import ValidationError

from .models import LLMRecommendationPayload, RecommendationCard, RecommendationContext
from .prompt_templates import build_recommendation_prompt


class RecommendationClient(Protocol):
    provider_name: str

    def generate(self, context: RecommendationContext) -> LLMRecommendationPayload:
        ...


class MockRuleBasedClient:
    provider_name = "mock"

    def generate(self, context: RecommendationContext) -> LLMRecommendationPayload:
        contributors = context.top_contributors[:2]
        contributor_text = ", ".join(contributor.explanation for contributor in contributors)
        if not contributor_text:
            contributor_text = "the available work and recovery signals"

        completeness_note = ""
        if context.data_completeness in {"partial", "limited"}:
            completeness_note = f" This uses {context.data_completeness} data, so treat it as a check-in rather than a complete picture."

        summaries = {
            "low": "Your current burnout risk is low based on the available signals.",
            "moderate": "Your current burnout risk is moderate, with a few signals worth watching.",
            "high": "Your current burnout risk is high based on elevated strain and reduced recovery signals.",
        }
        summary = f"{summaries[context.risk_tier]} Key contributors include {contributor_text}.{completeness_note}"
        summary = summary[:237].rstrip() + "..." if len(summary) > 240 else summary

        recommendations = {
            "low": [
                RecommendationCard(
                    title="Keep the recovery routine steady",
                    detail="Protect the habits that are helping today, especially sleep, hydration, and a short reset between shifts.",
                    category="recovery",
                    priority="low",
                ),
                RecommendationCard(
                    title="Log one quick reflection",
                    detail="Note what made today manageable so the team can repeat it during busier shifts.",
                    category="reflection",
                    priority="low",
                ),
            ],
            "moderate": [
                RecommendationCard(
                    title="Plan a recovery block",
                    detail="If possible, reserve a protected rest window before the next shift and avoid optional extra workload today.",
                    category="recovery",
                    priority="medium",
                ),
                RecommendationCard(
                    title="Reduce one workload pressure",
                    detail="Choose one non-urgent task to defer, delegate, or batch so the shift has fewer context switches.",
                    category="workload",
                    priority="medium",
                ),
            ],
            "high": [
                RecommendationCard(
                    title="Prioritize recovery before the next shift",
                    detail="If possible, protect a longer sleep window and avoid taking extra overtime today.",
                    category="recovery",
                    priority="high",
                ),
                RecommendationCard(
                    title="Use a support checkpoint",
                    detail="Consider checking in with a supervisor or peer support resource if this pattern continues.",
                    category="support",
                    priority="medium",
                ),
            ],
        }

        return LLMRecommendationPayload(
            summary=summary,
            recommendations=recommendations[context.risk_tier],
            safety_note="This is a wellness recommendation, not a medical diagnosis.",
        )


class HuggingFaceClient:
    provider_name = "huggingface"

    def __init__(
        self,
        api_token: str | None,
        model: str,
        api_base_url: str,
        timeout_seconds: float,
    ) -> None:
        self.api_token = api_token
        self.model = model
        self.api_base_url = api_base_url.rstrip("/")
        self.timeout_seconds = timeout_seconds

    def generate(self, context: RecommendationContext) -> LLMRecommendationPayload:
        if not self.api_token:
            raise RuntimeError("HF_API_TOKEN is required for the Hugging Face provider")

        body = {
            "inputs": build_recommendation_prompt(context),
            "parameters": {
                "max_new_tokens": 420,
                "temperature": 0.2,
                "return_full_text": False,
            },
            "options": {
                "wait_for_model": True,
                "use_cache": False,
            },
        }
        payload = json.dumps(body).encode("utf-8")
        url = f"{self.api_base_url}/models/{self.model}"
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }

        req = request.Request(url, data=payload, headers=headers, method="POST")
        try:
            with request.urlopen(req, timeout=self.timeout_seconds) as response:
                response_payload = json.loads(response.read().decode("utf-8"))
        except (TimeoutError, error.URLError, error.HTTPError, json.JSONDecodeError) as exc:
            raise RuntimeError("Hugging Face recommendation request failed") from exc

        generated_text = self._extract_generated_text(response_payload)
        return self._parse_payload(generated_text)

    def _extract_generated_text(self, response_payload: object) -> str:
        if isinstance(response_payload, list) and response_payload:
            first_item = response_payload[0]
            if isinstance(first_item, dict) and isinstance(first_item.get("generated_text"), str):
                return first_item["generated_text"]

        if isinstance(response_payload, dict):
            if isinstance(response_payload.get("generated_text"), str):
                return response_payload["generated_text"]
            if isinstance(response_payload.get("error"), str):
                raise RuntimeError(response_payload["error"])

        raise RuntimeError("Hugging Face returned an unsupported response shape")

    def _parse_payload(self, generated_text: str) -> LLMRecommendationPayload:
        json_text = self._extract_json_object(generated_text)
        try:
            raw_payload = json.loads(json_text)
            return LLMRecommendationPayload.model_validate(raw_payload)
        except (json.JSONDecodeError, ValidationError) as exc:
            raise RuntimeError("Hugging Face returned invalid recommendation JSON") from exc

    def _extract_json_object(self, generated_text: str) -> str:
        start = generated_text.find("{")
        end = generated_text.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise RuntimeError("Hugging Face response did not include JSON")
        return generated_text[start : end + 1]

