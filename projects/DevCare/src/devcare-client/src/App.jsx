import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard'
import PatientList from './pages/doctor/PatientList'
import PatientDetail from './pages/doctor/PatientDetail'
import AssignTherapy from './pages/doctor/AssignTherapy'
import FeedbackReview from './pages/doctor/FeedbackReview'
import ShareConnection from './pages/doctor/ShareConnection'

// Patient Pages
import PatientDashboard from './pages/Patient/Dashboard'
import TherapySession from './pages/Patient/TherapySession'
import SessionResult from './pages/Patient/SessionResult'
import SessionDetail from './pages/Patient/SessionDetail'
import TherapyRoadmap from './pages/Patient/TherapyRoadmap'
import Progress from './pages/Patient/Progress'
import JoinDoctor from './pages/Patient/JoinDoctor'
import StartSession from './pages/Patient/StartSession'

const ACCESS_TOKEN_KEY = 'devcare_access_token'
const ROLE_KEY = 'devcare_role'

function getHomeRouteElement() {
  const isAuthenticated = Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))
  const role = (localStorage.getItem(ROLE_KEY) || 'patient').toLowerCase()

  if (!isAuthenticated) {
    return <LandingPage />
  }

  return (
    <Navigate
      to={role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient'}
      replace
    />
  )
}

import { ToastContainer } from 'react-toastify'

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={getHomeRouteElement()} />
        <Route path="/login" element={<AuthPage initialMode="login" />} />
        <Route path="/register" element={<AuthPage initialMode="register" />} />
        <Route path="/join/:token" element={<JoinDoctor />} />
        
        {/* Internal Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          
          {/* Doctor Routes */}
          <Route
            path="/dashboard/doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <PatientList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patient/:id"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <PatientDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/assign"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <AssignTherapy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/feedback/:patientId"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <FeedbackReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/share"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <ShareConnection />
              </ProtectedRoute>
            }
          />

          {/* Patient Routes */}
          <Route
            path="/dashboard/patient"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/therapy-session"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <TherapySession />
              </ProtectedRoute>
            }
          />
          <Route
            path="/start-session/:sessionId"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <StartSession />
              </ProtectedRoute>
            }
          />
          <Route
            path="/session-result"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <SessionResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/session-result/:sessionId"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <SessionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-sessions"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <TherapyRoadmap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <Progress />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
