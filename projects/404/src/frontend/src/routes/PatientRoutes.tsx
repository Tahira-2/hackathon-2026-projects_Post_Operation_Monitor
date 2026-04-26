import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { PatientLayout } from "@/components/layouts/PatientLayout";
import { PatientDashboard } from "@/pages/patient/Dashboard";
import { Login } from "@/pages/auth/Login";
import { Signup } from "@/pages/auth/Signup";

export function PatientRoutes() {
  return (
    <Routes>
      {/* Auth isolated from layout headers/footers */}
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      
      <Route element={<ProtectedRoute allowedRoles={["patient"]} redirectPath="/patient/login" />}>
        <Route element={<PatientLayout />}>
          <Route path="/" element={<PatientDashboard />} />
          <Route path="*" element={<Navigate to="/patient" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
