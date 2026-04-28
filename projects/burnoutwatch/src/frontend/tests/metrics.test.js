const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeHealthKitDailyRecord,
} = require('../src/metrics/providers/HealthKitProvider');
const {
  normalizeHealthConnectDailyRecord,
} = require('../src/metrics/providers/HealthConnectProvider');
const {
  buildManualSummary,
  mergeDeviceAndManualSummary,
} = require('../src/metrics/manualEntry');

test('HealthKit normalizer maps device records into DailyMetricSummary shape', () => {
  const summary = normalizeHealthKitDailyRecord(
    'worker-ios',
    {
      localDate: '2026-04-25',
      sourceRecordedAt: '2026-04-25T23:00:00Z',
      sleepDurationHours: 7.8,
      sleepQualityProxy: 0.72,
      stepCount: 12034,
      restingHeartRateBpm: 56,
      heartRateVariabilityMs: 41,
      activityMinutes: 64,
      workoutCount: 1,
    },
    {
      sleep_duration_hours: 'granted',
      sleep_quality_proxy: 'granted',
      step_count: 'granted',
      resting_heart_rate_bpm: 'granted',
      heart_rate_variability_ms: 'granted',
      activity_minutes: 'granted',
      workout_count: 'granted',
    }
  );

  assert.equal(summary.worker_id, 'worker-ios');
  assert.equal(summary.source_platform, 'ios_healthkit');
  assert.equal(summary.step_count, 12034);
  assert.equal(summary.availability.sleep_quality_proxy, 'present');
  assert.equal(summary.field_sources.sleep_duration_hours, 'device');
});

test('HealthConnect normalizer handles missing stage detail as null sleep quality proxy', () => {
  const summary = normalizeHealthConnectDailyRecord(
    'worker-android',
    {
      localDate: '2026-04-25',
      sourceRecordedAt: '2026-04-25T21:00:00Z',
      sleepDurationHours: 6.5,
      stepCount: 9033,
      activityMinutes: 22,
      workoutCount: 0,
    },
    {
      sleep_duration_hours: 'granted',
      sleep_quality_proxy: 'granted',
      step_count: 'granted',
      activity_minutes: 'granted',
      workout_count: 'granted',
    }
  );

  assert.equal(summary.sleep_quality_proxy, null);
  assert.equal(summary.availability.sleep_quality_proxy, 'missing');
  assert.equal(summary.step_count, 9033);
});

test('HealthConnect normalizer maps sleep quality proxy from adapter records', () => {
  const summary = normalizeHealthConnectDailyRecord(
    'worker-android',
    {
      localDate: '2026-04-26',
      sourceRecordedAt: '2026-04-26T21:00:00Z',
      sleepDurationHours: 7.25,
      sleepQualityProxy: 0.3333,
    },
    {
      sleep_duration_hours: 'granted',
      sleep_quality_proxy: 'granted',
    }
  );

  assert.equal(summary.sleep_quality_proxy, 0.3333);
  assert.equal(summary.availability.sleep_quality_proxy, 'present');
});

test('permission denied and unavailable metrics return partial summaries without throwing', () => {
  const summary = normalizeHealthKitDailyRecord(
    'worker-partial',
    {
      localDate: '2026-04-25',
      sleepDurationHours: 7.0,
      stepCount: null,
    },
    {
      sleep_duration_hours: 'granted',
      step_count: 'denied',
      resting_heart_rate_bpm: 'unavailable',
    }
  );

  assert.equal(summary.sleep_duration_hours, 7);
  assert.equal(summary.permissions.step_count, 'denied');
  assert.equal(summary.availability.step_count, 'missing');
  assert.equal(summary.permissions.resting_heart_rate_bpm, 'unavailable');
  assert.equal(summary.availability.resting_heart_rate_bpm, 'unavailable');
});

test('manual fallback fills missing health values without overwriting device data', () => {
  const deviceSummary = normalizeHealthConnectDailyRecord(
    'worker-merge',
    {
      localDate: '2026-04-25',
      sleepDurationHours: 6.9,
      stepCount: null,
    },
    {
      sleep_duration_hours: 'granted',
      step_count: 'granted',
    }
  );
  const manualSummary = buildManualSummary('worker-merge', '2026-04-25', {
    sleep_duration_hours: 8.1,
    shift_count: 2,
    overtime_hours: 1.25,
    fatigue_rating: 8,
    stress_rating: 7,
  });

  const merged = mergeDeviceAndManualSummary(deviceSummary, manualSummary);

  assert.equal(merged.sleep_duration_hours, 6.9);
  assert.equal(merged.shift_count, 2);
  assert.equal(merged.overtime_hours, 1.25);
  assert.equal(merged.field_sources.sleep_duration_hours, 'device');
  assert.equal(merged.field_sources.shift_count, 'manual');
});
