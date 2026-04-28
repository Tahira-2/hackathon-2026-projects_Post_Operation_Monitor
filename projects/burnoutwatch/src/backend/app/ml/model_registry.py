from __future__ import annotations

from .facial_fatigue_pipeline import FacialFatiguePipeline


def build_facial_fatigue_pipeline() -> FacialFatiguePipeline:
    return FacialFatiguePipeline()
