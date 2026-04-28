from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


RiskTier = Literal["low", "moderate", "high"]
DataCompleteness = Literal["complete", "partial", "limited"]
ContributorDirection = Literal["risk_increasing", "risk_decreasing", "neutral"]
RecommendationCategory = Literal["recovery", "workload", "support", "reflection", "activity"]
RecommendationPriority = Literal["low", "medium", "high"]


class RecommendationContributor(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1)
    value: float | int | str | None = None
    direction: ContributorDirection = "neutral"
    explanation: str = Field(min_length=1)


class FacialFatigueSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    score: float = Field(ge=0, le=100)
    risk_tier: RiskTier
    confidence: float = Field(ge=0, le=1)
    explanation: list[str] = Field(default_factory=list)


class RecommendationContext(BaseModel):
    model_config = ConfigDict(extra="forbid")

    worker_id: str = Field(min_length=1)
    local_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    burnout_score: float = Field(ge=0, le=100)
    risk_tier: RiskTier
    confidence: float = Field(ge=0, le=1)
    data_completeness: DataCompleteness = "partial"
    top_contributors: list[RecommendationContributor] = Field(default_factory=list, max_length=6)
    daily_metrics: dict[str, float | int | str | None] = Field(default_factory=dict)
    facial_fatigue: FacialFatigueSummary | None = None


class RecommendationCard(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=80)
    detail: str = Field(min_length=1, max_length=280)
    category: RecommendationCategory
    priority: RecommendationPriority


class LLMRecommendationPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    summary: str = Field(min_length=1, max_length=240)
    recommendations: list[RecommendationCard] = Field(min_length=1, max_length=4)
    safety_note: str = Field(min_length=1, max_length=200)


class RecommendationResult(LLMRecommendationPayload):
    worker_id: str = Field(min_length=1)
    local_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    risk_tier: RiskTier
    generated_by: str = Field(min_length=1)
    generated_at: str

    @field_validator("generated_at")
    @classmethod
    def validate_generated_at(cls, value: str) -> str:
        from datetime import datetime

        datetime.fromisoformat(value.replace("Z", "+00:00"))
        return value


def public_context_payload(context: RecommendationContext) -> dict[str, Any]:
    return context.model_dump(exclude_none=True)
