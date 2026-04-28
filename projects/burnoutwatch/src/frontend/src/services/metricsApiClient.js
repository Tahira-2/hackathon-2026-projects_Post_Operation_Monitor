const API_ENV_KEY = 'EXPO_PUBLIC_API_BASE_URL';

function createMetricsApiClient({
  baseUrl,
  fetchImpl = global.fetch,
  platform = 'ios',
} = {}) {
  const resolvedBaseUrl =
    baseUrl ??
    process.env[API_ENV_KEY] ??
    (platform === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000');

  async function request(path, options = {}) {
    const response = await fetchImpl(`${resolvedBaseUrl}${path}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      ...options,
    });

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch (error) {
        errorBody = '';
      }

      throw new Error(`API request failed (${response.status}): ${errorBody || response.statusText}`);
    }

    return response.json();
  }

  return {
    baseUrl: resolvedBaseUrl,

    async ingestSummaries(summaries) {
      return request('/metrics/ingest', {
        method: 'POST',
        body: JSON.stringify({ summaries }),
      });
    },

    async getDailySummaries(workerId, startDate, endDate) {
      const query = new URLSearchParams({
        worker_id: workerId,
        start_date: startDate,
        end_date: endDate,
      });

      return request(`/metrics/daily-summaries?${query.toString()}`);
    },

    async getBurnoutScore(workerId, startDate, endDate, options = {}) {
      const query = new URLSearchParams({
        worker_id: workerId,
        start_date: startDate,
        end_date: endDate,
      });
      if (options.facialFatigueScore !== undefined && options.facialFatigueScore !== null) {
        query.set('facial_fatigue_score', String(options.facialFatigueScore));
      }

      return request(`/scoring/burnout?${query.toString()}`);
    },

    async analyzeFaceScanAndScore(workerId, startDate, endDate, photoPayload = {}) {
      return request('/ml/facial-fatigue/analyze-photo', {
        method: 'POST',
        body: JSON.stringify({
          worker_id: workerId,
          start_date: startDate,
          end_date: endDate,
          width: photoPayload.width ?? 1080,
          height: photoPayload.height ?? 1920,
          file_size_bytes: photoPayload.fileSizeBytes ?? null,
        }),
      });
    },
  };
}

module.exports = {
  API_ENV_KEY,
  createMetricsApiClient,
};
