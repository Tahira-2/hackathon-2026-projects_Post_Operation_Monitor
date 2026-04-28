import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { PhysicianLayout } from "@/components/layouts/PhysicianLayout";
import { PhysicianDashboard } from "@/pages/physician/Dashboard";
import { Login } from "@/pages/auth/Login";
import { Appointments } from "@/pages/physician/Appointments";
import { Availability } from "@/pages/physician/Availability";
import { Profile } from "@/pages/shared/Profile";
import { Chat } from "@/pages/physician/Chat";
import { VideoConsultationPage } from "@/pages/shared/VideoConsultation";

export function PhysicianRoutes() {
  return (
    <Routes>
      {/* Auth isolated from layout headers/footers */}
      <Route path="login" element={<Login />} />

      {/* Video consultation is full-screen — rendered outside the layout shell */}
      <Route element={<ProtectedRoute allowedRoles={["physician", "doctor"]} redirectPath="/physician/login" />}>
        <Route path="/consultation" element={<VideoConsultationPage />} />
        <Route path="/consultation/:appointmentId" element={<VideoConsultationPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["physician", "doctor"]} redirectPath="/physician/login" />}>
        <Route element={<PhysicianLayout />}>
          <Route path="/" element={<PhysicianDashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/physician" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

