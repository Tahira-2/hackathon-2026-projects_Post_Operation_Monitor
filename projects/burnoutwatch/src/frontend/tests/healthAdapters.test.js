const test = require('node:test');
const assert = require('node:assert/strict');

const { createHealthKitNativeAdapter } = require('../src/metrics/native/healthKitNativeAdapter');
const {
  createHealthConnectNativeAdapter,
} = require('../src/metrics/native/healthConnectNativeAdapter');

test('HealthKit adapter aggregates real-style sample payloads into daily records', async () => {
  const nativeModule = {
    Constants: {
      Permissions: {
        SleepAnalysis: 'SleepAnalysis',
        Steps: 'Steps',
        RestingHeartRate: 'RestingHeartRate',
        HeartRateVariability: 'HeartRateVariability',
        Workout: 'Workout',
      },
      Units: {
        bpm: 'bpm',
        second: 'second',
      },
    },
    isAvailable(callback) {
      callback(null, true);
    },
    initHealthKit(_options, callback) {
      callback(null, {});
    },
    getAuthStatus(_options, callback) {
      callback(null, {
        permissions: {
          read: [2, 2, 2, 2, 2],
          write: [],
        },
      });
    },
    getSleepSamples(_options, callback) {
      callback(null, [
        {
          startDate: '2026-04-26T00:00:00.000+05:45',
          endDate: '2026-04-26T02:00:00.000+05:45',
          value: 'REM',
        },
        {
          startDate: '2026-04-26T02:00:00.000+05:45',
          endDate: '2026-04-26T06:00:00.000+05:45',
          value: 'CORE',
        },
      ]);
    },
    getDailyStepCountSamples(_options, callback) {
      callback(null, [
        {
          endDate: '2026-04-26T20:00:00.000+05:45',
          value: 8123,
        },
      ]);
    },
    getRestingHeartRateSamples(_options, callback) {
      callback(null, [
        { endDate: '2026-04-26T08:00:00.000+05:45', value: 58 },
        { endDate: '2026-04-26T20:00:00.000+05:45', value: 62 },
      ]);
    },
    getHeartRateVariabilitySamples(_options, callback) {
      callback(null, [{ endDate: '2026-04-26T08:00:00.000+05:45', value: 0.04 }]);
    },
    getSamples(_options, callback) {
      callback(null, [
        {
          start: '2026-04-26T10:00:00.000+05:45',
          end: '2026-04-26T10:45:00.000+05:45',
        },
      ]);
    },
  };

  const adapter = createHealthKitNativeAdapter({ nativeModule });
  const permissions = await adapter.requestPermissions();
  const records = await adapter.fetchDailyRecords('2026-04-25', '2026-04-26');

  assert.equal(permissions.step_count, 'granted');
  assert.equal(records.length, 2);
  const april26 = records.find((record) => record.localDate === '2026-04-26');
  assert.ok(april26);
  assert.equal(april26.stepCount, 8123);
  assert.equal(april26.restingHeartRateBpm, 60);
  assert.equal(april26.heartRateVariabilityMs, 40);
  assert.equal(april26.activityMinutes, 45);
  assert.equal(april26.workoutCount, 1);
  assert.equal(april26.sleepQualityProxy, 0.3333);
});

test('Health Connect adapter handles SDK availability and permission mapping', async () => {
  const nativeModule = {
    SdkAvailabilityStatus: {
      SDK_AVAILABLE: 3,
    },
    SleepStageType: {
      SLEEPING: 2,
      LIGHT: 4,
      DEEP: 5,
      REM: 6,
    },
    async getSdkStatus() {
      return 3;
    },
    async initialize() {
      return true;
    },
    async requestPermission() {
      return [
        { accessType: 'read', recordType: 'SleepSession' },
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'ExerciseSession' },
      ];
    },
    async readRecords(recordType) {
      if (recordType === 'SleepSession') {
        return {
          records: [
            {
              startTime: '2026-04-26T00:00:00.000+05:45',
              endTime: '2026-04-26T06:00:00.000+05:45',
              stages: [
                {
                  startTime: '2026-04-26T00:00:00.000+05:45',
                  endTime: '2026-04-26T02:00:00.000+05:45',
                  stage: 6,
                },
                {
                  startTime: '2026-04-26T02:00:00.000+05:45',
                  endTime: '2026-04-26T06:00:00.000+05:45',
                  stage: 4,
                },
              ],
            },
          ],
        };
      }

      if (recordType === 'Steps') {
        return {
          records: [
            {
              startTime: '2026-04-26T07:00:00.000+05:45',
              endTime: '2026-04-26T08:00:00.000+05:45',
              count: 5000,
            },
          ],
        };
      }

      if (recordType === 'RestingHeartRate') {
        return {
          records: [{ time: '2026-04-26T09:00:00.000+05:45', beatsPerMinute: 54 }],
        };
      }

      if (recordType === 'HeartRateVariabilityRmssd') {
        return {
          records: [{ time: '2026-04-26T09:30:00.000+05:45', heartRateVariabilityMillis: 36 }],
        };
      }

      if (recordType === 'ExerciseSession') {
        return {
          records: [
            {
              startTime: '2026-04-26T11:00:00.000+05:45',
              endTime: '2026-04-26T12:15:00.000+05:45',
            },
          ],
        };
      }

      return { records: [] };
    },
  };

  const adapter = createHealthConnectNativeAdapter({ nativeModule });
  const permissions = await adapter.requestPermissions();
  const availability = await adapter.getAvailability();
  const records = await adapter.fetchDailyRecords('2026-04-26', '2026-04-26');

  assert.equal(availability.providerAvailable, true);
  assert.equal(permissions.step_count, 'granted');
  assert.equal(permissions.resting_heart_rate_bpm, 'denied');
  assert.equal(records[0].sleepDurationHours, 6);
  assert.equal(records[0].sleepQualityProxy, 0.3333);
  assert.equal(records[0].stepCount, 5000);
  assert.equal(records[0].activityMinutes, 75);
  assert.equal(records[0].workoutCount, 1);
});
