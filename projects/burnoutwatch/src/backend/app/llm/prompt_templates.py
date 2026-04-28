from __future__ import annotations

import json

from .models import RecommendationContext, public_context_payload


def build_recommendation_prompt(context: RecommendationContext) -> str:
    context_json = json.dumps(public_context_payload(context), sort_keys=True)
    return f"""You are the recommendation layer for BurnoutWatch.

You do not calculate burnout scores.
You do not diagnose medical conditions.
You do not prescribe treatment.
You only explain the already-computed risk tier and suggest safe wellness actions.

Return JSON only. Do not include markdown.

Input context:
{context_json}

Required JSON shape:
{{
  "summary": "string, one sentence",
  "recommendations": [
    {{
      "title": "string",
      "detail": "string",
      "category": "recovery | workload | support | reflection | activity",
      "priority": "low | medium | high"
    }}
  ],
  "safety_note": "string"
}}

Rules:
- Keep recommendations practical for a healthcare worker.
- Use the provided risk_tier exactly; do not change it.
- Mention partial data if data_completeness is partial or limited.
- Avoid diagnosis, treatment, medication, or emergency claims.
- Limit to 2-4 recommendations.
"""

