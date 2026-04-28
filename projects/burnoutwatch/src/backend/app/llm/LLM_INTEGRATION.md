# BurnoutWatch LLM Recommendation Layer

This directory is reserved for the recommendation system. The LLM is not the scoring brain.

The scoring calculator must remain deterministic and must use the phone/watch metric summaries, manual work metrics, and ML outputs such as facial-fatigue results. The LLM receives that already-computed context and turns it into safe, worker-facing recommendations.

## Target Architecture

```text
Phone/watch API + manual metrics
  -> Metrics ingestion + canonical daily summaries
  -> Facial-fatigue ML pipeline
  -> Burnout scoring calculator
  -> RecommendationContext
  -> RecommendationService
      -> MockRuleBasedClient default
      -> OllamaGemmaClient optional local LLM
      -> HuggingFaceClient optional hosted LLM
  -> RecommendationResult
```

Use the mock provider for stable demos. Use Gemma through Ollama only after testing on the exact presentation laptop.

## Responsibilities

The LLM layer should:

- Generate short, plain-language recommendations from deterministic scoring output.
- Explain the key contributors that the scoring calculator already identified.
- Adapt tone to the risk tier: low, moderate, or high.
- Acknowledge partial or missing data when the context says data is incomplete.
- Return structured JSON that the backend can validate before sending to the mobile app.

The LLM layer must never:

- Calculate, alter, or override the burnout score.
- Change the risk tier.
- Diagnose a medical condition.
- Prescribe medication, treatment, or clinical action.
- Claim certainty from limited health, facial, or work metrics.
- Present recommendations as emergency, legal, or medical advice.

## Provider Strategy

Default provider:

```env
LLM_PROVIDER=mock
```

The mock provider should be deterministic and rule-based. It should generate useful recommendation cards from the risk tier and top contributors without network access.

Local Gemma provider:

```env
LLM_PROVIDER=ollama
LLM_MODEL=gemma3:1b
OLLAMA_BASE_URL=http://localhost:11434
```

Use Ollama for the local Gemma path because it is free after setup and avoids demo-time API quotas. A larger Gemma model can be used if the presentation laptop handles it reliably, but `gemma3:1b` is the safest default for speed.

Optional hosted provider:

```env
LLM_PROVIDER=huggingface
LLM_MODEL=google/gemma-2-2b-it
HF_API_TOKEN=your_hugging_face_token
```

Keep Hugging Face Gemma as an optional adapter, not the presentation default. Hosted free tiers can have quota, availability, cold-start, model access, or network issues, so the backend falls back to the mock provider if the hosted call is unavailable.

## Planned Files

Use the existing placeholders in this directory:

- `llm_client.py`: define the provider interface and implement `MockRuleBasedClient` and `HuggingFaceClient`.
- `prompt_templates.py`: build the Gemma prompt and JSON schema instructions.
- `recommendation_generator.py`: convert score output into `RecommendationContext`, call the selected client, validate output, and apply safety filters.
- `safety_filters.py`: reject or rewrite unsafe recommendation text.
- `__init__.py`: export the public service and models once implemented.

No LLM code should reach into metrics storage directly. The scoring/recommendation orchestration layer should pass a compact context into this module.

## Expected Input Shape

Recommended model name: `RecommendationContext`.

```json
{
  "worker_id": "worker-123",
  "local_date": "2026-04-26",
  "burnout_score": 68.4,
  "risk_tier": "high",
  "confidence": 0.82,
  "data_completeness": "partial",
  "top_contributors": [
    {
      "name": "sleep_duration_hours",
      "value": 4.8,
      "direction": "risk_increasing",
      "explanation": "Sleep was below the recovery target."
    },
    {
      "name": "overtime_hours",
      "value": 3.5,
      "direction": "risk_increasing",
      "explanation": "Overtime increased workload strain."
    }
  ],
  "daily_metrics": {
    "sleep_duration_hours": 4.8,
    "step_count": 6200,
    "resting_heart_rate_bpm": 71,
    "heart_rate_variability_ms": 24,
    "activity_minutes": 25,
    "shift_count": 1,
    "overtime_hours": 3.5,
    "fatigue_rating": 8,
    "stress_rating": 7
  },
  "facial_fatigue": {
    "score": 72.1,
    "risk_tier": "high",
    "confidence": 0.78,
    "explanation": [
      "eye_fatigue: 18.6 score points",
      "low_engagement: 14.2 score points"
    ]
  }
}
```

Only include fields needed to explain the recommendation. Do not send raw face images or raw video frames to the LLM.

## Expected Output Shape

Recommended model name: `RecommendationResult`.

```json
{
  "worker_id": "worker-123",
  "local_date": "2026-04-26",
  "risk_tier": "high",
  "summary": "Your current burnout risk is high based on reduced recovery and elevated workload signals.",
  "recommendations": [
    {
      "title": "Prioritize recovery before the next shift",
      "detail": "If possible, protect a longer sleep window and avoid taking extra overtime today.",
      "category": "recovery",
      "priority": "high"
    },
    {
      "title": "Use a support checkpoint",
      "detail": "Consider checking in with a supervisor or peer support resource if this pattern continues.",
      "category": "support",
      "priority": "medium"
    }
  ],
  "safety_note": "This is a wellness recommendation, not a medical diagnosis.",
  "generated_by": "mock",
  "generated_at": "2026-04-26T00:00:00Z"
}
```

The returned `risk_tier` must match the input context. If the LLM returns a different tier, discard or correct the response.

## Gemma Prompt Template

Gemma should receive a strict prompt that keeps it in the recommendation lane:

```text
You are the recommendation layer for BurnoutWatch.

You do not calculate burnout scores.
You do not diagnose medical conditions.
You do not prescribe treatment.
You only explain the already-computed risk tier and suggest safe wellness actions.

Return JSON only. Do not include markdown.

Input context:
{recommendation_context_json}

Required JSON shape:
{
  "summary": "string, one sentence",
  "recommendations": [
    {
      "title": "string",
      "detail": "string",
      "category": "recovery | workload | support | reflection | activity",
      "priority": "low | medium | high"
    }
  ],
  "safety_note": "string"
}

Rules:
- Keep recommendations practical for a healthcare worker.
- Use the provided risk_tier exactly; do not change it.
- Mention partial data if data_completeness is partial.
- Avoid diagnosis, treatment, medication, or emergency claims.
- Limit to 2-4 recommendations.
```

## Ollama Setup For Gemma

Install Ollama on the development or presentation laptop:

```bash
ollama --version
```

Pull a small Gemma model:

```bash
ollama pull gemma3:1b
```

Start Ollama if it is not already running:

```bash
ollama serve
```

Smoke test the local API:

```bash
curl http://localhost:11434/api/generate \
  -d '{
    "model": "gemma3:1b",
    "prompt": "Return JSON only: {\"ok\": true}",
    "stream": false
  }'
```

Run the backend with:

```bash
LLM_PROVIDER=ollama LLM_MODEL=gemma3:1b OLLAMA_BASE_URL=http://localhost:11434 uvicorn backend.app.main:app --reload
```

For the presentation, use:

```bash
LLM_PROVIDER=mock
```

Only switch to `ollama` if the model has already been pulled, the laptop is fast enough, and the local API has been tested immediately before presenting.

## Implementation Notes

- Validate LLM output with Pydantic before returning it from the API.
- If Hugging Face is unavailable, malformed, missing credentials, or times out, fall back to `MockRuleBasedClient`.
- Set a short timeout for local LLM calls, such as 5-10 seconds.
- Store generated recommendation metadata, not raw prompts, unless the team explicitly decides to persist prompts for debugging.
- Do not send raw images, raw face frames, credentials, or private notes to any hosted provider.
- Keep recommendation generation idempotent for the same score context where possible.

## Suggested API

Implement after the scoring calculator exists:

```text
POST /recommendations/generate
```

Input options:

- Preferred: `worker_id`, `local_date`, and a scoring result ID once scoring persistence exists.
- Temporary: direct `RecommendationContext` payload for testing before score persistence.

Output:

- `RecommendationResult` as structured JSON.

The endpoint should be downstream of scoring. It should fail or return a mock recommendation if no deterministic score is available.

## Tests To Add Later

- Mock provider returns stable recommendations for low, moderate, and high risk tiers.
- Ollama provider parses valid JSON responses.
- Ollama provider falls back to mock on timeout or invalid JSON.
- Safety filter rejects diagnosis and prescription language.
- Recommendation result preserves input score and risk tier.
- Partial data context produces a partial-data note.
- API response validates against `RecommendationResult`.
