const {
  ALL_METRICS,
  EMPTY_AVAILABILITY,
  EMPTY_PERMISSIONS,
  HEALTH_METRICS,
  MANUAL_ONLY_METRICS,
} = require('./constants');

function buildMetricMap(defaults, overrides = {}) {
  return {
    ...defaults,
    ...Object.fromEntries(
      Object.entries(overrides).filter(([, value]) => value !== undefined)
    ),
  };
}

function buildBaseSummary({ workerId, localDate, sourcePlatform, sourceRecordedAt = null }) {
  return {
    worker_id: workerId,
    local_date: localDate,
    source_platform: sourcePlatform,
    permissions: buildMetricMap(EMPTY_PERMISSIONS),
    availability: buildMetricMap(EMPTY_AVAILABILITY),
    sleep_duration_hours: null,
    sleep_quality_proxy: null,
    step_count: null,
    resting_heart_rate_bpm: null,
    heart_rate_variability_ms: null,
    activity_minutes: null,
    workout_count: null,
    sleep_quality_manual: null,
    shift_count: null,
    overtime_hours: null,
    fatigue_rating: null,
    stress_rating: null,
    field_sources: {},
    source_recorded_at: sourceRecordedAt,
    ingested_at: null,
    last_device_sync_at: null,
    last_manual_entry_at: null,
  };
}

function setMetric(summary, metric, value, permission, availability, source) {
  summary.permissions[metric] = permission;
  summary.availability[metric] = availability;
  summary[metric] = value;

  if (value !== null && value !== undefined && source) {
    summary.field_sources[metric] = source;
  }
}

module.exports = {
  ALL_METRICS,
  HEALTH_METRICS,
  MANUAL_ONLY_METRICS,
  buildBaseSummary,
  buildMetricMap,
  setMetric,
};
