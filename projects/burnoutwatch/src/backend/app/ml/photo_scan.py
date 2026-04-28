from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from ..scoring import BurnoutScoreResult


ScanProfile = Literal["low_risk", "moderate_risk", "high_risk"]


class PhotoScanRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    worker_id: str = Field(min_length=1)
    start_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    end_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    width: int = Field(ge=1)
    height: int = Field(ge=1)
    file_size_bytes: int | None = Field(default=None, ge=1)
    profile_hint: ScanProfile | None = None


class FacialFatigueApiResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    score: float = Field(ge=0, le=100)
    risk_tier: Literal["low", "moderate", "high"]
    confidence: float = Field(ge=0, le=1)
    explanation: list[str]
    signals: dict[str, float]
    raw_outputs: dict[str, dict[str, float]]


class PhotoScanAnalysisResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    profile_used: ScanProfile
    facial_fatigue: FacialFatigueApiResult
    burnout_score: BurnoutScoreResult


def infer_scan_profile(width: int, height: int, file_size_bytes: int | None = None) -> ScanProfile:
    pixels = width * height
    quality_points = 0

    if pixels >= 2_000_000:
        quality_points += 1
    if file_size_bytes is not None and file_size_bytes >= 800_000:
        quality_points += 1

    aspect_ratio = width / max(height, 1)
    if 0.6 <= aspect_ratio <= 1.4:
        quality_points += 1

    if quality_points >= 3:
        return "low_risk"
    if quality_points <= 1:
        return "high_risk"
    return "moderate_risk"


def map_facial_result_payload(result: Any) -> FacialFatigueApiResult:
    payload = result.as_dict()
    return FacialFatigueApiResult(
        score=payload["score"],
        risk_tier=payload["risk_tier"],
        confidence=payload["confidence"],
        explanation=payload["explanation"],
        signals=payload["signals"],
        raw_outputs=payload["raw_outputs"],
    )
