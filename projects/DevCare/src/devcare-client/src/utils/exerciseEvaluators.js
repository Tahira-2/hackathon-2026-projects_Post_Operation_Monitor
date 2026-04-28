import { calculateAngle } from './angleUtils';

/**
 * Intelligent Exercise Evaluators
 * Provides multi-layer feedback including corrections and dynamic accuracy scores.
 */

const getLandmark = (landmarks, index) => landmarks[index];

// Generic accuracy calculator based on target ranges
const calculateAccuracy = (current, minOptimal, maxOptimal, minTolerance, maxTolerance) => {
  if (current >= minOptimal && current <= maxOptimal) return 100;
  if (current < minTolerance || current > maxTolerance) return 0;
  
  if (current < minOptimal) {
    return Math.max(0, 100 - ((minOptimal - current) / (minOptimal - minTolerance)) * 100);
  }
  return Math.max(0, 100 - ((current - maxOptimal) / (maxTolerance - maxOptimal)) * 100);
};

export const evaluateBicepCurl = (landmarks, state) => {
  const shoulder = getLandmark(landmarks, 12);
  const elbow = getLandmark(landmarks, 14);
  const wrist = getLandmark(landmarks, 16);
  const hip = getLandmark(landmarks, 24);

  if (!shoulder || !elbow || !wrist || !hip) return state;

  const angle = calculateAngle(shoulder, elbow, wrist);
  const torsoAngle = calculateAngle(shoulder, hip, getLandmark(landmarks, 26)); // Check if standing straight

  let newStage = state.stage;
  let newReps = state.reps;
  let primaryFeedback = "Good form";
  let corrections = [];
  
  // Track drifting elbow
  const elbowShoulderDist = Math.abs(elbow.x - shoulder.x);
  if (elbowShoulderDist > 0.15) {
    corrections.push({ feedback: "Keep elbow tucked closer", severity: "high", joint: "elbow" });
  }
  if (torsoAngle < 160) {
    corrections.push({ feedback: "Don't lean forward", severity: "medium", joint: "back" });
  }

  if (angle > 160) {
    newStage = "down";
    if (angle > 175) {
      corrections.push({ feedback: "Don't hyperextend elbow", severity: "high", joint: "elbow" });
    }
  }
  
  if (angle < 45 && newStage === "down") {
    newStage = "up";
    newReps += 1;
  }

  if (angle > 45 && angle < 160) {
    if (newStage === "down") primaryFeedback = "Curling up...";
    else primaryFeedback = "Lowering down...";
  }

  if (corrections.length > 0) primaryFeedback = "Needs correction";

  // Calculate dynamic accuracy
  let accuracyScore = 100;
  if (newStage === 'up' && angle > 50) accuracyScore = calculateAccuracy(angle, 30, 45, 20, 60);
  if (newStage === 'down' && angle < 150) accuracyScore = calculateAccuracy(angle, 160, 180, 140, 190);
  if (elbowShoulderDist > 0.15) accuracyScore -= 15;
  if (torsoAngle < 160) accuracyScore -= 10;
  accuracyScore = Math.max(0, Math.min(100, Math.round(accuracyScore)));

  return { ...state, reps: newReps, stage: newStage, feedback: primaryFeedback, corrections, currentAngle: Math.round(angle), accuracyScore };
};

export const evaluateSquat = (landmarks, state) => {
  const shoulder = getLandmark(landmarks, 12);
  const hip = getLandmark(landmarks, 24);
  const knee = getLandmark(landmarks, 26);
  const ankle = getLandmark(landmarks, 28);

  if (!shoulder || !hip || !knee || !ankle) return state;

  const kneeAngle = calculateAngle(hip, knee, ankle);
  const backAngle = calculateAngle(shoulder, hip, knee);

  let newStage = state.stage;
  let newReps = state.reps;
  let primaryFeedback = "Good form";
  let corrections = [];

  if (backAngle < 90) {
    corrections.push({ feedback: "Keep chest up and back straight", severity: "high", joint: "back" });
  }
  if (Math.abs(knee.x - ankle.x) > 0.2) {
    corrections.push({ feedback: "Don't let knees cave in", severity: "high", joint: "knee" });
  }

  if (kneeAngle > 160) {
    newStage = "up";
  }
  if (kneeAngle < 100 && newStage === "up") {
    newStage = "down";
    newReps += 1;
  }

  if (kneeAngle > 100 && kneeAngle < 160) {
    primaryFeedback = newStage === "up" ? "Squatting down..." : "Standing up...";
    if (newStage === "up" && kneeAngle > 110) {
      corrections.push({ feedback: "Go lower for a full rep", severity: "medium", joint: "knee" });
    }
  }

  if (corrections.length > 0) primaryFeedback = "Needs correction";

  let accuracyScore = 100;
  if (backAngle < 90) accuracyScore -= 20;
  if (kneeAngle > 100 && newStage === "down") accuracyScore = calculateAccuracy(kneeAngle, 70, 95, 60, 110);
  accuracyScore = Math.max(0, Math.min(100, Math.round(accuracyScore)));

  return { ...state, reps: newReps, stage: newStage, feedback: primaryFeedback, corrections, currentAngle: Math.round(kneeAngle), accuracyScore };
};

export const evaluateShoulderRaise = (landmarks, state) => {
  const hip = getLandmark(landmarks, 24);
  const shoulder = getLandmark(landmarks, 12);
  const elbow = getLandmark(landmarks, 14);
  const wrist = getLandmark(landmarks, 16);

  if (!hip || !shoulder || !elbow || !wrist) return state;

  const angle = calculateAngle(hip, shoulder, elbow);
  const armStraightness = calculateAngle(shoulder, elbow, wrist);

  let newStage = state.stage;
  let newReps = state.reps;
  let primaryFeedback = "Good form";
  let corrections = [];

  if (armStraightness < 150) {
    corrections.push({ feedback: "Keep your arms straight", severity: "medium", joint: "elbow" });
  }

  if (angle < 30) {
    newStage = "down";
  }
  if (angle > 80 && newStage === "down") {
    newStage = "up";
    newReps += 1;
  }

  if (angle > 95) {
    corrections.push({ feedback: "Don't raise arms too high", severity: "high", joint: "shoulder" });
  }

  if (angle > 30 && angle < 80) {
    primaryFeedback = "Raising...";
  }

  if (corrections.length > 0) primaryFeedback = "Needs correction";

  let accuracyScore = 100;
  if (armStraightness < 150) accuracyScore -= 15;
  if (angle > 100) accuracyScore -= 25; // Penalty for raising too high
  if (newStage === 'up' && angle < 80) accuracyScore = calculateAccuracy(angle, 80, 95, 60, 110);
  accuracyScore = Math.max(0, Math.min(100, Math.round(accuracyScore)));

  return { ...state, reps: newReps, stage: newStage, feedback: primaryFeedback, corrections, currentAngle: Math.round(angle), accuracyScore };
};

export const evaluateKneeExtension = (landmarks, state) => {
  const hip = getLandmark(landmarks, 24);
  const knee = getLandmark(landmarks, 26);
  const ankle = getLandmark(landmarks, 28);

  if (!hip || !knee || !ankle) return state;

  const angle = calculateAngle(hip, knee, ankle);
  let newStage = state.stage;
  let newReps = state.reps;
  let primaryFeedback = "Good form";
  let corrections = [];

  if (angle < 110) {
    newStage = "down";
  }
  if (angle > 160 && newStage === "down") {
    newStage = "up";
    newReps += 1;
  }

  if (angle < 160 && angle > 110) {
    if (newStage === "down") primaryFeedback = "Extending...";
    else primaryFeedback = "Lowering...";
    
    if (newStage === "down" && angle > 130) {
      corrections.push({ feedback: "Extend leg fully", severity: "medium", joint: "knee" });
    }
  }

  if (corrections.length > 0) primaryFeedback = "Needs correction";

  let accuracyScore = 100;
  if (newStage === 'up') accuracyScore = calculateAccuracy(angle, 165, 180, 150, 190);
  accuracyScore = Math.max(0, Math.min(100, Math.round(accuracyScore)));

  return { ...state, reps: newReps, stage: newStage, feedback: primaryFeedback, corrections, currentAngle: Math.round(angle), accuracyScore };
};

export const evaluateHipAbduction = (landmarks, state) => {
  const leftHip = getLandmark(landmarks, 23);
  const rightHip = getLandmark(landmarks, 24);
  const rightKnee = getLandmark(landmarks, 26);
  const shoulder = getLandmark(landmarks, 12);

  if (!leftHip || !rightHip || !rightKnee || !shoulder) return state;

  const angle = calculateAngle(leftHip, rightHip, rightKnee);
  const torsoAngle = calculateAngle(shoulder, rightHip, rightKnee);

  let newStage = state.stage;
  let newReps = state.reps;
  let primaryFeedback = "Good form";
  let corrections = [];

  if (torsoAngle < 150) {
    corrections.push({ feedback: "Keep torso straight, don't lean", severity: "high", joint: "back" });
  }

  if (angle < 100) {
    newStage = "down";
  }
  if (angle > 115 && newStage === "down") {
    newStage = "up";
    newReps += 1;
  }

  if (angle > 100 && angle <= 115) {
     primaryFeedback = "Abducting...";
  }

  if (corrections.length > 0) primaryFeedback = "Needs correction";

  let accuracyScore = 100;
  if (torsoAngle < 150) accuracyScore -= 20;
  if (newStage === 'up') accuracyScore = calculateAccuracy(angle, 115, 140, 105, 150);
  accuracyScore = Math.max(0, Math.min(100, Math.round(accuracyScore)));

  return { ...state, reps: newReps, stage: newStage, feedback: primaryFeedback, corrections, currentAngle: Math.round(angle), accuracyScore };
};
