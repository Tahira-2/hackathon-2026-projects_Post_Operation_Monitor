from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from ..metrics import DailyMetricSummary

from .models import BurnoutScoreResult, RiskTier, ScoreContributor


LOW_RISK_MAX_SCORE = 35.0
HIGH_RISK_MIN_SCORE = 65.0

CATEGORY_WEIGHTS = {
    "recovery": 0.35,
    "workload": 0.25,
    "physiological": 0.20,
    "self_report": 0.20,
}


class NoScorableDataError(ValueError):
    pass


@dataclass(frozen=True)
class MetricRisk:
    metric: str
    risk: float
    weight: float
    explanation: str


@dataclass(frozen=True)
class CategoryScore:
    score: float
    coverage: float
    metrics: list[MetricRisk]


def _clamp(value: float, lower: float = 0.0, upper: float = 100.0) -> float:
    return max(lower, min(upper, value))


def _risk_tier(score: float) -> RiskTier:
    if score < LOW_RISK_MAX_SCORE:
        return "low"
    if score < HIGH_RISK_MIN_SCORE:
        return "moderate"
    return "high"


def _sleep_duration_risk(hours: float | None) -> float | None:
    if hours is None:
        return None
    if 7.0 <= hours <= 9.0:
        return 0.0
    if hours < 7.0:
        return _clamp(((7.0 - hours) / 2.0) * 100.0)
    return _clamp(((hours - 9.0) / 3.0) * 50.0)


def _sleep_quality_proxy_risk(value: float | None) -> float | None:
    if value is None:
        return None
    return _clamp((1.0 - value) * 100.0)


def _sleep_quality_manual_risk(value: int | None) -> float | None:
    if value is None:
        return None
    return _clamp(((5.0 - value) / 4.0) * 100.0)


def _shift_count_risk(value: int | None) -> float | None:
    if value is None:
        return None
    if value <= 1:
        return 0.0
    if value == 2:
        return 45.0
    return _clamp(45.0 + (value - 2.0) * 35.0)


def _overtime_risk(hours: float | None) -> float | None:
    if hours is None:
        return None
    return _clamp((hours / 4.0) * 100.0)


def _activity_minutes_risk(minutes: int | None) -> float | None:
    if minutes is None:
        return None
    if minutes >= 30:
        return 0.0
    return _clamp(((30.0 - minutes) / 30.0) * 40.0)


def _resting_heart_rate_risk(value: float | None) -> float | None:
    if value is None:
        return None
    if value <= 65.0:
        return 0.0
    return _clamp(((value - 65.0) / 25.0) * 100.0)


def _hrv_risk(value: float | None) -> float | None:
    if value is None:
        return None
    if value >= 60.0:
        return 0.0
    if value <= 25.0:
        return 100.0
    return _clamp(((60.0 - value) / 35.0) * 100.0)


def _step_count_risk(value: int | None) -> float | None:
    if value is None:
        return None
    if value >= 7000:
        return 0.0
    if value <= 2500:
        return 60.0
    return _clamp(((7000.0 - value) / 4500.0) * 60.0)


def _rating_risk(value: int | None) -> float | None:
    if value is None:
        return None
    return _clamp(((value - 1.0) / 9.0) * 100.0)


def _category_score(metric_risks: list[MetricRisk]) -> CategoryScore | None:
    present = [metric for metric in metric_risks if metric.risk is not None]
    if not present:
        return None

    present_weight = sum(metric.weight for metric in present)
    weighted_score = sum(metric.risk * metric.weight for metric in present) / present_weight
    total_weight = sum(metric.weight for metric in metric_risks)
    return CategoryScore(
        score=weighted_score,
        coverage=present_weight / total_weight,
        metrics=present,
    )


def _metric(
    summary: DailyMetricSummary,
    metric: str,
    weight: float,
    risk_fn: Callable,
    explanation: str,
) -> MetricRisk:
    return MetricRisk(
        metric=metric,
        risk=risk_fn(getattr(summary, metric)),
        weight=weight,
        explanation=explanation,
    )


def _daily_categories(summary: DailyMetricSummary) -> dict[str, CategoryScore]:
    sleep_quality_metric = (
        MetricRisk(
            metric="sleep_quality_proxy",
            risk=_sleep_quality_proxy_risk(summary.sleep_quality_proxy),
            weight=0.45,
            explanation="Sleep-stage quality was below the target recovery range.",
        )
        if summary.sleep_quality_proxy is not None
        else MetricRisk(
            metric="sleep_quality_manual",
            risk=_sleep_quality_manual_risk(summary.sleep_quality_manual),
            weight=0.45,
            explanation="Manual sleep quality was below the target recovery range.",
        )
    )

    category_inputs = {
        "recovery": [
            _metric(
                summary,
                "sleep_duration_hours",
                0.55,
                _sleep_duration_risk,
                "Sleep duration was outside the target recovery range.",
            ),
            sleep_quality_metric,
        ],
        "workload": [
            _metric(
                summary,
                "shift_count",
                0.45,
                _shift_count_risk,
                "Multiple shifts increased workload pressure.",
            ),
            _metric(
                summary,
                "overtime_hours",
                0.40,
                _overtime_risk,
                "Overtime hours increased workload pressure.",
            ),
            _metric(
                summary,
                "activity_minutes",
                0.15,
                _activity_minutes_risk,
                "Low activity minutes modestly increased recovery risk.",
            ),
        ],
        "physiological": [
            _metric(
                summary,
                "resting_heart_rate_bpm",
                0.40,
                _resting_heart_rate_risk,
                "Resting heart rate was elevated.",
            ),
            _metric(
                summary,
                "heart_rate_variability_ms",
                0.40,
                _hrv_risk,
                "Heart-rate variability was below the target recovery range.",
            ),
            _metric(
                summary,
                "step_count",
                0.20,
                _step_count_risk,
                "Step count was below the target activity baseline.",
            ),
        ],
        "self_report": [
            _metric(
                summary,
                "fatigue_rating",
                0.50,
                _rating_risk,
                "Self-reported fatigue was elevated.",
            ),
            _metric(
                summary,
                "stress_rating",
                0.50,
                _rating_risk,
                "Self-reported stress was elevated.",
            ),
        ],
    }

    categories: dict[str, CategoryScore] = {}
    for name, metrics in category_inputs.items():
        score = _category_score(metrics)
        if score is not None:
            categories[name] = score
    return categories


def calculate_burnout_score(
    worker_id: str,
    start_date: str,
    end_date: str,
    summaries: list[DailyMetricSummary],
    facial_fatigue_score: float | None = None,
) -> BurnoutScoreResult:
    candidate_summaries = [
        summary
        for summary in sorted(summaries, key=lambda item: item.local_date, reverse=True)
        if summary.worker_id == worker_id and start_date <= summary.local_date <= end_date
    ]

    weighted_score_total = 0.0
    weighted_confidence_total = 0.0
    total_day_weight = 0.0
    contributor_totals: dict[str, tuple[float, str]] = {}
    days_used = 0

    for index, summary in enumerate(candidate_summaries):
        categories = _daily_categories(summary)
        if not categories:
            continue

        available_category_weight = sum(CATEGORY_WEIGHTS[name] for name in categories)
        if available_category_weight <= 0:
            continue

        day_score = 0.0
        day_confidence = 0.0
        day_weight = 0.9**index

        for name, category in categories.items():
            base_weight = CATEGORY_WEIGHTS[name]
            adjusted_category_weight = base_weight / available_category_weight
            day_score += category.score * adjusted_category_weight
            day_confidence += base_weight * category.coverage

            present_weight = sum(metric.weight for metric in category.metrics)
            for metric in category.metrics:
                contribution = (
                    metric.risk
                    * adjusted_category_weight
                    * (metric.weight / present_weight)
                    * day_weight
                )
                current_total, explanation = contributor_totals.get(metric.metric, (0.0, metric.explanation))
                contributor_totals[metric.metric] = (current_total + contribution, explanation)

        weighted_score_total += day_score * day_weight
        weighted_confidence_total += day_confidence * day_weight
        total_day_weight += day_weight
        days_used += 1

    if days_used == 0 or total_day_weight == 0:
        if facial_fatigue_score is None:
            raise NoScorableDataError("No usable burnout scoring inputs exist for the requested date range.")
        facial_only_score = round(_clamp(facial_fatigue_score), 2)
        return BurnoutScoreResult(
            worker_id=worker_id,
            start_date=start_date,
            end_date=end_date,
            days_used=0,
            burnout_score=facial_only_score,
            risk_tier=_risk_tier(facial_only_score),
            confidence=0.2,
            contributors=[
                ScoreContributor(
                    metric="facial_fatigue_score",
                    contribution=round(facial_only_score, 2),
                    explanation="Facial fatigue scan score from camera check-in.",
                )
            ],
        )

    burnout_score = round(_clamp(weighted_score_total / total_day_weight), 2)
    confidence = round(max(0.0, min(1.0, weighted_confidence_total / total_day_weight)), 4)
    contributors = [
        ScoreContributor(
            metric=metric,
            contribution=round(value / total_day_weight, 2),
            explanation=explanation,
        )
        for metric, (value, explanation) in contributor_totals.items()
        if value > 0
    ]
    contributors.sort(key=lambda item: item.contribution, reverse=True)

    if facial_fatigue_score is not None:
        clamped_facial_score = _clamp(facial_fatigue_score)
        burnout_score = round(_clamp((burnout_score * 0.85) + (clamped_facial_score * 0.15)), 2)
        contributors.append(
            ScoreContributor(
                metric="facial_fatigue_score",
                contribution=round(clamped_facial_score * 0.15, 2),
                explanation="Facial fatigue scan score from camera check-in.",
            )
        )
        contributors.sort(key=lambda item: item.contribution, reverse=True)

    return BurnoutScoreResult(
        worker_id=worker_id,
        start_date=start_date,
        end_date=end_date,
        days_used=days_used,
        burnout_score=burnout_score,
        risk_tier=_risk_tier(burnout_score),
        confidence=confidence,
        contributors=contributors[:5],
    )
