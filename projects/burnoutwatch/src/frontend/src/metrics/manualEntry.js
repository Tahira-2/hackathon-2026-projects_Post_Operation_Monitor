const { HEALTH_METRICS, MANUAL_ONLY_METRICS } = require('./constants');
const { buildBaseSummary, setMetric } = require('./summaryFactory');

function buildManualSummary(workerId, localDate, manualInput = {}, sourceRecordedAt = null) {
  const summary = buildBaseSummary({
    workerId,
    localDate,
    sourcePlatform: 'manual',
    sourceRecordedAt,
  });

  const manualMetrics = [
    ['sleep_duration_hours', manualInput.sleep_duration_hours ?? null],
    ['sleep_quality_manual', manualInput.sleep_quality_manual ?? null],
    ['shift_count', manualInput.shift_count ?? null],
    ['overtime_hours', manualInput.overtime_hours ?? null],
    ['fatigue_rating', manualInput.fatigue_rating ?? null],
    ['stress_rating', manualInput.stress_rating ?? null],
  ];

  for (const [metric, value] of manualMetrics) {
    setMetric(
      summary,
      metric,
      value,
      value === null ? 'unavailable' : 'granted',
      value === null ? 'missing' : 'present',
      'manual'
    );
  }

  return summary;
}

function mergeDeviceAndManualSummary(deviceSummary, manualSummary) {
  const merged = {
    ...(deviceSummary ?? buildBaseSummary({
      workerId: manualSummary.worker_id,
      localDate: manualSummary.local_date,
      sourcePlatform: 'manual',
    })),
    ...manualSummary,
    permissions: { ...(deviceSummary?.permissions ?? {}), ...manualSummary.permissions },
    availability: { ...(deviceSummary?.availability ?? {}), ...manualSummary.availability },
    field_sources: { ...(deviceSummary?.field_sources ?? {}) },
  };

  for (const metric of HEALTH_METRICS) {
    const deviceValue = deviceSummary?.[metric] ?? null;
    const manualValue = manualSummary?.[metric] ?? null;
    if (deviceValue === null && manualValue !== null) {
      merged[metric] = manualValue;
      merged.field_sources[metric] = 'manual';
    } else {
      merged[metric] = deviceValue;
      if (deviceSummary?.field_sources?.[metric]) {
        merged.field_sources[metric] = deviceSummary.field_sources[metric];
      }
    }
  }

  for (const metric of MANUAL_ONLY_METRICS) {
    merged[metric] = manualSummary?.[metric] ?? null;
    if (merged[metric] !== null) {
      merged.field_sources[metric] = 'manual';
    }
  }

  return merged;
}

module.exports = {
  buildManualSummary,
  mergeDeviceAndManualSummary,
};
