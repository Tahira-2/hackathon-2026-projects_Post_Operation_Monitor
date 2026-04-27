import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Play, Square, Volume2, Settings } from 'lucide-react'
import Webcam from 'react-webcam';
// MediaPipe globals from index.html

import { usePose } from '../../hooks/usePose';
import {
  evaluateBicepCurl,
  evaluateSquat,
  evaluateShoulderRaise,
  evaluateKneeExtension,
  evaluateHipAbduction
} from '../../utils/exerciseEvaluators';
import { generateBodyEvaluation } from '../../utils/bodyEvaluation';
import SessionReport from '../../components/SessionReport';
import { toastSuccess } from '../../utils/toast';

const USERNAME_KEY = 'devcare_username'
const ACCESS_TOKEN_KEY = 'devcare_access_token'
const REFRESH_TOKEN_KEY = 'devcare_refresh_token'
const ROLE_KEY = 'devcare_role'

const EVALUATOR_MAP = {
  'Bicep Curl': evaluateBicepCurl,
  'Squat': evaluateSquat,
  'Shoulder Raise': evaluateShoulderRaise,
  'Knee Extension': evaluateKneeExtension,
  'Hip Abduction': evaluateHipAbduction,
};

function TherapySessionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const assignedPlan = location.state?.plan;

  const username = localStorage.getItem(USERNAME_KEY)

  function handleLogout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)
    localStorage.removeItem(ROLE_KEY)
    navigate('/')
  }

  // State
  const [plan, setPlan] = useState(assignedPlan || null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const [exerciseState, setExerciseState] = useState({
    reps: 0,
    stage: 'down',
    feedback: 'Get ready',
    currentAngle: 0
  });
  const [results, setResults] = useState([]); // Array to store final results
  const [timeElapsed, setTimeElapsed] = useState(0);

  const [angleHistory, setAngleHistory] = useState({
    arms: [], shoulders: [], hips: [], knees: [], ankles: []
  });
  const [bodyEvaluation, setBodyEvaluation] = useState(null);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const exerciseStateRef = useRef(exerciseState);
  const angleHistoryRef = useRef(angleHistory);
  const sessionActiveRef = useRef(sessionActive);
  const currentExerciseRef = useRef(currentExercise);
  const handleExerciseCompleteRef = useRef();

  // Sync state to ref for access in onResults callback without re-binding
  useEffect(() => {
    currentExerciseRef.current = currentExercise;
  }, [currentExercise]);

  // Sync state to ref for access in onResults callback without re-binding
  useEffect(() => {
    exerciseStateRef.current = exerciseState;
  }, [exerciseState]);

  useEffect(() => {
    angleHistoryRef.current = angleHistory;
  }, [angleHistory]);

  useEffect(() => {
    sessionActiveRef.current = sessionActive;
  }, [sessionActive]);

  // Mock Fetch Plan if not assigned via location state
  useEffect(() => {
    if (!plan) {
      setPlan({
        id: '123',
        name: "Daily Shoulder & Leg Routine",
        exercises: [
          { exercise: { name: 'Bicep Curl', description: 'Keep your elbows close to your torso.' }, target_reps: 5 },
          { exercise: { name: 'Squat', description: 'Keep your back straight and go low.' }, target_reps: 5 },
          { exercise: { name: 'Shoulder Raise', description: 'Raise arms parallel to floor.' }, target_reps: 5 }
        ]
      });
    }
  }, [plan]);

  const currentExerciseData = plan?.exercises?.[currentExerciseIndex];
  const currentExercise = currentExerciseData ? {
    name: currentExerciseData.exercise?.name || currentExerciseData.name,
    targetReps: currentExerciseData.target_reps || currentExerciseData.targetReps,
    instructions: currentExerciseData.exercise?.description || currentExerciseData.instructions || 'Follow the correct form.'
  } : null;

  useEffect(() => {
    let interval;
    if (sessionActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else if (!sessionActive && timeElapsed !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [sessionActive, timeElapsed]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    handleExerciseCompleteRef.current = () => {
      setSessionActive(false); // Pause detection briefly

      // Save Result
      setResults(prev => [...prev, {
        name: currentExercise?.name || 'Exercise',
        reps: exerciseStateRef.current.reps,
        accuracy: 95, // mock accuracy
        duration: timeElapsed
      }]);

      if (plan && currentExerciseIndex < plan.exercises.length - 1) {
        // Move to next
        setCurrentExerciseIndex(prev => prev + 1);
        setExerciseState({ reps: 0, stage: 'down', feedback: 'Get ready', currentAngle: 0 });
      } else {
        // Session Complete
        const evaluation = generateBodyEvaluation(angleHistoryRef.current);
        setBodyEvaluation(evaluation);
        setSessionCompleted(true);
      }
    };
  }, [currentExercise, currentExerciseIndex, plan, timeElapsed]);

  // Pose Results Callback
  const onResults = useCallback((resultsMediaPipe) => {
    console.log("onResults called with landmarks:", !!resultsMediaPipe.poseLandmarks);
    if (!canvasRef.current || !webcamRef.current?.video) return;

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasCtx = canvasRef.current.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, videoWidth, videoHeight);

    // Draw the video frame
    canvasCtx.drawImage(resultsMediaPipe.image, 0, 0, videoWidth, videoHeight);

    if (resultsMediaPipe.poseLandmarks && currentExerciseRef.current) {
      // Draw skeleton
      window.drawConnectors(canvasCtx, resultsMediaPipe.poseLandmarks, window.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
      window.drawLandmarks(canvasCtx, resultsMediaPipe.poseLandmarks, { color: '#FF0000', lineWidth: 2 });

      // Evaluate exercise
      const evaluator = EVALUATOR_MAP[currentExerciseRef.current.name];
      if (evaluator && sessionActiveRef.current) {
        const newState = evaluator(resultsMediaPipe.poseLandmarks, exerciseStateRef.current);

        // Track angles based on exercise
        const angle = newState.currentAngle;
        if (angle) {
          const newHistory = { ...angleHistoryRef.current };
          const exerciseName = currentExerciseRef.current.name;
          if (exerciseName === 'Bicep Curl') newHistory.arms.push(angle);
          if (exerciseName === 'Shoulder Raise') newHistory.shoulders.push(angle);
          if (exerciseName === 'Squat') {
            newHistory.hips.push(angle);
            newHistory.knees.push(angle);
          }
          if (exerciseName === 'Knee Extension') newHistory.knees.push(angle);
          if (exerciseName === 'Hip Abduction') newHistory.hips.push(angle);

          setAngleHistory(newHistory);
        }

        // Update state if something changed (avoid excessive renders)
        if (
          newState.reps !== exerciseStateRef.current.reps ||
          newState.stage !== exerciseStateRef.current.stage ||
          newState.feedback !== exerciseStateRef.current.feedback
        ) {
          setExerciseState(newState);

          // Check if target reps reached
          if (newState.reps >= currentExerciseRef.current.targetReps) {
            handleExerciseCompleteRef.current();
          }
        }
      }
    }
    canvasCtx.restore();
  }, []); // Stable callback

  const { pose, isLoaded } = usePose(onResults);

  // Animation Loop for camera
  const detectPose = useCallback(async () => {
    if (
      webcamRef.current?.video?.readyState === 4 &&
      pose
    ) {
      try {
        await pose.send({ image: webcamRef.current.video });
      } catch (err) {
        console.error("Pose send error:", err);
      }
    } else {
      console.log("Webcam not ready or pose missing", {
        ready: webcamRef.current?.video?.readyState,
        hasPose: !!pose
      });
    }

    if (sessionActiveRef.current) {
      requestRef.current = requestAnimationFrame(detectPose);
    }
  }, [pose]);

  useEffect(() => {
    if (sessionActive) {
      requestRef.current = requestAnimationFrame(detectPose);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [sessionActive, detectPose]);

  const submitSessionReport = async () => {
    const report = {
      exercise_results: results,
      ...bodyEvaluation
    };
    console.log("Submitting report to backend:", report);
    toastSuccess("Session report submitted successfully!");
    navigate('/session-result');
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard/patient')} className="rounded-lg p-2 hover:bg-[var(--color-surface)]">
          <ArrowLeft className="h-6 w-6 text-[var(--color-text)]" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">{plan?.name || plan?.title || "Therapy Session"}</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{plan?.exercises?.length || 0} exercises • Intermediate</p>
        </div>
      </div>

      {/* Main Content Grid */}
      {!sessionCompleted ? (
        <div className="mb-12 grid gap-8 lg:grid-cols-3">
          {/* Left Side - Camera Feed */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-[var(--color-border)] bg-black p-0 shadow-sm overflow-hidden">
              {/* Camera Feed Placeholder */}
              <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  className="absolute w-full h-full object-cover"
                  mirrored={true}
                  onUserMedia={() => console.log("Webcam started")}
                  onUserMediaError={(err) => console.error("Webcam error:", err)}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute w-full h-full object-cover z-10"
                  style={{ transform: 'scaleX(-1)' }} // Mirror canvas to match webcam
                />

                {!sessionActive && (
                  <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
                    <div className="bg-white/10 p-6 rounded-full backdrop-blur-md mb-4">
                      <Play className="h-12 w-12 text-white opacity-80" />
                    </div>
                    <p className="text-white font-medium">Ready to start?</p>
                    <p className="text-white/60 text-sm mt-1">Position yourself in the center of the frame</p>
                  </div>
                )}

                {/* Status Indicators */}
                <div className="absolute top-4 right-4 space-y-2 z-20">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 text-white ${sessionActive ? 'bg-green-500 bg-opacity-80' : 'bg-red-500 bg-opacity-80'}`}>
                    <div className={`h-2 w-2 bg-white rounded-full ${sessionActive ? 'animate-pulse' : ''}`}></div>
                    {sessionActive ? 'Tracking Active' : 'Camera Paused'}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-[var(--color-surface)] p-6 border-t border-[var(--color-border)]">
                <div className="flex gap-3">
                  {!sessionActive ? (
                    <button
                      onClick={() => setSessionActive(true)}
                      disabled={!isLoaded}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Play className="h-4 w-4" />
                      {isLoaded ? 'Start Session' : 'Initializing AI...'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setSessionActive(false)}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2 border-red-500 text-red-500 hover:bg-red-50"
                    >
                      <Square className="h-4 w-4" />
                      Pause
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to skip this exercise?')) {
                        handleExerciseCompleteRef.current();
                      }
                    }}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2"
                  >
                    Skip Exercise
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Exercise Info & Feedback */}
          <div className="space-y-6">
            {/* Exercise Details */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <h3 className="font-semibold text-[var(--color-text)] mb-4">Exercise Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Current Exercise</p>
                  <p className="mt-1 text-lg font-bold text-[var(--color-primary)]">{currentExercise?.name || 'Loading...'}</p>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">{currentExercise?.instructions}</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-[var(--color-text-muted)]">Target Reps</p>
                    <p className="mt-1 text-lg font-bold text-[var(--color-primary)]">{currentExercise?.targetReps}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[var(--color-text-muted)]">Exercise</p>
                    <p className="mt-1 text-lg font-bold text-[var(--color-accent)]">{currentExerciseIndex + 1} of {plan?.exercises?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Feedback */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-6">
              <h3 className="font-semibold text-[var(--color-text)] mb-4">Live Feedback</h3>
              <div className={`rounded-lg p-4 text-center border border-[var(--color-border)] transition-colors duration-300 ${exerciseState.feedback === 'Good form' ? 'bg-green-50 border-green-200' :
                  exerciseState.feedback === 'Get ready' ? 'bg-white' : 'bg-yellow-50 border-yellow-200'
                }`}>
                <p className={`text-sm font-semibold ${exerciseState.feedback === 'Good form' ? 'text-green-700' :
                    exerciseState.feedback === 'Get ready' ? 'text-[var(--color-text-muted)]' : 'text-yellow-700'
                  }`}>
                  {exerciseState.feedback}
                </p>
              </div>
            </div>

            {/* Session Stats */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <h3 className="font-semibold text-[var(--color-text)] mb-4">Session Stats</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Time Elapsed</p>
                  <p className="mt-1 text-lg font-bold text-[var(--color-text)]">{formatTime(timeElapsed)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Reps Completed</p>
                  <p className="mt-1 text-3xl font-bold text-[var(--color-primary)]">{exerciseState.reps} <span className="text-lg text-[var(--color-text-muted)]">/ {currentExercise?.targetReps}</span></p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Phase</p>
                  <p className="mt-1 text-lg font-bold text-[var(--color-success)] capitalize">{exerciseState.stage}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-12">
          <SessionReport
            results={results}
            bodyEvaluation={bodyEvaluation}
            onSubmit={submitSessionReport}
          />
        </div>
      )}
    </div>
  )
}

export default TherapySessionPage
