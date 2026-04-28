import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectPath?: string;
}

export function ProtectedRoute({ allowedRoles, redirectPath = "/login" }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Support both title-case and lower-case roles during mapping
  const matchesRole = allowedRoles ? allowedRoles.map(r => r.toLowerCase()).includes(role) : true;
  
  if (!matchesRole) {
    // If authenticated but wrong role, push to their appropriate dashboard home
    return <Navigate to={`/${role === 'doctor' ? 'physician' : role}`} replace />;
  }

  return <Outlet />;
}
