import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicLayout from "./components/layout/PublicLayout";
import PatientLayout from "./components/layout/PatientLayout";
import PhysicianLayout from "./components/layout/PhysicianLayout";

// Public Pages
import LandingPage from "./pages/LandingPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import FeaturesPage from "./pages/FeaturesPage";
import AboutPage from "./pages/AboutPage";

// Auth Pages
import PatientLoginPage from "./pages/auth/PatientLoginPage";
import PatientRegisterPage from "./pages/auth/PatientRegisterPage";
import PhysicianLoginPage from "./pages/auth/PhysicianLoginPage";

// Patient Pages
import PatientHomePage from "./pages/patient/PatientHomePage";
import PatientAppointmentsPage from "./pages/patient/PatientAppointmentsPage";
import PatientMedicationsPage from "./pages/patient/PatientMedicationsPage";
import PatientTasksPage from "./pages/patient/PatientTasksPage";
import ChatPage from "./pages/ChatPage";

// Physician Pages
import PhysicianHomePage from "./pages/physician/PhysicianHomePage";
import PhysicianAvailabilityPage from "./pages/physician/PhysicianAvailabilityPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login/patient" element={<PatientLoginPage />} />
          <Route path="/register/patient" element={<PatientRegisterPage />} />
          <Route path="/login/physician" element={<PhysicianLoginPage />} />

          {/* Protected Patient Routes */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["PATIENT"]}
                redirectTo="/login/patient"
              />
            }
          >
            <Route path="/patient" element={<PatientLayout />}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<PatientHomePage />} />
              <Route
                path="appointments"
                element={<PatientAppointmentsPage />}
              />
              <Route path="medications" element={<PatientMedicationsPage />} />
              <Route path="tasks" element={<PatientTasksPage />} />
              <Route path="messages" element={<ChatPage />} />
            </Route>
          </Route>

          {/* Protected Physician Routes */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["DOCTOR", "ADMIN"]}
                redirectTo="/login/physician"
              />
            }
          >
            <Route path="/physician" element={<PhysicianLayout />}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<PhysicianHomePage />} />
              <Route path="availability" element={<PhysicianAvailabilityPage />} />
              <Route path="messages" element={<ChatPage />} />
              <Route
                path="appointments"
                element={
                  <div className="p-8">
                    Appointments Management (Coming Soon)
                  </div>
                }
              />
              <Route
                path="patients"
                element={
                  <div className="p-8">Patient Directory (Coming Soon)</div>
                }
              />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
