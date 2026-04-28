const { ALL_METRICS, HEALTH_METRICS, MANUAL_ONLY_METRICS } = require('../metrics/constants');
const { buildBaseSummary } = require('../metrics/summaryFactory');
const { calculateBurnoutScore } = require('./burnoutScoring');

function nowIso() {
  return new Date().toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function emptyMetricState(workerId, localDate) {
  const summary = buildBaseSummary({
    workerId,
    localDate,
    sourcePlatform: 'manual',
  });

  return {
    ...summary,
    deviceMetrics: Object.fromEntries(HEALTH_METRICS.map((metric) => [metric, null])),
    manualMetrics: Object.fromEntries(
      [...MANUAL_ONLY_METRICS, 'sleep_duration_hours'].map((metric) => [metric, null])
    ),
  };
}

function publicSummary(state) {
  const { deviceMetrics, manualMetrics, ...summary } = state;
  return clone(summary);
}

function mergeIntoState(existing, incoming) {
  const state = existing
    ? clone(existing)
    : emptyMetricState(incoming.worker_id, incoming.local_date);
  const ingestedAt = incoming.ingested_at ?? nowIso();

  if (incoming.source_platform === 'manual') {
    for (const metric of [...MANUAL_ONLY_METRICS, 'sleep_duration_hours']) {
      if (incoming[metric] !== null && incoming[metric] !== undefined) {
        state.manualMetrics[metric] = incoming[metric];
      }
      state.permissions[metric] = incoming.permissions?.[metric] ?? state.permissions[metric];
      state.availability[metric] = incoming.availability?.[metric] ?? state.availability[metric];
    }
    state.last_manual_entry_at = incoming.source_recorded_at ?? ingestedAt;
  } else {
    for (const metric of HEALTH_METRICS) {
      state.deviceMetrics[metric] = incoming[metric] ?? null;
      state.permissions[metric] = incoming.permissions?.[metric] ?? state.permissions[metric];
      state.availability[metric] = incoming.availability?.[metric] ?? state.availability[metric];
    }
    state.source_platform = incoming.source_platform;
    state.last_device_sync_at = incoming.source_recorded_at ?? ingestedAt;
  }

  const fieldSources = {};

  for (const metric of HEALTH_METRICS) {
    const deviceValue = state.deviceMetrics[metric];
    const manualValue = state.manualMetrics[metric];

    if (deviceValue !== null && deviceValue !== undefined) {
      state[metric] = deviceValue;
      fieldSources[metric] = 'device';
    } else if (manualValue !== null && manualValue !== undefined) {
      state[metric] = manualValue;
      fieldSources[metric] = 'manual';
    } else {
      state[metric] = null;
    }
  }

  for (const metric of MANUAL_ONLY_METRICS) {
    const manualValue = state.manualMetrics[metric];
    state[metric] = manualValue ?? null;
    if (manualValue !== null && manualValue !== undefined) {
      fieldSources[metric] = 'manual';
    }
  }

  for (const metric of ALL_METRICS) {
    state.permissions[metric] = state.permissions[metric] ?? 'unavailable';
    state.availability[metric] = state.availability[metric] ?? 'missing';
  }

  state.field_sources = fieldSources;
  state.ingested_at = ingestedAt;
  state.source_recorded_at = incoming.source_recorded_at ?? ingestedAt;

  return state;
}

function createDemoMetricsApiClient() {
  const store = new Map();

  function key(workerId, localDate) {
    return `${workerId}:${localDate}`;
  }

  return {
    baseUrl: 'demo://memory',

    async ingestSummaries(summaries) {
      const canonical = summaries.map((summary) => {
        const itemKey = key(summary.worker_id, summary.local_date);
        const merged = mergeIntoState(store.get(itemKey), summary);
        store.set(itemKey, merged);
        return publicSummary(merged);
      });

      return {
        ingested_count: canonical.length,
        summaries: canonical,
      };
    },

    async getDailySummaries(workerId, startDate, endDate) {
      return [...store.values()]
        .filter(
          (summary) =>
            summary.worker_id === workerId &&
            summary.local_date >= startDate &&
            summary.local_date <= endDate
        )
        .sort((a, b) => b.local_date.localeCompare(a.local_date))
        .map(publicSummary);
    },

    async getBurnoutScore(workerId, startDate, endDate, options = {}) {
      const summaries = await this.getDailySummaries(workerId, startDate, endDate);
      return calculateBurnoutScore(workerId, startDate, endDate, summaries, options);
    },

    async analyzeFaceScanAndScore(workerId, startDate, endDate, photoPayload = {}) {
      const width = photoPayload.width ?? 1080;
      const height = photoPayload.height ?? 1920;
      const fileSizeBytes = photoPayload.fileSizeBytes ?? null;
      const pixels = width * height;
      let facialScore = 52;
      let profileUsed = 'moderate_risk';

      if (pixels >= 2_000_000 && fileSizeBytes && fileSizeBytes >= 800_000) {
        facialScore = 28;
        profileUsed = 'low_risk';
      } else if (pixels < 600_000 || (fileSizeBytes && fileSizeBytes < 150_000)) {
        facialScore = 74;
        profileUsed = 'high_risk';
      }

      const burnoutScore = await this.getBurnoutScore(workerId, startDate, endDate, {
        facialFatigueScore: facialScore,
      });

      return {
        profile_used: profileUsed,
        facial_fatigue: {
          score: facialScore,
          risk_tier: facialScore < 35 ? 'low' : facialScore < 65 ? 'moderate' : 'high',
          confidence: 0.82,
          explanation: ['Deterministic demo facial scan score from captured photo metadata.'],
          signals: {},
          raw_outputs: {},
        },
        burnout_score: burnoutScore,
      };
    },
  };
}

module.exports = {
  createDemoMetricsApiClient,
};
