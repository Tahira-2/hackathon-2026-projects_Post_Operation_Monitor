import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/citizen/LoginPage';
import RegisterPage from './pages/citizen/RegisterPage';
import ActivatePage from './pages/citizen/ActivatePage';
import ForgotPasswordPage from './pages/citizen/ForgotPasswordPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './routes/ProtectedRoute';
const HCDashboardPage = lazy(() => import('./pages/healthcare/HCDashboardPage'));
const CitizenDashboard = lazy(() => import('./components/citizen/CitizenDashboard'));
const CommunityDashboard = lazy(() => import('./components/CommunityDashboard'));



function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 p-6 text-slate-200">Loading...</div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/community" element={<CommunityDashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/activate" element={<ActivatePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/healthcare/login" element={<Navigate to="/login" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="user">
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hc-dashboard"
          element={
            <ProtectedRoute role="healthcare">
              <HCDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
