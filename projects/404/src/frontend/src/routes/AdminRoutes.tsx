import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { Users } from "@/pages/admin/Users";
import { Specializations } from "@/pages/admin/Specializations";
import { Medicines } from "@/pages/admin/Medicines";
import { Profile } from "@/pages/shared/Profile";
import { Login } from "@/pages/auth/Login";

export function AdminRoutes() {
  return (
    <Routes>
      {/* Auth isolated from layout headers/footers */}
      <Route path="login" element={<Login />} />
      
      <Route element={<ProtectedRoute allowedRoles={["admin"]} redirectPath="/admin/login" />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/specializations" element={<Specializations />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
