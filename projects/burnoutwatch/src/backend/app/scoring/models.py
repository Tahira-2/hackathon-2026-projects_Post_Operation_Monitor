from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


RiskTier = Literal["low", "moderate", "high"]
ContributorDirection = Literal["risk_increasing", "risk_reducing"]


class ScoreContributor(BaseModel):
    model_config = ConfigDict(extra="forbid")

    metric: str
    direction: ContributorDirection = "risk_increasing"
    contribution: float = Field(ge=0, le=100)
    explanation: str


class BurnoutScoreResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    worker_id: str = Field(min_length=1)
    start_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    end_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    days_used: int = Field(ge=0)
    burnout_score: float = Field(ge=0, le=100)
    risk_tier: RiskTier
    confidence: float = Field(ge=0, le=1)
    contributors: list[ScoreContributor]
