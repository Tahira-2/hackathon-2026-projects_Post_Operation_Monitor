const API_BASE = 'http://localhost:8000/api'

function getAuthHeaders() {
  const token = localStorage.getItem('devcare_access_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

/**
 * Doctor: Create a join link (with optional slug and expiry)
 * POST /api/connections/create-join-link/
 */
export async function createJoinLink({ slug = '', expires_at = null } = {}) {
  const body = {}
  if (slug) body.slug = slug
  if (expires_at) body.expires_at = expires_at

  const res = await fetch(`${API_BASE}/connections/create-join-link/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to create join link')
  }
  return data // { link, token, qr_code }
}

/**
 * Patient: Join a doctor via token
 * GET /api/connections/join/<token>/
 */
export async function joinDoctor(token) {
  const res = await fetch(`${API_BASE}/connections/join/${token}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to join doctor')
  }
  return data // { detail: "Successfully connected..." }
}

/**
 * Doctor: Get list of connected patients
 * GET /api/connections/my-patients/
 */
export async function getMyPatients() {
  const res = await fetch(`${API_BASE}/connections/my-patients/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to fetch patients')
  }
  return data // [{ id, name, username, email, connected_at }, ...]
}
