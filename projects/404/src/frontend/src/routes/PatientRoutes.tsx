import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { PatientLayout } from "@/components/layouts/PatientLayout";
import { PatientDashboard } from "@/pages/patient/Dashboard";
import { Chat } from "@/pages/patient/Chat";
import { Consultants } from "@/pages/patient/Consultants";
import { Medicines } from "@/pages/patient/Medicines";
import { Login } from "@/pages/auth/Login";
import { Signup } from "@/pages/auth/Signup";
import { Profile } from "@/pages/shared/Profile";
import { VideoConsultationPage } from "@/pages/shared/VideoConsultation";

export function PatientRoutes() {
  return (
    <Routes>
      {/* Auth isolated from layout headers/footers */}
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />

      {/* Video consultation is full-screen — rendered outside the layout shell */}
      <Route element={<ProtectedRoute allowedRoles={["patient"]} redirectPath="/patient/login" />}>
        <Route path="/consultation" element={<VideoConsultationPage />} />
        <Route path="/consultation/:appointmentId" element={<VideoConsultationPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["patient"]} redirectPath="/patient/login" />}>
        <Route element={<PatientLayout />}>
          <Route path="/" element={<PatientDashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/consultants" element={<Consultants />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/patient" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
