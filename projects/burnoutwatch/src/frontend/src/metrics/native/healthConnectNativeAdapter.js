const {
  average,
  endOfLocalDay,
  enumerateLocalDates,
  formatLocalDate,
  maxIso,
  round,
  splitIntervalByLocalDate,
  startOfLocalDay,
} = require('../dateUtils');

const HEALTH_CONNECT_PERMISSION_MAP = {
  sleep_duration_hours: 'SleepSession',
  sleep_quality_proxy: 'SleepSession',
  step_count: 'Steps',
  resting_heart_rate_bpm: 'RestingHeartRate',
  heart_rate_variability_ms: 'HeartRateVariabilityRmssd',
  activity_minutes: 'ExerciseSession',
  workout_count: 'ExerciseSession',
};

const METRICS = Object.keys(HEALTH_CONNECT_PERMISSION_MAP);
const RECORD_TYPES = [...new Set(Object.values(HEALTH_CONNECT_PERMISSION_MAP))];

function createUnavailablePermissions() {
  return Object.fromEntries(METRICS.map((metric) => [metric, 'unavailable']));
}

function createUnavailableAvailability() {
  return {
    providerAvailable: false,
    metrics: Object.fromEntries(METRICS.map((metric) => [metric, 'unavailable'])),
  };
}

function defaultNativeModule() {
  try {
    return require('react-native-health-connect');
  } catch (error) {
    return null;
  }
}

function createDailyRecordMap(startDate, endDate) {
  return Object.fromEntries(
    enumerateLocalDates(startDate, endDate).map((localDate) => [
      localDate,
      {
        localDate,
        sleepDurationHours: null,
        sleepQualityProxy: null,
        stepCount: null,
        restingHeartRateBpm: null,
        heartRateVariabilityMs: null,
        activityMinutes: null,
        workoutCount: null,
        sourceRecordedAt: null,
      },
    ])
  );
}

async function initializeHealthConnect(nativeModule) {
  if (!nativeModule) {
    return false;
  }

  const status = await nativeModule.getSdkStatus();
  if (status !== nativeModule.SdkAvailabilityStatus.SDK_AVAILABLE) {
    return false;
  }

  return nativeModule.initialize();
}

function mapGrantedPermissions(grantedPermissions) {
  const grantedRecordTypes = new Set(
    grantedPermissions
      .filter((permission) => permission.accessType === 'read')
      .map((permission) => permission.recordType)
  );

  return Object.fromEntries(
    METRICS.map((metric) => [
      metric,
      grantedRecordTypes.has(HEALTH_CONNECT_PERMISSION_MAP[metric]) ? 'granted' : 'denied',
    ])
  );
}

function summarizeSleep(records, recordMap, sleepStageType) {
  const totalMinutes = {};
  const detailedMinutes = {};
  const detailedDates = new Set();

  for (const record of records) {
    if (!record?.startTime || !record?.endTime) {
      continue;
    }

    const endTime = record.endTime;
    const stages = Array.isArray(record.stages) ? record.stages : [];

    if (stages.length) {
      for (const stage of stages) {
        if (!stage?.startTime || !stage?.endTime) {
          continue;
        }

        const stageType = stage.stage;
        const isSleepStage =
          stageType === sleepStageType.SLEEPING ||
          stageType === sleepStageType.LIGHT ||
          stageType === sleepStageType.DEEP ||
          stageType === sleepStageType.REM;

        if (!isSleepStage) {
          continue;
        }

        for (const segment of splitIntervalByLocalDate(stage.startTime, stage.endTime)) {
          const minutes = segment.milliseconds / 60000;
          totalMinutes[segment.localDate] = (totalMinutes[segment.localDate] ?? 0) + minutes;
          recordMap[segment.localDate].sourceRecordedAt = maxIso(
            recordMap[segment.localDate].sourceRecordedAt,
            endTime
          );

          if (
            stageType === sleepStageType.LIGHT ||
            stageType === sleepStageType.DEEP ||
            stageType === sleepStageType.REM
          ) {
            detailedDates.add(segment.localDate);
            detailedMinutes[segment.localDate] = detailedMinutes[segment.localDate] ?? {
              light: 0,
              deep: 0,
              rem: 0,
            };

            if (stageType === sleepStageType.LIGHT) {
              detailedMinutes[segment.localDate].light += minutes;
            }
            if (stageType === sleepStageType.DEEP) {
              detailedMinutes[segment.localDate].deep += minutes;
            }
            if (stageType === sleepStageType.REM) {
              detailedMinutes[segment.localDate].rem += minutes;
            }
          }
        }
      }
      continue;
    }

    for (const segment of splitIntervalByLocalDate(record.startTime, record.endTime)) {
      const minutes = segment.milliseconds / 60000;
      totalMinutes[segment.localDate] = (totalMinutes[segment.localDate] ?? 0) + minutes;
      recordMap[segment.localDate].sourceRecordedAt = maxIso(
        recordMap[segment.localDate].sourceRecordedAt,
        endTime
      );
    }
  }

  for (const [localDate, minutes] of Object.entries(totalMinutes)) {
    if (recordMap[localDate]) {
      recordMap[localDate].sleepDurationHours = round(minutes / 60, 2);
    }
  }

  for (const localDate of detailedDates) {
    const stages = detailedMinutes[localDate];
    const detailedTotal = stages.light + stages.deep + stages.rem;
    if (!detailedTotal || !recordMap[localDate]) {
      continue;
    }

    recordMap[localDate].sleepQualityProxy = round((stages.deep + stages.rem) / detailedTotal, 4);
  }
}

function summarizeSteps(records, recordMap) {
  for (const record of records) {
    if (!record?.startTime || !record?.endTime) {
      continue;
    }

    const totalMilliseconds = new Date(record.endTime).getTime() - new Date(record.startTime).getTime();
    const totalCount = Number(record.count) || 0;
    const segments = splitIntervalByLocalDate(record.startTime, record.endTime);

    for (const segment of segments) {
      if (!recordMap[segment.localDate]) {
        continue;
      }

      const proportionalCount =
        totalMilliseconds > 0 ? (segment.milliseconds / totalMilliseconds) * totalCount : totalCount;
      recordMap[segment.localDate].stepCount =
        (recordMap[segment.localDate].stepCount ?? 0) + proportionalCount;
      recordMap[segment.localDate].sourceRecordedAt = maxIso(
        recordMap[segment.localDate].sourceRecordedAt,
        record.endTime
      );
    }
  }

  for (const record of Object.values(recordMap)) {
    if (record.stepCount !== null) {
      record.stepCount = Math.round(record.stepCount);
    }
  }
}

function summarizeInstantRecords(records, recordMap, fieldName, key) {
  const valuesByDate = {};

  for (const record of records) {
    if (!record?.time) {
      continue;
    }

    const localDate = formatLocalDate(new Date(record.time));
    if (!recordMap[localDate]) {
      continue;
    }

    const numericValue = Number(record[key]);
    if (!Number.isFinite(numericValue)) {
      continue;
    }

    valuesByDate[localDate] = valuesByDate[localDate] ?? [];
    valuesByDate[localDate].push(numericValue);
    recordMap[localDate].sourceRecordedAt = maxIso(recordMap[localDate].sourceRecordedAt, record.time);
  }

  for (const [localDate, values] of Object.entries(valuesByDate)) {
    recordMap[localDate][fieldName] = round(average(values), 2);
  }
}

function summarizeExerciseSessions(records, recordMap) {
  const countsByDate = {};
  const minutesByDate = {};

  for (const record of records) {
    if (!record?.startTime || !record?.endTime) {
      continue;
    }

    const endLocalDate = formatLocalDate(new Date(record.endTime));
    if (recordMap[endLocalDate]) {
      countsByDate[endLocalDate] = (countsByDate[endLocalDate] ?? 0) + 1;
      recordMap[endLocalDate].sourceRecordedAt = maxIso(
        recordMap[endLocalDate].sourceRecordedAt,
        record.endTime
      );
    }

    for (const segment of splitIntervalByLocalDate(record.startTime, record.endTime)) {
      if (!recordMap[segment.localDate]) {
        continue;
      }

      minutesByDate[segment.localDate] = (minutesByDate[segment.localDate] ?? 0) + segment.milliseconds / 60000;
      recordMap[segment.localDate].sourceRecordedAt = maxIso(
        recordMap[segment.localDate].sourceRecordedAt,
        record.endTime
      );
    }
  }

  for (const [localDate, minutes] of Object.entries(minutesByDate)) {
    recordMap[localDate].activityMinutes = Math.round(minutes);
  }

  for (const [localDate, count] of Object.entries(countsByDate)) {
    recordMap[localDate].workoutCount = count;
  }
}

function createHealthConnectNativeAdapter({ nativeModule = defaultNativeModule() } = {}) {
  return {
    async requestPermissions() {
      if (!(await initializeHealthConnect(nativeModule))) {
        return createUnavailablePermissions();
      }

      const granted = await nativeModule.requestPermission(
        RECORD_TYPES.map((recordType) => ({
          accessType: 'read',
          recordType,
        }))
      );

      return mapGrantedPermissions(granted);
    },

    async getAvailability() {
      if (!(await initializeHealthConnect(nativeModule))) {
        return createUnavailableAvailability();
      }

      return {
        providerAvailable: true,
        metrics: Object.fromEntries(METRICS.map((metric) => [metric, 'available'])),
      };
    },

    async fetchDailyRecords(startDate, endDate) {
      if (!(await initializeHealthConnect(nativeModule))) {
        return [];
      }

      const timeRangeFilter = {
        operator: 'between',
        startTime: startOfLocalDay(startDate).toISOString(),
        endTime: endOfLocalDay(endDate).toISOString(),
      };

      const [sleepRecords, stepRecords, restingHeartRateRecords, hrvRecords, exerciseRecords] =
        await Promise.all([
          nativeModule.readRecords('SleepSession', { timeRangeFilter }).then((result) => result.records).catch(() => []),
          nativeModule.readRecords('Steps', { timeRangeFilter }).then((result) => result.records).catch(() => []),
          nativeModule
            .readRecords('RestingHeartRate', { timeRangeFilter })
            .then((result) => result.records)
            .catch(() => []),
          nativeModule
            .readRecords('HeartRateVariabilityRmssd', { timeRangeFilter })
            .then((result) => result.records)
            .catch(() => []),
          nativeModule
            .readRecords('ExerciseSession', { timeRangeFilter })
            .then((result) => result.records)
            .catch(() => []),
        ]);

      const recordMap = createDailyRecordMap(startDate, endDate);
      summarizeSleep(sleepRecords, recordMap, nativeModule.SleepStageType);
      summarizeSteps(stepRecords, recordMap);
      summarizeInstantRecords(
        restingHeartRateRecords,
        recordMap,
        'restingHeartRateBpm',
        'beatsPerMinute'
      );
      summarizeInstantRecords(
        hrvRecords,
        recordMap,
        'heartRateVariabilityMs',
        'heartRateVariabilityMillis'
      );
      summarizeExerciseSessions(exerciseRecords, recordMap);

      return Object.values(recordMap);
    },
  };
}

module.exports = {
  createHealthConnectNativeAdapter,
};
