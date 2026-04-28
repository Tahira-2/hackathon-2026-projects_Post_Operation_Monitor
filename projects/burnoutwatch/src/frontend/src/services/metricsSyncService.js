const { buildRecentDateRange } = require('../metrics/dateUtils');

function createMetricsSyncService({ healthIngestionService, metricsApiClient }) {
  return {
    async syncRecentDays(workerId, days = 7, now = new Date()) {
      if (!workerId) {
        throw new Error('A worker ID is required before syncing health metrics.');
      }

      const { startDate, endDate } = buildRecentDateRange(days, now);
      const summaries = await healthIngestionService.fetchDailySummaries(workerId, startDate, endDate);
      const ingestResponse = await metricsApiClient.ingestSummaries(summaries);
      const canonicalSummaries = await metricsApiClient.getDailySummaries(workerId, startDate, endDate);
      const burnoutScore = await metricsApiClient.getBurnoutScore(workerId, startDate, endDate);

      return {
        startDate,
        endDate,
        summaries,
        ingestResponse,
        canonicalSummaries,
        burnoutScore,
      };
    },
  };
}

module.exports = {
  createMetricsSyncService,
};
