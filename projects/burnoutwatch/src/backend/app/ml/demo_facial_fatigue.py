from __future__ import annotations

import json
from typing import Any

from .mock_inputs import build_mock_scan_frames
from .model_registry import build_facial_fatigue_pipeline


DEMO_PROFILES = ("low_risk", "moderate_risk", "high_risk")


def run_demo() -> list[dict[str, Any]]:
    pipeline = build_facial_fatigue_pipeline()
    results: list[dict[str, Any]] = []

    for profile in DEMO_PROFILES:
        result = pipeline.analyze(build_mock_scan_frames(profile))
        payload = result.as_dict()
        payload["profile"] = profile
        results.append(payload)

    return results


def main() -> None:
    print(json.dumps(run_demo(), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
