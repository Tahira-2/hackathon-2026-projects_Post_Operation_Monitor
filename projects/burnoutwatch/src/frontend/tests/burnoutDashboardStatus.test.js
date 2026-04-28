const test = require('node:test');
const assert = require('node:assert/strict');

const { buildDashboardStatus } = require('../src/burnout/dashboardStatus');

test('dashboard status renders dynamic burnout score and risk tier', () => {
  const status = buildDashboardStatus(
    {
      burnout_score: 78,
      risk_tier: 'high',
    },
    {
      facial_fatigue: {
        risk_tier: 'moderate',
      },
    }
  );

  assert.equal(status.currentStatus, 'High');
  assert.equal(status.percentage, 78);
  assert.match(status.text, /Face scan: Moderate fatigue/);
  assert.match(status.recommendation, /supervisor|peer/);
});

test('dashboard status falls back to score-derived tier', () => {
  const status = buildDashboardStatus({ burnout_score: 24 }, null);

  assert.equal(status.currentStatus, 'Low');
  assert.equal(status.percentage, 24);
});
