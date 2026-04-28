import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitialized = useAuthStore((s) => s.isInitialized)

  if (!isInitialized) return null
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}
