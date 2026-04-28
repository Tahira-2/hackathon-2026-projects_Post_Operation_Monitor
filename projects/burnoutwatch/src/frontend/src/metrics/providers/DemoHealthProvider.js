const { HEALTH_METRICS } = require('../constants');
const { enumerateLocalDates } = require('../dateUtils');
const { buildBaseSummary, setMetric } = require('../summaryFactory');

function metricStatus(value, granted = true) {
  if (!granted) {
    return { permission: 'denied', availability: 'unavailable' };
  }

  return {
    permission: 'granted',
    availability: value === null || value === undefined ? 'missing' : 'present',
  };
}

function createDemoSummary(workerId, localDate, index, sourcePlatform) {
  const summary = buildBaseSummary({
    workerId,
    localDate,
    sourcePlatform,
    sourceRecordedAt: `${localDate}T21:30:00Z`,
  });

  const values = {
    sleep_duration_hours: Math.round((5.6 + (index % 3) * 0.2) * 10) / 10,
    sleep_quality_proxy: Math.round((0.32 + (index % 4) * 0.035) * 10000) / 10000,
    step_count: 4200 + index * 300,
    resting_heart_rate_bpm: 76 - (index % 3),
    heart_rate_variability_ms: 24 + index,
    activity_minutes: 8 + index * 3,
    workout_count: index % 3 === 0 ? 0 : 1,
  };

  for (const metric of HEALTH_METRICS) {
    const { permission, availability } = metricStatus(values[metric]);
    setMetric(summary, metric, values[metric], permission, availability, 'device');
  }

  return summary;
}

function createDemoHealthIngestionService({ platform = 'ios' } = {}) {
  const sourcePlatform = platform === 'android' ? 'android_health_connect' : 'ios_healthkit';

  return {
    async requestPermissions() {
      return Object.fromEntries(HEALTH_METRICS.map((metric) => [metric, 'granted']));
    },

    async getAvailability() {
      return {
        providerAvailable: true,
        demoMode: true,
        metrics: Object.fromEntries(HEALTH_METRICS.map((metric) => [metric, 'available'])),
      };
    },

    async fetchDailySummaries(workerId, startDate, endDate) {
      return enumerateLocalDates(startDate, endDate).map((localDate, index) =>
        createDemoSummary(workerId, localDate, index, sourcePlatform)
      );
    },
  };
}

module.exports = {
  createDemoHealthIngestionService,
};
