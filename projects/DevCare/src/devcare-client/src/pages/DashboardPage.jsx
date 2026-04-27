import { Navigate } from 'react-router-dom'

const ROLE_KEY = 'devcare_role'

function DashboardPage() {
  const role = (localStorage.getItem(ROLE_KEY) || 'patient').toLowerCase()

  if (role === 'doctor') {
    return <Navigate to="/dashboard/doctor" replace />
  }

  return <Navigate to="/dashboard/patient" replace />
}

export default DashboardPage