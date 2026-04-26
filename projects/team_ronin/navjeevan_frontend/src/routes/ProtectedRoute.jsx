import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, role: storedRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (storedRole !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
