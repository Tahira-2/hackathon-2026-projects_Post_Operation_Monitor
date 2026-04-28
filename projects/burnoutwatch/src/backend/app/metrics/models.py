from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


HEALTH_METRICS = (
    "sleep_duration_hours",
    "sleep_quality_proxy",
    "step_count",
    "resting_heart_rate_bpm",
    "heart_rate_variability_ms",
    "activity_minutes",
    "workout_count",
)

MANUAL_ONLY_METRICS = (
    "sleep_quality_manual",
    "shift_count",
    "overtime_hours",
    "fatigue_rating",
    "stress_rating",
)

MANUAL_HEALTH_METRICS = ("sleep_duration_hours",)
ALL_METRICS = HEALTH_METRICS + MANUAL_ONLY_METRICS

PermissionStatus = Literal["granted", "denied", "unavailable"]
AvailabilityStatus = Literal["present", "missing", "unavailable"]
SourcePlatform = Literal["ios_healthkit", "android_health_connect", "manual"]
FieldSource = Literal["device", "manual"]


class MetricPermissions(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sleep_duration_hours: PermissionStatus = "unavailable"
    sleep_quality_proxy: PermissionStatus = "unavailable"
    step_count: PermissionStatus = "unavailable"
    resting_heart_rate_bpm: PermissionStatus = "unavailable"
    heart_rate_variability_ms: PermissionStatus = "unavailable"
    activity_minutes: PermissionStatus = "unavailable"
    workout_count: PermissionStatus = "unavailable"
    sleep_quality_manual: PermissionStatus = "unavailable"
    shift_count: PermissionStatus = "unavailable"
    overtime_hours: PermissionStatus = "unavailable"
    fatigue_rating: PermissionStatus = "unavailable"
    stress_rating: PermissionStatus = "unavailable"


class MetricAvailability(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sleep_duration_hours: AvailabilityStatus = "missing"
    sleep_quality_proxy: AvailabilityStatus = "missing"
    step_count: AvailabilityStatus = "missing"
    resting_heart_rate_bpm: AvailabilityStatus = "missing"
    heart_rate_variability_ms: AvailabilityStatus = "missing"
    activity_minutes: AvailabilityStatus = "missing"
    workout_count: AvailabilityStatus = "missing"
    sleep_quality_manual: AvailabilityStatus = "missing"
    shift_count: AvailabilityStatus = "missing"
    overtime_hours: AvailabilityStatus = "missing"
    fatigue_rating: AvailabilityStatus = "missing"
    stress_rating: AvailabilityStatus = "missing"


class ManualWorkInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sleep_duration_hours: float | None = Field(default=None, ge=0, le=24)
    sleep_quality_manual: int | None = Field(default=None, ge=1, le=5)
    shift_count: int | None = Field(default=None, ge=0)
    overtime_hours: float | None = Field(default=None, ge=0)
    fatigue_rating: int | None = Field(default=None, ge=1, le=10)
    stress_rating: int | None = Field(default=None, ge=1, le=10)


class DailyMetricSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    worker_id: str = Field(min_length=1)
    local_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    source_platform: SourcePlatform
    permissions: MetricPermissions = Field(default_factory=MetricPermissions)
    availability: MetricAvailability = Field(default_factory=MetricAvailability)
    sleep_duration_hours: float | None = Field(default=None, ge=0, le=24)
    sleep_quality_proxy: float | None = Field(default=None, ge=0, le=1)
    step_count: int | None = Field(default=None, ge=0)
    resting_heart_rate_bpm: float | None = Field(default=None, ge=0)
    heart_rate_variability_ms: float | None = Field(default=None, ge=0)
    activity_minutes: int | None = Field(default=None, ge=0)
    workout_count: int | None = Field(default=None, ge=0)
    sleep_quality_manual: int | None = Field(default=None, ge=1, le=5)
    shift_count: int | None = Field(default=None, ge=0)
    overtime_hours: float | None = Field(default=None, ge=0)
    fatigue_rating: int | None = Field(default=None, ge=1, le=10)
    stress_rating: int | None = Field(default=None, ge=1, le=10)
    field_sources: dict[str, FieldSource] = Field(default_factory=dict)
    source_recorded_at: str | None = None
    ingested_at: str | None = None
    last_device_sync_at: str | None = None
    last_manual_entry_at: str | None = None

    @field_validator("source_recorded_at", "ingested_at", "last_device_sync_at", "last_manual_entry_at")
    @classmethod
    def validate_datetime(cls, value: str | None) -> str | None:
        if value is None:
            return value
        datetime.fromisoformat(value.replace("Z", "+00:00"))
        return value

    @model_validator(mode="after")
    def validate_source_specific_fields(self) -> "DailyMetricSummary":
        if self.source_platform == "manual" and self.ingested_at is None:
            if self.sleep_quality_proxy is not None:
                raise ValueError("manual payloads cannot set sleep_quality_proxy")
        elif self.source_platform != "manual" and self.ingested_at is None:
            for metric in MANUAL_ONLY_METRICS:
                if metric == "sleep_quality_manual":
                    continue
                if getattr(self, metric) is not None:
                    raise ValueError(f"device payloads cannot set {metric}")
        return self


class MetricsIngestRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    summaries: list[DailyMetricSummary] = Field(min_length=1)


class MetricsIngestResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    ingested_count: int
    summaries: list[DailyMetricSummary]
