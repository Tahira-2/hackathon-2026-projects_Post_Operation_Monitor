const { HEALTH_METRICS } = require('../constants');
const { buildBaseSummary, setMetric } = require('../summaryFactory');
const { createHealthKitNativeAdapter } = require('../native/healthKitNativeAdapter');

function fallbackAdapter() {
  return {
    async requestPermissions() {
      return Object.fromEntries(HEALTH_METRICS.map((metric) => [metric, 'unavailable']));
    },
    async getAvailability() {
      return {
        providerAvailable: false,
        metrics: Object.fromEntries(HEALTH_METRICS.map((metric) => [metric, 'unavailable'])),
      };
    },
    async fetchDailyRecords() {
      return [];
    },
  };
}

function normalizeHealthKitDailyRecord(workerId, record, permissionMap = {}) {
  const summary = buildBaseSummary({
    workerId,
    localDate: record.localDate,
    sourcePlatform: 'ios_healthkit',
    sourceRecordedAt: record.sourceRecordedAt ?? null,
  });

  const metrics = [
    ['sleep_duration_hours', record.sleepDurationHours ?? null],
    ['sleep_quality_proxy', record.sleepQualityProxy ?? null],
    ['step_count', record.stepCount ?? null],
    ['resting_heart_rate_bpm', record.restingHeartRateBpm ?? null],
    ['heart_rate_variability_ms', record.heartRateVariabilityMs ?? null],
    ['activity_minutes', record.activityMinutes ?? null],
    ['workout_count', record.workoutCount ?? null],
  ];

  for (const [metric, value] of metrics) {
    const permission = permissionMap[metric] ?? 'unavailable';
    const availability =
      permission === 'unavailable'
        ? 'unavailable'
        : value === null
          ? 'missing'
          : 'present';
    setMetric(summary, metric, value, permission, availability, 'device');
  }

  return summary;
}

class HealthKitProvider {
  constructor({ adapter } = {}) {
    this.adapter = adapter ?? createHealthKitNativeAdapter() ?? fallbackAdapter();
  }

  async requestPermissions() {
    return this.adapter.requestPermissions();
  }

  async getAvailability() {
    return this.adapter.getAvailability();
  }

  async fetchDailySummaries(workerId, startDate, endDate) {
    const permissions = await this.requestPermissions();
    const records = await this.adapter.fetchDailyRecords(startDate, endDate);
    return records.map((record) => normalizeHealthKitDailyRecord(workerId, record, permissions));
  }
}

module.exports = {
  HealthKitProvider,
  normalizeHealthKitDailyRecord,
};
