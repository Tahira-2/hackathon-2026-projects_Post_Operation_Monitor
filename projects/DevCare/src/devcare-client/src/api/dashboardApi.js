const API_BASE = 'http://localhost:8000/api'
const ACCESS_TOKEN_KEY = 'devcare_access_token'

function getAuthHeaders() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getDashboardStats() {
  const res = await fetch(`${API_BASE}/rehab/dashboard-stats/`, {
    headers: getAuthHeaders(),
  })

  if (!res.ok) {
    throw new Error('Failed to fetch dashboard stats')
  }

  return res.json()
}
