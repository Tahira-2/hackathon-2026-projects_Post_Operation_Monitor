function pad(value) {
  return String(value).padStart(2, '0');
}

function parseLocalDate(localDate) {
  const [year, month, day] = localDate.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function formatLocalDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfLocalDay(localDate) {
  return parseLocalDate(localDate);
}

function endOfLocalDay(localDate) {
  const date = parseLocalDate(localDate);
  date.setHours(23, 59, 59, 999);
  return date;
}

function addDays(date, days) {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

function enumerateLocalDates(startDate, endDate) {
  const dates = [];
  let cursor = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  while (cursor <= end) {
    dates.push(formatLocalDate(cursor));
    cursor = addDays(cursor, 1);
  }

  return dates;
}

function buildRecentDateRange(days, now = new Date()) {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = addDays(end, -(days - 1));
  return {
    startDate: formatLocalDate(start),
    endDate: formatLocalDate(end),
  };
}

function splitIntervalByLocalDate(startInput, endInput) {
  const start = new Date(startInput);
  const end = new Date(endInput);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return [];
  }

  const segments = [];
  let cursor = new Date(start.getTime());

  while (cursor < end) {
    const localDate = formatLocalDate(cursor);
    const dayEnd = endOfLocalDay(localDate);
    const segmentEnd = dayEnd < end ? new Date(dayEnd.getTime() + 1) : end;
    const milliseconds = segmentEnd.getTime() - cursor.getTime();

    segments.push({
      localDate,
      milliseconds,
      startTime: cursor.toISOString(),
      endTime: segmentEnd.toISOString(),
    });

    cursor = segmentEnd;
  }

  return segments;
}

function average(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) {
    return null;
  }

  const total = valid.reduce((sum, value) => sum + value, 0);
  return total / valid.length;
}

function round(value, precision = 2) {
  if (!Number.isFinite(value)) {
    return null;
  }

  const scale = 10 ** precision;
  return Math.round(value * scale) / scale;
}

function maxIso(currentValue, candidate) {
  if (!candidate) {
    return currentValue ?? null;
  }

  if (!currentValue) {
    return candidate;
  }

  return new Date(candidate) > new Date(currentValue) ? candidate : currentValue;
}

module.exports = {
  average,
  buildRecentDateRange,
  endOfLocalDay,
  enumerateLocalDates,
  formatLocalDate,
  maxIso,
  parseLocalDate,
  round,
  splitIntervalByLocalDate,
  startOfLocalDay,
};
