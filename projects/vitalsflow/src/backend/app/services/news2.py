from app.schemas.triage import News2Response, News2Result, News2Subscores
from app.utils.fhir import Vitals

PARAM_LABELS = {
    "respiratory_rate": "respiratory rate",
    "spo2": "oxygen saturation",
    "supplemental_o2": "supplemental oxygen",
    "systolic_bp": "systolic blood pressure",
    "heart_rate": "heart rate",
    "consciousness": "consciousness",
    "temperature": "temperature",
}

RISK_ACTIONS = {
    "low": ["Routine monitoring, reassess every 12h"],
    "low_medium": [
        "Increase monitoring frequency to every 4-6h",
        "Inform responsible clinician",
    ],
    "medium": [
        "Urgent clinician review within 1h",
        "Consider step-up care",
    ],
    "high": [
        "Emergency assessment by clinical team",
        "Consider ICU referral",
    ],
    "critical": [
        "Immediate emergency response",
        "Continuous monitoring",
        "Consider ICU or resuscitation",
    ],
    "insufficient_data": ["Provide additional vital signs to calculate NEWS2."],
}


def calculate_news2(vitals: Vitals) -> News2Response:
    subscores = News2Subscores(
        respiratory_rate=_score_respiratory_rate(vitals.respiratory_rate),
        spo2=_score_spo2(vitals.spo2, vitals.hypercapnic_rf, vitals.supplemental_o2),
        supplemental_o2=_score_supplemental_o2(vitals.supplemental_o2),
        systolic_bp=_score_systolic_bp(vitals.systolic_bp),
        heart_rate=_score_heart_rate(vitals.heart_rate),
        consciousness=_score_consciousness(vitals.consciousness),
        temperature=_score_temperature(vitals.temperature),
    )

    missing = _missing_parameters(vitals)
    present_count = 7 - len(missing)
    spo2_scale_used = _spo2_scale_used(vitals)

    if present_count < 4:
        return News2Response(
            news2=News2Result(
                score=None,
                risk="insufficient_data",
                subscores=subscores,
                spo2_scale_used=spo2_scale_used,
                missing_parameters=missing,
                reason="Insufficient parameters to calculate NEWS2 score.",
                actions=RISK_ACTIONS["insufficient_data"],
                data_confidence="insufficient",
            )
        )

    total_score = sum(
        value for value in subscores.model_dump().values() if value is not None
    )
    risk = _risk_from_score(total_score, subscores)
    reason = _build_reason(total_score, risk, subscores)
    data_confidence = "complete" if not missing else "partial"

    return News2Response(
        news2=News2Result(
            score=total_score,
            risk=risk,
            subscores=subscores,
            spo2_scale_used=spo2_scale_used,
            missing_parameters=missing,
            reason=reason,
            actions=RISK_ACTIONS[risk],
            data_confidence=data_confidence,
        )
    )


def _missing_parameters(vitals: Vitals) -> list[str]:
    missing = []
    if vitals.respiratory_rate is None:
        missing.append("respiratory_rate")
    if vitals.spo2 is None:
        missing.append("spo2")
    if vitals.supplemental_o2 is None:
        missing.append("supplemental_o2")
    if vitals.systolic_bp is None:
        missing.append("systolic_bp")
    if vitals.heart_rate is None:
        missing.append("heart_rate")
    if vitals.consciousness is None:
        missing.append("consciousness")
    if vitals.temperature is None:
        missing.append("temperature")
    return missing


def _spo2_scale_used(vitals: Vitals) -> int | None:
    if vitals.spo2 is None:
        return None
    return 2 if vitals.hypercapnic_rf else 1


def _risk_from_score(total_score: int, subscores: News2Subscores) -> str:
    if total_score >= 7:
        return "critical"
    if total_score >= 5:
        return "high"
    has_three = any(
        value == 3 for value in subscores.model_dump().values() if value is not None
    )
    if 3 <= total_score <= 4 and has_three:
        return "medium"
    if total_score >= 1:
        return "low_medium"
    return "low"


def _build_reason(total_score: int, risk: str, subscores: News2Subscores) -> str:
    contributors = _top_contributors(subscores)
    if contributors == "no abnormal parameters":
        return f"Score {total_score} with no abnormal parameters results in {risk} risk."
    return f"Score {total_score} driven by {contributors} results in {risk} risk."


def _top_contributors(subscores: News2Subscores) -> str:
    items = [
        (name, value)
        for name, value in subscores.model_dump().items()
        if value is not None and value > 0
    ]
    if not items:
        return "no abnormal parameters"
    items.sort(key=lambda item: item[1], reverse=True)
    labels = [PARAM_LABELS[item[0]] for item in items[:2]]
    return ", ".join(labels)


def _score_respiratory_rate(value: float | None) -> int | None:
    if value is None:
        return None
    if value <= 8:
        return 3
    if value <= 11:
        return 1
    if value <= 20:
        return 0
    if value <= 24:
        return 2
    return 3


def _score_spo2(
    value: float | None,
    hypercapnic_rf: bool,
    supplemental_o2: bool | None,
) -> int | None:
    if value is None:
        return None
    if hypercapnic_rf:
        if value <= 83:
            return 3
        if value <= 85:
            return 2
        if value <= 87:
            return 1
        if value <= 92:
            return 0 if supplemental_o2 else 1
        if value <= 94:
            return 2
        if value <= 96:
            return 3
        return 3
    if value <= 91:
        return 3
    if value <= 93:
        return 2
    if value <= 95:
        return 1
    return 0


def _score_supplemental_o2(value: bool | None) -> int | None:
    if value is None:
        return None
    return 2 if value else 0


def _score_temperature(value: float | None) -> int | None:
    if value is None:
        return None
    if value <= 35.0:
        return 3
    if value <= 36.0:
        return 1
    if value <= 38.0:
        return 0
    if value <= 39.0:
        return 1
    return 2


def _score_systolic_bp(value: float | None) -> int | None:
    if value is None:
        return None
    if value <= 90:
        return 3
    if value <= 100:
        return 2
    if value <= 110:
        return 1
    if value <= 219:
        return 0
    return 3


def _score_heart_rate(value: float | None) -> int | None:
    if value is None:
        return None
    if value <= 40:
        return 3
    if value <= 50:
        return 1
    if value <= 90:
        return 0
    if value <= 110:
        return 1
    if value <= 130:
        return 2
    return 3


def _score_consciousness(value: str | None) -> int | None:
    if value is None:
        return None
    normalized = value.strip().lower()
    if normalized in {"alert", "a"}:
        return 0
    return 3
