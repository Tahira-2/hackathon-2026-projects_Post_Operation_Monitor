const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeManualForm } = require('../src/metrics/manualForm');

test('manual form normalizes valid numeric input', () => {
  const result = normalizeManualForm({
    localDate: '2026-04-26',
    sleepDurationHours: '7.5',
    sleepQualityManual: '4',
    shiftCount: '2',
    overtimeHours: '1.5',
    fatigueRating: '7',
    stressRating: '6',
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.manualInput.sleep_duration_hours, 7.5);
  assert.equal(result.manualInput.sleep_quality_manual, 4);
  assert.equal(result.manualInput.shift_count, 2);
  assert.equal(result.manualInput.overtime_hours, 1.5);
  assert.equal(result.manualInput.fatigue_rating, 7);
  assert.equal(result.manualInput.stress_rating, 6);
});

test('manual form rejects empty and out-of-range submissions', () => {
  const result = normalizeManualForm({
    localDate: '04/26/2026',
    sleepDurationHours: '25',
    sleepQualityManual: '',
    shiftCount: '',
    overtimeHours: '',
    fatigueRating: '',
    stressRating: '',
  });

  assert.ok(result.errors.includes('Local date must use YYYY-MM-DD.'));
  assert.ok(result.errors.includes('Sleep duration must be between 0 and 24.'));
});
