const test = require('node:test');
const assert = require('node:assert/strict');

const { createDemoHealthIngestionService } = require('../src/metrics/providers/DemoHealthProvider');
const { buildManualSummary } = require('../src/metrics/manualEntry');
const { createDemoMetricsApiClient } = require('../src/services/demoMetricsApiClient');
const { createMetricsSyncService } = require('../src/services/metricsSyncService');

test('demo mode syncs seeded device summaries through in-memory api client', async () => {
  const healthIngestionService = createDemoHealthIngestionService({ platform: 'android' });
  const metricsApiClient = createDemoMetricsApiClient();
  const syncService = createMetricsSyncService({ healthIngestionService, metricsApiClient });

  const result = await syncService.syncRecentDays(
    'worker-demo',
    7,
    new Date('2026-04-26T12:00:00Z')
  );

  assert.equal(result.ingestResponse.ingested_count, 7);
  assert.equal(result.canonicalSummaries.length, 7);
  assert.equal(result.canonicalSummaries[0].source_platform, 'android_health_connect');
  assert.equal(result.canonicalSummaries[0].field_sources.step_count, 'device');
  assert.equal(result.burnoutScore.risk_tier, 'moderate');
  assert.ok(result.burnoutScore.burnout_score > 0);
});

test('demo api client preserves device precedence when manual summary is added', async () => {
  const healthIngestionService = createDemoHealthIngestionService({ platform: 'ios' });
  const metricsApiClient = createDemoMetricsApiClient();
  const deviceSummaries = await healthIngestionService.fetchDailySummaries(
    'worker-demo',
    '2026-04-26',
    '2026-04-26'
  );

  await metricsApiClient.ingestSummaries(deviceSummaries);
  await metricsApiClient.ingestSummaries([
    buildManualSummary('worker-demo', '2026-04-26', {
      sleep_duration_hours: 8.5,
      shift_count: 2,
      overtime_hours: 1.5,
      fatigue_rating: 7,
      stress_rating: 6,
    }),
  ]);

  const [summary] = await metricsApiClient.getDailySummaries(
    'worker-demo',
    '2026-04-26',
    '2026-04-26'
  );

  assert.equal(summary.source_platform, 'ios_healthkit');
  assert.notEqual(summary.sleep_duration_hours, 8.5);
  assert.equal(summary.field_sources.sleep_duration_hours, 'device');
  assert.equal(summary.shift_count, 2);
  assert.equal(summary.field_sources.shift_count, 'manual');

  const score = await metricsApiClient.getBurnoutScore('worker-demo', '2026-04-26', '2026-04-26');
  const faceScan = await metricsApiClient.analyzeFaceScanAndScore(
    'worker-demo',
    '2026-04-26',
    '2026-04-26',
    { width: 1920, height: 1080, fileSizeBytes: 900000 }
  );

  assert.equal(score.risk_tier, 'moderate');
  assert.ok(score.contributors.some((item) => item.metric === 'fatigue_rating'));
  assert.ok(faceScan.facial_fatigue.score > 0);
  assert.ok(['low', 'moderate', 'high'].includes(faceScan.burnout_score.risk_tier));
  assert.ok(faceScan.burnout_score.contributors.some((item) => item.metric === 'facial_fatigue_score'));
});

test('demo api client returns facial fatigue and burnout score without backend data', async () => {
  const metricsApiClient = createDemoMetricsApiClient();

  const faceScan = await metricsApiClient.analyzeFaceScanAndScore(
    'worker-demo',
    '2026-04-20',
    '2026-04-26',
    { width: 500, height: 500, fileSizeBytes: 100000 }
  );

  assert.equal(faceScan.facial_fatigue.risk_tier, 'high');
  assert.equal(faceScan.burnout_score.burnout_score, faceScan.facial_fatigue.score);
  assert.equal(faceScan.burnout_score.risk_tier, 'high');
});
