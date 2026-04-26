import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { PhysicianLayout } from "@/components/layouts/PhysicianLayout";
import { PhysicianDashboard } from "@/pages/physician/Dashboard";
import { Login } from "@/pages/auth/Login";

export function PhysicianRoutes() {
  return (
    <Routes>
      {/* Auth isolated from layout headers/footers */}
      <Route path="login" element={<Login />} />
      
      <Route element={<ProtectedRoute allowedRoles={["physician", "doctor"]} redirectPath="/physician/login" />}>
        <Route element={<PhysicianLayout />}>
          <Route path="/" element={<PhysicianDashboard />} />
          <Route path="*" element={<Navigate to="/physician" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
