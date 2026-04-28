const HEALTH_METRICS = [
  'sleep_duration_hours',
  'sleep_quality_proxy',
  'step_count',
  'resting_heart_rate_bpm',
  'heart_rate_variability_ms',
  'activity_minutes',
  'workout_count',
];

const MANUAL_ONLY_METRICS = [
  'sleep_quality_manual',
  'shift_count',
  'overtime_hours',
  'fatigue_rating',
  'stress_rating',
];

const ALL_METRICS = [...HEALTH_METRICS, ...MANUAL_ONLY_METRICS];

const EMPTY_PERMISSIONS = Object.freeze(
  Object.fromEntries(ALL_METRICS.map((metric) => [metric, 'unavailable']))
);

const EMPTY_AVAILABILITY = Object.freeze(
  Object.fromEntries(ALL_METRICS.map((metric) => [metric, 'missing']))
);

module.exports = {
  ALL_METRICS,
  EMPTY_AVAILABILITY,
  EMPTY_PERMISSIONS,
  HEALTH_METRICS,
  MANUAL_ONLY_METRICS,
};
