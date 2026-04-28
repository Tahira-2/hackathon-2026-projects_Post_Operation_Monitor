import { useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { BurnoutLogin } from '../screens/BurnoutLogin';
import { BurnoutStatusCheck } from '../screens/BurnoutStatusCheck';
import { BurnoutDashboard } from '../screens/BurnoutDashboard';
import { SupervisorDashboard } from '../screens/SupervisorDashboard';
import { BurnoutCheckInPrep } from '../screens/BurnoutCheckInPrep';
import { BurnoutQuestionnaire } from '../screens/BurnoutQuestionnaire';
import { BurnoutCameraAccess } from '../screens/BurnoutCameraAccess';

const { buildRecentDateRange } = require('../../metrics/dateUtils');
const { createMetricsApiClient } = require('../../services/metricsApiClient');
const { createDemoMetricsApiClient } = require('../../services/demoMetricsApiClient');

const DEMO_WORKER_NAME = 'Magdalena';
const DEMO_SUPERVISOR_NAME = 'Dipan';
const DEMO_HIGH_RISK_SCORE = 82;

// Check for demo mode - check both runtime and build-time env vars
const isDemo = process.env.EXPO_PUBLIC_DEMO_MODE === '1' || process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

type AppState =
  | 'login'
  | 'statusCheck'
  | 'dashboard'
  | 'supervisorDashboard'
  | 'checkInPrep'
  | 'questionnaire'
  | 'cameraAccess';

export default function AppFlow() {
  const [appState, setAppState] = useState<AppState>('login');
  const [workerId] = useState('worker-demo');
  const [burnoutScoreResult, setBurnoutScoreResult] = useState<any>(null);
  const [faceScanResult, setFaceScanResult] = useState<any>(null);
  const [faceScanError, setFaceScanError] = useState('');
  const [isAnalyzingFaceScan, setIsAnalyzingFaceScan] = useState(false);
  const demoMode = isDemo;
  const metricsApiClient = useMemo(
    () =>
      demoMode
        ? createDemoMetricsApiClient()
        : createMetricsApiClient({ platform: Platform.OS }),
    [demoMode]
  );

  function normalizeDemoResult(result: any) {
    if (!demoMode || result?.burnout_score?.risk_tier === 'high') {
      return result;
    }

    return {
      ...result,
      facial_fatigue: {
        ...(result?.facial_fatigue ?? {}),
        score: Math.max(result?.facial_fatigue?.score ?? 0, 74),
        risk_tier: 'high',
      },
      burnout_score: {
        ...(result?.burnout_score ?? {}),
        worker_id: workerId,
        burnout_score: Math.max(result?.burnout_score?.burnout_score ?? 0, DEMO_HIGH_RISK_SCORE),
        risk_tier: 'high',
      },
    };
  }

  async function handleAnalyzeFaceScan(photoPayload: any) {
    setFaceScanError('');
    setIsAnalyzingFaceScan(true);
    setAppState('statusCheck');

    try {
      const { startDate, endDate } = buildRecentDateRange(7);
      const result = await metricsApiClient.analyzeFaceScanAndScore(
        workerId,
        startDate,
        endDate,
        photoPayload
      );

      const displayResult = normalizeDemoResult(result);
      setFaceScanResult(displayResult);
      setBurnoutScoreResult(displayResult.burnout_score);
      return displayResult;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown face scan error';
      setFaceScanError(`Face scan failed: ${message}`);
      return null;
    } finally {
      setIsAnalyzingFaceScan(false);
    }
  }

  if (appState === 'login') {
    return (
      <BurnoutLogin
        onLogin={(role: string) => {
          if (role === 'Supervisor') {
            setAppState('supervisorDashboard');
          } else {
            setAppState('dashboard');
          }
        }}
      />
    );
  }

  if (appState === 'statusCheck') {
    return (
      <BurnoutStatusCheck
        isAnalyzing={isAnalyzingFaceScan}
        errorMessage={faceScanError}
        onRetry={() => setAppState('cameraAccess')}
        onSkip={() => setAppState('dashboard')}
        onComplete={() => setAppState('dashboard')}
      />
    );
  }

  if (appState === 'supervisorDashboard') {
    return (
      <SupervisorDashboard
        supervisorName={DEMO_SUPERVISOR_NAME}
        workerName={DEMO_WORKER_NAME}
        burnoutScoreResult={burnoutScoreResult}
        faceScanResult={faceScanResult}
        onLogout={() => setAppState('login')}
      />
    );
  }

  if (appState === 'checkInPrep') {
    return <BurnoutCheckInPrep onComplete={() => setAppState('questionnaire')} />;
  }

  if (appState === 'questionnaire') {
    return (
      <BurnoutQuestionnaire
        onComplete={() => setAppState('cameraAccess')}
        onBack={() => setAppState('dashboard')}
      />
    );
  }

  if (appState === 'cameraAccess') {
    return (
      <BurnoutCameraAccess
        onAnalyzeFaceScan={handleAnalyzeFaceScan}
        onSkip={() => setAppState('dashboard')}
        onBack={() => setAppState('questionnaire')}
      />
    );
  }

  return (
    <BurnoutDashboard
      workerName={DEMO_WORKER_NAME}
      burnoutScoreResult={burnoutScoreResult}
      faceScanResult={faceScanResult}
      onStartCheckIn={() => setAppState('checkInPrep')}
      onLogout={() => setAppState('login')}
    />
  );
}
