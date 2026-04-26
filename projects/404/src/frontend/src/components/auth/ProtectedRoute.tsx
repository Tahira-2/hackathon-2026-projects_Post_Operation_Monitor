import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Role } from '../../types/auth.types';

interface ProtectedRouteProps {
  allowedRoles: Role[];
  redirectTo: string;
}

export default function ProtectedRoute({ allowedRoles, redirectTo }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If authenticated but wrong role, redirect to appropriate home
    return <Navigate to={user.role === 'PATIENT' ? '/patient/home' : '/physician/home'} replace />;
  }

  return <Outlet />;
}
