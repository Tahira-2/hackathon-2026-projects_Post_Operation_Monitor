function normalizeTier(riskTier) {
  const tier = String(riskTier ?? '').toLowerCase();
  if (tier === 'low' || tier === 'moderate' || tier === 'high') {
    return tier;
  }
  return 'moderate';
}

function scoreToTier(score) {
  if (score < 35) {
    return 'low';
  }
  if (score < 65) {
    return 'moderate';
  }
  return 'high';
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildDashboardStatus(burnoutScoreResult, faceScanResult) {
  const numericScore = Number.isFinite(burnoutScoreResult?.burnout_score)
    ? Math.round(burnoutScoreResult.burnout_score)
    : 55;
  const tier = burnoutScoreResult?.risk_tier
    ? normalizeTier(burnoutScoreResult.risk_tier)
    : scoreToTier(numericScore);
  const faceTier = faceScanResult?.facial_fatigue?.risk_tier
    ? normalizeTier(faceScanResult.facial_fatigue.risk_tier)
    : null;

  const statusByTier = {
    low: {
      message: "You're looking steady today.",
      recommendation: 'Keep your current recovery routine and take normal breaks.',
      color: '#2E7D5B',
    },
    moderate: {
      message: "You're doing okay today.",
      recommendation: 'Prioritize a full sleep window and take a short reset before your next shift.',
      color: '#6FAFB5',
    },
    high: {
      message: 'Your burnout risk is elevated today.',
      recommendation: 'Reduce nonessential workload and check in with a supervisor or peer before continuing.',
      color: '#C2410C',
    },
  };

  const status = statusByTier[tier];
  const faceCopy = faceTier ? ` Face scan: ${titleCase(faceTier)} fatigue.` : '';

  return {
    currentStatus: titleCase(tier),
    percentage: numericScore,
    color: status.color,
    text: `${status.message}${faceCopy}`,
    recommendation: status.recommendation,
  };
}

module.exports = {
  buildDashboardStatus,
  normalizeTier,
  scoreToTier,
};
