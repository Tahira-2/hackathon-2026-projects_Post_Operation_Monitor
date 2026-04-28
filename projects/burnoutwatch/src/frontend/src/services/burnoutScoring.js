const CATEGORY_WEIGHTS = {
  recovery: 0.35,
  workload: 0.25,
  physiological: 0.2,
  self_report: 0.2,
};

function clamp(value, lower = 0, upper = 100) {
  return Math.max(lower, Math.min(upper, value));
}

function riskTierForScore(score) {
  if (score < 35) {
    return 'low';
  }
  if (score < 65) {
    return 'moderate';
  }
  return 'high';
}

function round(value, precision = 2) {
  const scale = 10 ** precision;
  return Math.round(value * scale) / scale;
}

function sleepDurationRisk(hours) {
  if (hours === null || hours === undefined) return null;
  if (hours >= 7 && hours <= 9) return 0;
  if (hours < 7) return clamp(((7 - hours) / 2) * 100);
  return clamp(((hours - 9) / 3) * 50);
}

function sleepQualityProxyRisk(value) {
  if (value === null || value === undefined) return null;
  return clamp((1 - value) * 100);
}

function sleepQualityManualRisk(value) {
  if (value === null || value === undefined) return null;
  return clamp(((5 - value) / 4) * 100);
}

function shiftCountRisk(value) {
  if (value === null || value === undefined) return null;
  if (value <= 1) return 0;
  if (value === 2) return 45;
  return clamp(45 + (value - 2) * 35);
}

function overtimeRisk(hours) {
  if (hours === null || hours === undefined) return null;
  return clamp((hours / 4) * 100);
}

function activityMinutesRisk(minutes) {
  if (minutes === null || minutes === undefined) return null;
  if (minutes >= 30) return 0;
  return clamp(((30 - minutes) / 30) * 40);
}

function restingHeartRateRisk(value) {
  if (value === null || value === undefined) return null;
  if (value <= 65) return 0;
  return clamp(((value - 65) / 25) * 100);
}

function hrvRisk(value) {
  if (value === null || value === undefined) return null;
  if (value >= 60) return 0;
  if (value <= 25) return 100;
  return clamp(((60 - value) / 35) * 100);
}

function stepCountRisk(value) {
  if (value === null || value === undefined) return null;
  if (value >= 7000) return 0;
  if (value <= 2500) return 60;
  return clamp(((7000 - value) / 4500) * 60);
}

function ratingRisk(value) {
  if (value === null || value === undefined) return null;
  return clamp(((value - 1) / 9) * 100);
}

function metric(metric, risk, weight, explanation) {
  return { metric, risk, weight, explanation };
}

function categoryScore(metrics) {
  const present = metrics.filter((item) => item.risk !== null && item.risk !== undefined);
  if (!present.length) return null;

  const presentWeight = present.reduce((sum, item) => sum + item.weight, 0);
  const totalWeight = metrics.reduce((sum, item) => sum + item.weight, 0);
  return {
    score: present.reduce((sum, item) => sum + item.risk * item.weight, 0) / presentWeight,
    coverage: presentWeight / totalWeight,
    metrics: present,
  };
}

function dailyCategories(summary) {
  const sleepQuality =
    summary.sleep_quality_proxy !== null && summary.sleep_quality_proxy !== undefined
      ? metric(
          'sleep_quality_proxy',
          sleepQualityProxyRisk(summary.sleep_quality_proxy),
          0.45,
          'Sleep-stage quality was below the target recovery range.'
        )
      : metric(
          'sleep_quality_manual',
          sleepQualityManualRisk(summary.sleep_quality_manual),
          0.45,
          'Manual sleep quality was below the target recovery range.'
        );

  const inputs = {
    recovery: [
      metric(
        'sleep_duration_hours',
        sleepDurationRisk(summary.sleep_duration_hours),
        0.55,
        'Sleep duration was outside the target recovery range.'
      ),
      sleepQuality,
    ],
    workload: [
      metric(
        'shift_count',
        shiftCountRisk(summary.shift_count),
        0.45,
        'Multiple shifts increased workload pressure.'
      ),
      metric(
        'overtime_hours',
        overtimeRisk(summary.overtime_hours),
        0.4,
        'Overtime hours increased workload pressure.'
      ),
      metric(
        'activity_minutes',
        activityMinutesRisk(summary.activity_minutes),
        0.15,
        'Low activity minutes modestly increased recovery risk.'
      ),
    ],
    physiological: [
      metric(
        'resting_heart_rate_bpm',
        restingHeartRateRisk(summary.resting_heart_rate_bpm),
        0.4,
        'Resting heart rate was elevated.'
      ),
      metric(
        'heart_rate_variability_ms',
        hrvRisk(summary.heart_rate_variability_ms),
        0.4,
        'Heart-rate variability was below the target recovery range.'
      ),
      metric(
        'step_count',
        stepCountRisk(summary.step_count),
        0.2,
        'Step count was below the target activity baseline.'
      ),
    ],
    self_report: [
      metric(
        'fatigue_rating',
        ratingRisk(summary.fatigue_rating),
        0.5,
        'Self-reported fatigue was elevated.'
      ),
      metric(
        'stress_rating',
        ratingRisk(summary.stress_rating),
        0.5,
        'Self-reported stress was elevated.'
      ),
    ],
  };

  return Object.fromEntries(
    Object.entries(inputs)
      .map(([name, metrics]) => [name, categoryScore(metrics)])
      .filter(([, score]) => score)
  );
}

function calculateBurnoutScore(workerId, startDate, endDate, summaries, options = {}) {
  const facialFatigueScore =
    options.facialFatigueScore === null || options.facialFatigueScore === undefined
      ? null
      : clamp(options.facialFatigueScore);
  const candidates = summaries
    .filter(
      (summary) =>
        summary.worker_id === workerId &&
        summary.local_date >= startDate &&
        summary.local_date <= endDate
    )
    .sort((a, b) => b.local_date.localeCompare(a.local_date));

  let weightedScoreTotal = 0;
  let weightedConfidenceTotal = 0;
  let totalDayWeight = 0;
  let daysUsed = 0;
  const contributorTotals = new Map();

  candidates.forEach((summary, index) => {
    const categories = dailyCategories(summary);
    const entries = Object.entries(categories);
    if (!entries.length) return;

    const availableWeight = entries.reduce((sum, [name]) => sum + CATEGORY_WEIGHTS[name], 0);
    if (!availableWeight) return;

    const dayWeight = 0.9 ** index;
    let dayScore = 0;
    let dayConfidence = 0;

    entries.forEach(([name, category]) => {
      const baseWeight = CATEGORY_WEIGHTS[name];
      const adjustedCategoryWeight = baseWeight / availableWeight;
      const presentWeight = category.metrics.reduce((sum, item) => sum + item.weight, 0);
      dayScore += category.score * adjustedCategoryWeight;
      dayConfidence += baseWeight * category.coverage;

      category.metrics.forEach((item) => {
        const contribution =
          item.risk * adjustedCategoryWeight * (item.weight / presentWeight) * dayWeight;
        const current = contributorTotals.get(item.metric) ?? {
          contribution: 0,
          explanation: item.explanation,
        };
        contributorTotals.set(item.metric, {
          contribution: current.contribution + contribution,
          explanation: current.explanation,
        });
      });
    });

    weightedScoreTotal += dayScore * dayWeight;
    weightedConfidenceTotal += dayConfidence * dayWeight;
    totalDayWeight += dayWeight;
    daysUsed += 1;
  });

  if (!daysUsed || !totalDayWeight) {
    if (facialFatigueScore === null) {
      throw new Error('No usable burnout scoring inputs exist for the requested date range.');
    }
    return {
      worker_id: workerId,
      start_date: startDate,
      end_date: endDate,
      days_used: 0,
      burnout_score: round(facialFatigueScore, 2),
      risk_tier: riskTierForScore(facialFatigueScore),
      confidence: 0.2,
      contributors: [
        {
          metric: 'facial_fatigue_score',
          direction: 'risk_increasing',
          contribution: round(facialFatigueScore, 2),
          explanation: 'Facial fatigue scan score from camera check-in.',
        },
      ],
    };
  }

  let burnoutScore = round(clamp(weightedScoreTotal / totalDayWeight), 2);
  const contributors = [...contributorTotals.entries()]
    .map(([name, value]) => ({
      metric: name,
      direction: 'risk_increasing',
      contribution: round(value.contribution / totalDayWeight, 2),
      explanation: value.explanation,
    }))
    .filter((item) => item.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 5);

  if (facialFatigueScore !== null) {
    burnoutScore = round(clamp((burnoutScore * 0.85) + (facialFatigueScore * 0.15)), 2);
    contributors.push({
      metric: 'facial_fatigue_score',
      direction: 'risk_increasing',
      contribution: round(facialFatigueScore * 0.15, 2),
      explanation: 'Facial fatigue scan score from camera check-in.',
    });
    contributors.sort((a, b) => b.contribution - a.contribution);
  }

  return {
    worker_id: workerId,
    start_date: startDate,
    end_date: endDate,
    days_used: daysUsed,
    burnout_score: burnoutScore,
    risk_tier: riskTierForScore(burnoutScore),
    confidence: round(Math.max(0, Math.min(1, weightedConfidenceTotal / totalDayWeight)), 4),
    contributors,
  };
}

module.exports = {
  calculateBurnoutScore,
  riskTierForScore,
};
