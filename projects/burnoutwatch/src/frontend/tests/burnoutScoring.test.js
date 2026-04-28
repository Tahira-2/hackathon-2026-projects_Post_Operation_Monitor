const test = require('node:test');
const assert = require('node:assert/strict');

const { calculateBurnoutScore } = require('../src/services/burnoutScoring');

test('burnout scoring blends facial fatigue score when provided', () => {
  const summaries = [
    {
      worker_id: 'worker-face',
      local_date: '2026-04-26',
      sleep_duration_hours: 6.2,
      sleep_quality_proxy: 0.58,
      step_count: 5200,
      resting_heart_rate_bpm: 75,
      heart_rate_variability_ms: 40,
      activity_minutes: 20,
      shift_count: 2,
      overtime_hours: 1.5,
      fatigue_rating: 6,
      stress_rating: 6,
    },
  ];

  const baseline = calculateBurnoutScore('worker-face', '2026-04-26', '2026-04-26', summaries);
  const withFace = calculateBurnoutScore('worker-face', '2026-04-26', '2026-04-26', summaries, {
    facialFatigueScore: 90,
  });

  assert.ok(withFace.burnout_score > baseline.burnout_score);
  assert.ok(withFace.contributors.some((item) => item.metric === 'facial_fatigue_score'));
});

test('burnout scoring supports facial-only fallback when no metric summaries exist', () => {
  const result = calculateBurnoutScore('worker-face', '2026-04-26', '2026-04-26', [], {
    facialFatigueScore: 72,
  });

  assert.equal(result.days_used, 0);
  assert.equal(result.burnout_score, 72);
  assert.equal(result.risk_tier, 'high');
});
