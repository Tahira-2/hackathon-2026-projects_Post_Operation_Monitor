function emptyToNull(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  return value;
}

function parseNumber(value) {
  const normalized = emptyToNull(value);
  if (normalized === null) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function parseInteger(value) {
  const parsed = parseNumber(value);
  return parsed === null || Number.isNaN(parsed) ? parsed : Math.round(parsed);
}

function validateRange(name, value, min, max, errors) {
  if (value === null) {
    return;
  }

  if (Number.isNaN(value) || value < min || value > max) {
    errors.push(`${name} must be between ${min} and ${max}.`);
  }
}

function normalizeManualForm(form) {
  const manualInput = {
    sleep_duration_hours: parseNumber(form.sleepDurationHours),
    sleep_quality_manual: parseInteger(form.sleepQualityManual),
    shift_count: parseInteger(form.shiftCount),
    overtime_hours: parseNumber(form.overtimeHours),
    fatigue_rating: parseInteger(form.fatigueRating),
    stress_rating: parseInteger(form.stressRating),
  };
  const errors = [];

  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.localDate ?? '')) {
    errors.push('Local date must use YYYY-MM-DD.');
  }

  validateRange('Sleep duration', manualInput.sleep_duration_hours, 0, 24, errors);
  validateRange('Sleep quality', manualInput.sleep_quality_manual, 1, 5, errors);
  validateRange('Shift count', manualInput.shift_count, 0, 6, errors);
  validateRange('Overtime hours', manualInput.overtime_hours, 0, 24, errors);
  validateRange('Fatigue rating', manualInput.fatigue_rating, 1, 10, errors);
  validateRange('Stress rating', manualInput.stress_rating, 1, 10, errors);

  const hasAnyValue = Object.values(manualInput).some((value) => value !== null && !Number.isNaN(value));
  if (!hasAnyValue) {
    errors.push('Enter at least one manual metric.');
  }

  return {
    errors,
    manualInput,
  };
}

module.exports = {
  normalizeManualForm,
};
