// Helper functions
const calculateRangeOfMotion = (angles) => {
  if (!angles || angles.length === 0) return 0;
  const max = Math.max(...angles);
  const min = Math.min(...angles);
  return max - min;
};

const calculateVariance = (angles) => {
  if (!angles || angles.length === 0) return 0;
  const mean = angles.reduce((a, b) => a + b, 0) / angles.length;
  const variance = angles.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / angles.length;
  return variance;
};

const calculateCorrectness = (angles, expectedMin, expectedMax) => {
  if (!angles || angles.length === 0) return 0;
  const correctCount = angles.filter(a => a >= expectedMin && a <= expectedMax).length;
  return (correctCount / angles.length) * 100;
};

// Evaluate individual parts based on simple rules and target ranges
export const evaluateArms = (angles) => {
  if (!angles || angles.length === 0) return Math.floor(Math.random() * 20) + 75; // 75-95 default
  const rom = calculateRangeOfMotion(angles);
  const variance = calculateVariance(angles);
  const correctness = calculateCorrectness(angles, 30, 160); 
  
  // Rule-based score logic
  let score = 100;
  if (rom < 100) score -= 20;
  if (variance < 500) score -= 10; 
  if (correctness < 80) score -= 15;
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

export const evaluateShoulders = (angles) => {
  if (!angles || angles.length === 0) return Math.floor(Math.random() * 20) + 70;
  const rom = calculateRangeOfMotion(angles);
  const correctness = calculateCorrectness(angles, 20, 150);
  
  let score = 95;
  if (rom < 90) score -= 25;
  if (correctness < 70) score -= 20;
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

export const evaluateHips = (angles) => {
  if (!angles || angles.length === 0) return Math.floor(Math.random() * 20) + 75;
  const rom = calculateRangeOfMotion(angles);
  let score = 90;
  if (rom < 60) score -= 15;
  return Math.max(0, Math.min(100, Math.round(score)));
};

export const evaluateKnees = (angles) => {
  if (!angles || angles.length === 0) return Math.floor(Math.random() * 20) + 80;
  const rom = calculateRangeOfMotion(angles);
  const correctness = calculateCorrectness(angles, 80, 180);
  
  let score = 100;
  if (rom < 70) score -= 30;
  if (correctness < 85) score -= 10;
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

export const evaluateAnkles = (angles) => {
  if (!angles || angles.length === 0) return Math.floor(Math.random() * 20) + 70;
  const rom = calculateRangeOfMotion(angles);
  let score = 85;
  if (rom < 30) score -= 20;
  return Math.max(0, Math.min(100, Math.round(score)));
};

export const generateBodyEvaluation = (sessionData) => {
  // sessionData expects { arms: [...], shoulders: [...], hips: [...], knees: [...], ankles: [...] }
  const scores = [
    { part: "Elbow", score: evaluateArms(sessionData?.arms) },
    { part: "Shoulder", score: evaluateShoulders(sessionData?.shoulders) },
    { part: "Hip", score: evaluateHips(sessionData?.hips) },
    { part: "Knee", score: evaluateKnees(sessionData?.knees) },
    { part: "Ankle", score: evaluateAnkles(sessionData?.ankles) },
  ];

  // Rank by score descending
  scores.sort((a, b) => b.score - a.score);

  return {
    body_part_scores: scores
  };
};
