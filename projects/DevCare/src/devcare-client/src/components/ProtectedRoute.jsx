import { Navigate } from 'react-router-dom'

const ACCESS_TOKEN_KEY = 'devcare_access_token'
const ROLE_KEY = 'devcare_role'

function ProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))
  const role = (localStorage.getItem(ROLE_KEY) || 'patient').toLowerCase()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const fallbackPath = role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient'
    return <Navigate to={fallbackPath} replace />
  }

  return children
}

export default ProtectedRoute
