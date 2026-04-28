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

const HEALTHKIT_PERMISSION_MAP = {
  sleep_duration_hours: 'SleepAnalysis',
  sleep_quality_proxy: 'SleepAnalysis',
  step_count: 'Steps',
  resting_heart_rate_bpm: 'RestingHeartRate',
  heart_rate_variability_ms: 'HeartRateVariability',
  activity_minutes: 'Workout',
  workout_count: 'Workout',
};

const METRICS = Object.keys(HEALTHKIT_PERMISSION_MAP);
const HEALTHKIT_PERMISSION_KEYS = [...new Set(Object.values(HEALTHKIT_PERMISSION_MAP))];

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
    return require('react-native-health');
  } catch (error) {
    return null;
  }
}

function callWithCallback(nativeModule, method, options) {
  return new Promise((resolve, reject) => {
    if (!nativeModule || typeof nativeModule[method] !== 'function') {
      reject(new Error(`HealthKit method '${method}' is unavailable`));
      return;
    }

    nativeModule[method](options, (error, results) => {
      if (error) {
        reject(new Error(typeof error === 'string' ? error : error.message ?? String(error)));
        return;
      }

      resolve(results);
    });
  });
}

function callNoOptions(nativeModule, method) {
  return new Promise((resolve, reject) => {
    if (!nativeModule || typeof nativeModule[method] !== 'function') {
      reject(new Error(`HealthKit method '${method}' is unavailable`));
      return;
    }

    nativeModule[method]((error, results) => {
      if (error) {
        reject(new Error(typeof error === 'string' ? error : error.message ?? String(error)));
        return;
      }

      resolve(results);
    });
  });
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

function normalizePermissionCode(code) {
  return code === 2 ? 'granted' : 'denied';
}

function mapPermissionStatuses(statusCodes) {
  const permissionByHealthKey = {};
  HEALTHKIT_PERMISSION_KEYS.forEach((permissionKey, index) => {
    permissionByHealthKey[permissionKey] = normalizePermissionCode(statusCodes[index]);
  });

  return Object.fromEntries(
    METRICS.map((metric) => [metric, permissionByHealthKey[HEALTHKIT_PERMISSION_MAP[metric]] ?? 'denied'])
  );
}

function summarizeSleep(samples, recordMap) {
  const sleepMinutes = {};
  const stageMinutes = {};
  const stageDetailDates = new Set();

  for (const sample of samples) {
    if (!sample?.startDate || !sample?.endDate) {
      continue;
    }

    const stageValue = String(sample.value ?? '').toUpperCase();
    const isSleepValue =
      stageValue === 'ASLEEP' ||
      stageValue === 'DEEP' ||
      stageValue === 'CORE' ||
      stageValue === 'REM';

    if (!isSleepValue) {
      continue;
    }

    const segments = splitIntervalByLocalDate(sample.startDate, sample.endDate);
    for (const segment of segments) {
      const minutes = segment.milliseconds / 60000;
      sleepMinutes[segment.localDate] = (sleepMinutes[segment.localDate] ?? 0) + minutes;
      recordMap[segment.localDate].sourceRecordedAt = maxIso(
        recordMap[segment.localDate].sourceRecordedAt,
        sample.endDate
      );

      if (stageValue === 'DEEP' || stageValue === 'CORE' || stageValue === 'REM') {
        stageDetailDates.add(segment.localDate);
        stageMinutes[segment.localDate] = stageMinutes[segment.localDate] ?? {
          deep: 0,
          rem: 0,
          core: 0,
        };

        if (stageValue === 'DEEP') {
          stageMinutes[segment.localDate].deep += minutes;
        }
        if (stageValue === 'REM') {
          stageMinutes[segment.localDate].rem += minutes;
        }
        if (stageValue === 'CORE') {
          stageMinutes[segment.localDate].core += minutes;
        }
      }
    }
  }

  for (const [localDate, minutes] of Object.entries(sleepMinutes)) {
    if (recordMap[localDate]) {
      recordMap[localDate].sleepDurationHours = round(minutes / 60, 2);
    }
  }

  for (const localDate of stageDetailDates) {
    const stages = stageMinutes[localDate];
    const detailedTotal = stages.deep + stages.rem + stages.core;
    if (!detailedTotal || !recordMap[localDate]) {
      continue;
    }

    recordMap[localDate].sleepQualityProxy = round((stages.deep + stages.rem) / detailedTotal, 4);
  }
}

function summarizeStepCounts(samples, recordMap) {
  for (const sample of samples) {
    if (!sample?.endDate) {
      continue;
    }

    const localDate = formatLocalDate(new Date(sample.endDate));
    if (!recordMap[localDate]) {
      continue;
    }

    recordMap[localDate].stepCount = Math.round(Number(sample.value) || 0);
    recordMap[localDate].sourceRecordedAt = maxIso(recordMap[localDate].sourceRecordedAt, sample.endDate);
  }
}

function summarizeInstantSamples(samples, recordMap, fieldName, transform = (value) => value) {
  const valuesByDate = {};

  for (const sample of samples) {
    if (!sample?.endDate) {
      continue;
    }

    const localDate = formatLocalDate(new Date(sample.endDate));
    if (!recordMap[localDate]) {
      continue;
    }

    const numericValue = Number(sample.value);
    if (!Number.isFinite(numericValue)) {
      continue;
    }

    valuesByDate[localDate] = valuesByDate[localDate] ?? [];
    valuesByDate[localDate].push(transform(numericValue));
    recordMap[localDate].sourceRecordedAt = maxIso(recordMap[localDate].sourceRecordedAt, sample.endDate);
  }

  for (const [localDate, values] of Object.entries(valuesByDate)) {
    recordMap[localDate][fieldName] = round(average(values), 2);
  }
}

function summarizeWorkouts(samples, recordMap) {
  const countsByDate = {};
  const minutesByDate = {};

  for (const sample of samples) {
    const startDate = sample?.start ?? sample?.startDate;
    const endDate = sample?.end ?? sample?.endDate;
    if (!startDate || !endDate) {
      continue;
    }

    const endLocalDate = formatLocalDate(new Date(endDate));
    if (recordMap[endLocalDate]) {
      countsByDate[endLocalDate] = (countsByDate[endLocalDate] ?? 0) + 1;
      recordMap[endLocalDate].sourceRecordedAt = maxIso(recordMap[endLocalDate].sourceRecordedAt, endDate);
    }

    for (const segment of splitIntervalByLocalDate(startDate, endDate)) {
      if (!recordMap[segment.localDate]) {
        continue;
      }

      minutesByDate[segment.localDate] = (minutesByDate[segment.localDate] ?? 0) + segment.milliseconds / 60000;
      recordMap[segment.localDate].sourceRecordedAt = maxIso(
        recordMap[segment.localDate].sourceRecordedAt,
        endDate
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

function createHealthKitNativeAdapter({ nativeModule = defaultNativeModule() } = {}) {
  const permissionsConfig = {
    permissions: {
      read: HEALTHKIT_PERMISSION_KEYS.map(
        (permissionKey) => nativeModule?.Constants?.Permissions?.[permissionKey] ?? permissionKey
      ),
      write: [],
    },
  };

  async function isProviderAvailable() {
    if (!nativeModule) {
      return false;
    }

    try {
      return await callNoOptions(nativeModule, 'isAvailable');
    } catch (error) {
      return false;
    }
  }

  return {
    async requestPermissions() {
      if (!(await isProviderAvailable())) {
        return createUnavailablePermissions();
      }

      try {
        await callWithCallback(nativeModule, 'initHealthKit', permissionsConfig);
      } catch (error) {
        // HealthKit may still expose permission status even after partial denials.
      }

      try {
        const status = await callWithCallback(nativeModule, 'getAuthStatus', permissionsConfig);
        return mapPermissionStatuses(status?.permissions?.read ?? []);
      } catch (error) {
        return Object.fromEntries(METRICS.map((metric) => [metric, 'denied']));
      }
    },

    async getAvailability() {
      const available = await isProviderAvailable();
      if (!available) {
        return createUnavailableAvailability();
      }

      return {
        providerAvailable: true,
        metrics: Object.fromEntries(METRICS.map((metric) => [metric, 'available'])),
      };
    },

    async fetchDailyRecords(startDate, endDate) {
      if (!(await isProviderAvailable())) {
        return [];
      }

      const queryOptions = {
        startDate: startOfLocalDay(startDate).toISOString(),
        endDate: endOfLocalDay(endDate).toISOString(),
        ascending: true,
      };

      const [
        sleepSamples,
        stepSamples,
        restingHeartRateSamples,
        heartRateVariabilitySamples,
        workoutSamples,
      ] = await Promise.all([
        callWithCallback(nativeModule, 'getSleepSamples', queryOptions).catch(() => []),
        callWithCallback(nativeModule, 'getDailyStepCountSamples', queryOptions).catch(() => []),
        callWithCallback(nativeModule, 'getRestingHeartRateSamples', {
          ...queryOptions,
          unit: nativeModule?.Constants?.Units?.bpm ?? 'bpm',
        }).catch(() => []),
        callWithCallback(nativeModule, 'getHeartRateVariabilitySamples', {
          ...queryOptions,
          unit: nativeModule?.Constants?.Units?.second ?? 'second',
        }).catch(() => []),
        callWithCallback(nativeModule, 'getSamples', {
          ...queryOptions,
          type: 'Workout',
        }).catch(() => []),
      ]);

      const recordMap = createDailyRecordMap(startDate, endDate);
      summarizeSleep(sleepSamples, recordMap);
      summarizeStepCounts(stepSamples, recordMap);
      summarizeInstantSamples(restingHeartRateSamples, recordMap, 'restingHeartRateBpm');
      summarizeInstantSamples(
        heartRateVariabilitySamples,
        recordMap,
        'heartRateVariabilityMs',
        (value) => value * 1000
      );
      summarizeWorkouts(workoutSamples, recordMap);

      return Object.values(recordMap);
    },
  };
}

module.exports = {
  createHealthKitNativeAdapter,
};
