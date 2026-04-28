import { useCallback, useState } from 'react';
import {
  initialize,
  requestPermission,
  readRecords,
  type RecordType,
} from 'react-native-health-connect';

type AccessType = 'read' | 'write';

type TimeRangeFilter = {
  operator: 'between';
  startTime: string;
  endTime: string;
};

type Options = {
  recordType: RecordType;
  accessType?: AccessType;
  timeRangeFilter?: TimeRangeFilter;
};

const DEFAULT_LOOKBACK_MS = 24 * 60 * 60 * 1000;
const READ_REQUEST_SPACING_MS = 1200;
const RATE_LIMIT_BACKOFF_MS = 15000;
const RATE_LIMIT_PATTERN = /rate limited request quota/i;

let initializationPromise: Promise<void> | null = null;
const grantedPermissionKeys = new Set<string>();
const permissionRequestCache = new Map<string, Promise<void>>();
let permissionRequestSequence: Promise<void> = Promise.resolve();
let readRequestSequence: Promise<void> = Promise.resolve();
let lastReadRequestAt = 0;
let rateLimitedUntil = 0;

const getPermissionKey = (accessType: AccessType, recordType: RecordType) => {
  return `${accessType}:${recordType}`;
};

function enqueuePermissionRequest(task: () => Promise<void>) {
  const queuedTask = permissionRequestSequence.then(task, task);
  permissionRequestSequence = queuedTask.catch(() => undefined);
  return queuedTask;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function scheduleRead<T>(task: () => Promise<T>) {
  const now = Date.now();

  if (rateLimitedUntil > now) {
    await wait(rateLimitedUntil - now);
  }

  const spacingDelay = READ_REQUEST_SPACING_MS - (Date.now() - lastReadRequestAt);

  if (spacingDelay > 0) {
    await wait(spacingDelay);
  }

  try {
    return await task();
  } finally {
    lastReadRequestAt = Date.now();
  }
}

function enqueueReadRequest<T>(task: () => Promise<T>) {
  const queuedTask = readRequestSequence.then(
    () => scheduleRead(task),
    () => scheduleRead(task)
  );
  readRequestSequence = queuedTask.then(
    () => undefined,
    () => undefined
  );

  return queuedTask;
}

async function ensureInitialized() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const initialized = await initialize();
      console.log('Health Connect initialized:', initialized);

      if (!initialized) {
        throw new Error('Health Connect is not available on this device.');
      }
    })().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  await initializationPromise;
}

async function ensurePermission(accessType: AccessType, recordType: RecordType) {
  const permissionKey = getPermissionKey(accessType, recordType);

  if (grantedPermissionKeys.has(permissionKey)) {
    return;
  }

  if (!permissionRequestCache.has(permissionKey)) {
    const permissionRequest = enqueuePermissionRequest(async () => {
      await ensureInitialized();

      const grantedPermissions = await requestPermission([
        {
          accessType,
          recordType,
        },
      ]);

      const isGranted = grantedPermissions.some(
        (permission: any) =>
          permission?.accessType === accessType && permission?.recordType === recordType
      );

      if (!isGranted) {
        throw new Error(`Permission denied for ${recordType} (${accessType}).`);
      }

      grantedPermissionKeys.add(permissionKey);
    });

    permissionRequestCache.set(permissionKey, permissionRequest);
  }

  try {
    await permissionRequestCache.get(permissionKey);
  } finally {
    permissionRequestCache.delete(permissionKey);
  }
}

export function useHealthConnect() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = useCallback(async (options: Options) => {
    try {
      setLoading(true);
      setError(null);

      const accessType = options.accessType ?? 'read';
      await ensurePermission(accessType, options.recordType);

      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - DEFAULT_LOOKBACK_MS);

      const defaultFilter: TimeRangeFilter = {
        operator: 'between',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };

      const result = await enqueueReadRequest(() =>
        readRecords(options.recordType, {
          timeRangeFilter: options.timeRangeFilter ?? defaultFilter,
        })
      );

      const records = result?.records ?? [];
      setData(records);

      return records;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err ?? '');
      const isRateLimited = RATE_LIMIT_PATTERN.test(errorMessage);

      if (isRateLimited) {
        rateLimitedUntil = Math.max(rateLimitedUntil, Date.now() + RATE_LIMIT_BACKOFF_MS);
      }

      const message = isRateLimited
        ? 'Health Connect is temporarily rate limited. Retrying on the next update cycle.'
        : errorMessage || 'Failed to fetch health data';

      setError(message);
      console.error(`[HealthConnect] Failed to fetch ${options.recordType}:`, err);

      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchHealthData,
  };
}
