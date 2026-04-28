const API_BASE = 'http://localhost:8000/api'

function getAuthHeaders() {
  const token = localStorage.getItem('devcare_access_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

/**
 * Doctor: Fetch all available exercises
 */
export async function getExercises() {
  const res = await fetch(`${API_BASE}/rehab/exercises/`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch exercises')
  return res.json()
}

/**
 * Doctor: Assign a new therapy plan to a patient
 */
export async function createRehabPlan(planData) {
  const res = await fetch(`${API_BASE}/rehab/plans/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(planData),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to create plan')
  return data
}

/**
 * Patient: Fetch all plans assigned to me
 */
export async function getMyPlans() {
  const res = await fetch(`${API_BASE}/rehab/plans/my/`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch plans')
  return res.json()
}

/**
 * Patient: Start a session for a plan
 */
export async function startSession(planId) {
  const res = await fetch(`${API_BASE}/rehab/sessions/start/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ plan_id: planId }),
  })
  if (!res.ok) throw new Error('Failed to start session')
  return res.json()
}

/**
 * Patient: Complete a session and submit report
 */
export async function completeSession(sessionId, reportData) {
  const res = await fetch(`${API_BASE}/rehab/sessions/${sessionId}/complete/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(reportData),
  })
  if (!res.ok) throw new Error('Failed to complete session')
  return res.json()
}

/**
 * Patient: Fetch my completed session history
 */
export async function getSessionHistory() {
  const res = await fetch(`${API_BASE}/rehab/sessions/history/`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch session history')
  return res.json()
}

/**
 * Fetch detailed analytics for a specific session
 */
export async function getSessionDetail(sessionId) {
  const res = await fetch(`${API_BASE}/rehab/sessions/${sessionId}/`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch session details')
  return res.json()
}

/**
 * Doctor: Fetch all sessions for a specific patient
 */
export async function getPatientSessions(patientId) {
  const res = await fetch(`${API_BASE}/rehab/patient-sessions/${patientId}/`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch patient sessions')
  return res.json()
}

/**
 * Doctor: Submit feedback for a patient session
 */
export async function submitFeedback(payload) {
  const res = await fetch(`${API_BASE}/rehab/feedback/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData.detail || 'Failed to submit feedback')
  }
  
  return res.json()
}

/**
 * Fetch detailed information about a specific rehab plan
 */
export async function getPlanDetail(planId) {
  const res = await fetch(`${API_BASE}/rehab/plans/${planId}/`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch plan details')
  return res.json()
}
