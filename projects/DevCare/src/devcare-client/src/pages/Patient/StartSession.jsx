import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Play, Square, Volume2, VolumeX, Settings } from 'lucide-react'
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
import { toastSuccess, toastError } from '../../utils/toast';

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

export default function StartSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate()
  const location = useLocation()
  const assignedPlan = location.state?.plan;
  
  // State
  const [plan, setPlan] = useState(assignedPlan || null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  
  const [exerciseState, setExerciseState] = useState({
    reps: 0,
    stage: 'down',
    feedback: 'Get ready',
    corrections: [],
    currentAngle: 0,
    accuracyScore: 100
  });
  
  const [motivation, setMotivation] = useState("");
  const [currentTip, setCurrentTip] = useState("Control both up and down motion");
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
  const sessionCompletedRef = useRef(sessionCompleted);
  const currentExerciseRef = useRef(null);
  const handleExerciseCompleteRef = useRef();
  const isCompletingRef = useRef(false);

  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const lastSpokenRef = useRef('');
  const lastSpokenTimeRef = useRef(0);

  const speak = useCallback((text, force = false) => {
    if (!window.speechSynthesis || !voiceEnabled) return;
    
    // Check cooldown unless forced (e.g. for motivation)
    const now = Date.now();
    const FEEDBACK_COOLDOWN = 5000;
    
    if (!force && text === lastSpokenRef.current && now - lastSpokenTimeRef.current < FEEDBACK_COOLDOWN) {
      return;
    }

    console.log("AI Speaking:", text);
    window.speechSynthesis.cancel(); // stop previous
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'en-US';

    window.speechSynthesis.speak(utterance);
    
    lastSpokenRef.current = text;
    lastSpokenTimeRef.current = now;
  }, [voiceEnabled]);

  // Use a ref for speak to keep onResults stable but use latest speak logic
  const speakRef = useRef(speak);
  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  // Stop speech on pause/end
  useEffect(() => {
    if (!sessionActive && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [sessionActive]);

  useEffect(() => {
    exerciseStateRef.current = exerciseState;
  }, [exerciseState]);

  useEffect(() => {
    angleHistoryRef.current = angleHistory;
  }, [angleHistory]);

  useEffect(() => {
    sessionActiveRef.current = sessionActive;
  }, [sessionActive]);

  useEffect(() => {
    sessionCompletedRef.current = sessionCompleted;
  }, [sessionCompleted]);

  // Mock Fetch Plan if not assigned via location state
  useEffect(() => {
    if (!plan) {
      setPlan({
        id: sessionId || '123',
        name: "Daily Shoulder & Leg Routine",
        exercises: [
          { exercise: { name: 'Bicep Curl', description: 'Keep your elbows close to your torso.' }, target_reps: 5 },
          { exercise: { name: 'Squat', description: 'Keep your back straight and go low.' }, target_reps: 5 },
          { exercise: { name: 'Shoulder Raise', description: 'Raise arms parallel to floor.' }, target_reps: 5 }
        ]
      });
    }
  }, [plan, sessionId]);

  const currentExerciseData = plan?.exercises?.[currentExerciseIndex];
  const currentExercise = currentExerciseData ? {
    name: currentExerciseData.exercise?.name || currentExerciseData.name,
    targetReps: currentExerciseData.target_reps || currentExerciseData.targetReps,
    instructions: currentExerciseData.exercise?.description || currentExerciseData.instructions || 'Follow the correct form.'
  } : null;

  useEffect(() => {
    currentExerciseRef.current = currentExercise;
  }, [currentExercise]);

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

  // Tip Rotation System
  useEffect(() => {
    if (!sessionActive) return;
    const tipsList = [
      "Breathe steadily",
      "Control both up and down motion",
      "Avoid jerky movement",
      "Focus on the muscle contraction",
      "Keep your core engaged"
    ];
    let idx = 0;
    const tipInterval = setInterval(() => {
      idx = (idx + 1) % tipsList.length;
      setCurrentTip(tipsList[idx]);
    }, 6000);
    return () => clearInterval(tipInterval);
  }, [sessionActive]);

  // Motivation Engine
  useEffect(() => {
    if (exerciseState.reps > 0 && exerciseState.reps % 3 === 0) {
      const msgs = ["Great job! 💪", "Halfway there! 🔥", "Keep pushing! 🚀", "Excellent pace! ⚡"];
      const chosen = msgs[Math.floor(Math.random() * msgs.length)];
      setMotivation(chosen);
      speakRef.current("Good job, keep going!", true);
      
      const timeout = setTimeout(() => setMotivation(""), 3000);
      return () => clearTimeout(timeout);
    }
    
    if (currentExerciseRef.current && exerciseState.reps > 0 && exerciseState.reps === currentExerciseRef.current.targetReps - 1) {
      speakRef.current("Last rep, finish strong!", true);
    }
  }, [exerciseState.reps]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    handleExerciseCompleteRef.current = () => {
      if (isCompletingRef.current) return;
      isCompletingRef.current = true;

      // Save Result
      setResults(prev => [...prev, {
        name: currentExercise?.name || 'Exercise',
        reps: exerciseStateRef.current.reps,
        accuracy: 95, // mock accuracy
        duration: timeElapsed
      }]);

      if (plan && currentExerciseIndex < plan.exercises.length - 1) {
        // Add small delay between exercises
        setExerciseState({ reps: 0, stage: 'down', feedback: 'Switching exercise...', corrections: [], currentAngle: 0, accuracyScore: 100 });
        setMotivation("Exercise Complete! Get ready for the next one.");
        
        setTimeout(() => {
          setCurrentExerciseIndex(prev => prev + 1);
          setExerciseState({ reps: 0, stage: 'down', feedback: 'Get ready', corrections: [], currentAngle: 0, accuracyScore: 100 });
          setMotivation("");
          setTimeElapsed(0);
          isCompletingRef.current = false;
        }, 1500);
      } else {
        // Session Complete
        setSessionActive(false);
        const evaluation = generateBodyEvaluation(angleHistoryRef.current);
        setBodyEvaluation(evaluation);
        setSessionCompleted(true);
      }
    };
  }, [currentExercise, currentExerciseIndex, plan, timeElapsed]);

  // Pose Results Callback
  const onResults = useCallback((resultsMediaPipe) => {
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
          newState.feedback !== exerciseStateRef.current.feedback ||
          JSON.stringify(newState.corrections) !== JSON.stringify(exerciseStateRef.current.corrections) ||
          Math.abs(newState.currentAngle - exerciseStateRef.current.currentAngle) > 2 ||
          newState.accuracyScore !== exerciseStateRef.current.accuracyScore
        ) {
          setExerciseState(newState);

          // Audio Coaching Logic
          const highSeverityCorr = newState.corrections?.find(c => c.severity === 'high');
          if (highSeverityCorr) {
            speakRef.current(`Fix this: ${highSeverityCorr.feedback}`, true);
          } else if (newState.corrections?.length > 0) {
            speakRef.current(newState.corrections[0].feedback);
          } else if (newState.feedback !== exerciseStateRef.current.feedback) {
            speakRef.current(newState.feedback);
          }

          // Check if target reps reached
          if (!sessionCompletedRef.current && newState.reps >= currentExerciseRef.current.targetReps) {
            if (exerciseStateRef.current.feedback !== 'Switching exercise...') {
              handleExerciseCompleteRef.current();
            }
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
    }

    if (sessionActiveRef.current) {
      requestRef.current = requestAnimationFrame(detectPose);
    }
  }, [pose]);

  useEffect(() => {
    if (sessionActive) {
      requestRef.current = requestAnimationFrame(detectPose);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [sessionActive, detectPose]);

  const submitSessionReport = async () => {
    const report = {
      exercise_results: results,
      ...bodyEvaluation
    };
    console.log("Submitting report to backend:", report);
    try {
      const { completeSession } = await import('../../api/rehabApi');
      await completeSession(sessionId, report);
      toastSuccess("Session report submitted successfully!");
      navigate('/session-result');
    } catch (err) {
      console.error("Failed to submit session report:", err);
      toastError("Failed to submit report. Please try again.");
      navigate('/session-result');
    }
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
                      {/* Floating Feedback Badge */}
                      {sessionActive && exerciseState.feedback && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-xl text-sm z-20 flex items-center gap-2 whitespace-nowrap shadow-lg">
                          {exerciseState.corrections?.length > 0 ? '⚠️' : '✅'} {exerciseState.corrections?.length > 0 ? exerciseState.corrections[0].feedback : exerciseState.feedback}
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="bg-[var(--color-surface)] p-4 border-t border-[var(--color-border)]">
                      <div className="flex gap-3">
                        {!sessionActive ? (
                          <button 
                            onClick={() => {
                              // Unlock speech synthesis on user interaction
                              if (window.speechSynthesis) {
                                const u = new SpeechSynthesisUtterance("");
                                window.speechSynthesis.speak(u);
                              }
                              setSessionActive(true);
                            }}
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
                            if(window.confirm('Are you sure you want to skip this exercise?')) {
                              handleExerciseCompleteRef.current();
                            }
                          }}
                          className="flex-1 btn-secondary flex items-center justify-center gap-2"
                        >
                          Skip Exercise
                        </button>
                        <button
                          onClick={() => setVoiceEnabled(prev => !prev)}
                          className={`btn-secondary !p-3 rounded-xl flex items-center justify-center ${voiceEnabled ? 'text-blue-500' : 'text-slate-400'}`}
                          title={voiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
                        >
                          {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Exercise Info & Feedback */}
                <div className="space-y-4">
                  {/* Exercise Details */}
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
                    <h3 className="text-base font-semibold text-[var(--color-text)] mb-3">Exercise Details</h3>
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

                  {/* Real-time Feedback & Coaching */}
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4 shadow-sm">
                    <h3 className="text-base font-semibold text-[var(--color-text)] mb-3">Live Coaching</h3>
                    
                    {/* Primary Feedback */}
                    <div className={`rounded-xl p-3 text-center border-2 transition-all duration-300 shadow-sm mb-3 ${
                      exerciseState.feedback === 'Good form' ? 'bg-green-50 border-green-400 text-green-700' : 
                      exerciseState.feedback === 'Get ready' ? 'bg-white border-slate-200 text-slate-500' : 'bg-amber-50 border-amber-400 text-amber-700'
                    }`}>
                      <p className="text-lg font-extrabold tracking-tight">
                        {exerciseState.feedback}
                      </p>
                      
                      {/* Form Corrections Array */}
                      {exerciseState.corrections?.length > 0 && (
                        <div className="mt-2 text-left">
                           <ul className="space-y-1">
                              {exerciseState.corrections.map((corr, idx) => (
                                <li key={idx} className="flex items-start gap-1.5 text-xs font-semibold text-amber-800">
                                   <span className="text-amber-500 mt-0.5">⚠️</span> {corr.feedback}
                                </li>
                              ))}
                           </ul>
                        </div>
                      )}
                    </div>

                    {/* Angle & Accuracy Dashboard */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                       <div className="bg-white rounded-xl p-2 border border-slate-200 text-center shadow-sm">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Angle</p>
                          <p className="text-xl font-black text-slate-700 mt-0.5">{exerciseState.currentAngle || 0}°</p>
                       </div>
                       <div className="bg-white rounded-xl p-2 border border-slate-200 text-center shadow-sm relative overflow-hidden">
                          <div 
                             className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-300"
                             style={{ width: `${exerciseState.accuracyScore}%` }}
                          ></div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Accuracy</p>
                          <p className="text-xl font-black text-blue-600 mt-0.5">{exerciseState.accuracyScore || 0}%</p>
                       </div>
                    </div>

                    {/* Motivation Banner */}
                    <div className="h-8">
                       {motivation && (
                          <div className="animate-in slide-in-from-bottom-2 fade-in bg-blue-600 text-white font-bold rounded-lg py-1.5 px-3 text-xs text-center shadow-md">
                             {motivation}
                          </div>
                       )}
                    </div>

                    {/* Rotating Tip */}
                    <div className="mt-1 pt-3 border-t border-slate-200/50">
                       <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                          Tip: {currentTip}
                       </p>
                    </div>
                  </div>

                  {/* Session Stats */}
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
                    <h3 className="text-base font-semibold text-[var(--color-text)] mb-3">Session Stats</h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Time</p>
                        <p className="text-sm font-black text-slate-700 mt-0.5">{formatTime(timeElapsed)}</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-2 border border-blue-100">
                        <p className="text-[10px] uppercase font-bold text-blue-400">Reps</p>
                        <p className="text-sm font-black text-blue-600 mt-0.5">{exerciseState.reps}/{currentExercise?.targetReps}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-2 border border-emerald-100">
                        <p className="text-[10px] uppercase font-bold text-emerald-500">Stage</p>
                        <p className="text-sm font-black text-emerald-700 mt-0.5 capitalize">{exerciseState.stage}</p>
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
