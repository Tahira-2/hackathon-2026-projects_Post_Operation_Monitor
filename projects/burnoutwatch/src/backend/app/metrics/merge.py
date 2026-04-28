from __future__ import annotations

from copy import deepcopy
from datetime import UTC, datetime
from typing import Any

from .models import ALL_METRICS, HEALTH_METRICS, MANUAL_ONLY_METRICS, DailyMetricSummary


def utc_now_iso() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


def empty_permissions() -> dict[str, str]:
    return {metric: "unavailable" for metric in ALL_METRICS}


def empty_availability() -> dict[str, str]:
    return {metric: "missing" for metric in ALL_METRICS}


def build_empty_summary(worker_id: str, local_date: str) -> dict[str, Any]:
    return {
        "worker_id": worker_id,
        "local_date": local_date,
        "source_platform": "manual",
        "permissions": empty_permissions(),
        "availability": empty_availability(),
        "field_sources": {},
        "source_recorded_at": None,
        "ingested_at": None,
        "last_device_sync_at": None,
        "last_manual_entry_at": None,
        "device_metrics": {metric: None for metric in HEALTH_METRICS},
        "manual_metrics": {metric: None for metric in MANUAL_ONLY_METRICS + ("sleep_duration_hours",)},
    }


def _copy_metric_state(summary: DailyMetricSummary) -> tuple[dict[str, Any], dict[str, str], dict[str, str]]:
    metric_values = {metric: getattr(summary, metric) for metric in ALL_METRICS}
    permissions = summary.permissions.model_dump()
    availability = summary.availability.model_dump()
    return metric_values, permissions, availability


def merge_summary(existing: dict[str, Any] | None, incoming: DailyMetricSummary) -> dict[str, Any]:
    state = deepcopy(existing) if existing is not None else build_empty_summary(incoming.worker_id, incoming.local_date)
    metric_values, permissions, availability = _copy_metric_state(incoming)
    now = incoming.ingested_at or utc_now_iso()

    if incoming.source_platform == "manual":
        for metric in MANUAL_ONLY_METRICS + ("sleep_duration_hours",):
            if metric_values[metric] is not None:
                state["manual_metrics"][metric] = metric_values[metric]
            state["permissions"][metric] = permissions[metric]
            state["availability"][metric] = availability[metric]
        state["last_manual_entry_at"] = incoming.source_recorded_at or now
    else:
        for metric in HEALTH_METRICS:
            state["device_metrics"][metric] = metric_values[metric]
            state["permissions"][metric] = permissions[metric]
            state["availability"][metric] = availability[metric]
        state["source_platform"] = incoming.source_platform
        state["last_device_sync_at"] = incoming.source_recorded_at or now

    merged_metrics: dict[str, Any] = {}
    field_sources: dict[str, str] = {}

    for metric in HEALTH_METRICS:
        device_value = state["device_metrics"].get(metric)
        manual_value = state["manual_metrics"].get(metric)
        if device_value is not None:
            merged_metrics[metric] = device_value
            field_sources[metric] = "device"
        elif manual_value is not None:
            merged_metrics[metric] = manual_value
            field_sources[metric] = "manual"
        else:
            merged_metrics[metric] = None

    for metric in MANUAL_ONLY_METRICS:
        manual_value = state["manual_metrics"].get(metric)
        merged_metrics[metric] = manual_value
        if manual_value is not None:
            field_sources[metric] = "manual"

    state.update(merged_metrics)
    state["field_sources"] = field_sources
    state["ingested_at"] = now
    state["source_recorded_at"] = incoming.source_recorded_at or now
    return state


def public_summary_payload(summary: dict[str, Any]) -> dict[str, Any]:
    public_summary = deepcopy(summary)
    public_summary.pop("device_metrics", None)
    public_summary.pop("manual_metrics", None)
    return public_summary
