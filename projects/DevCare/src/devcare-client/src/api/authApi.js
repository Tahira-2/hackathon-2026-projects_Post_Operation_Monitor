const API_BASE = 'http://localhost:8000/api'
const ACCESS_TOKEN_KEY = 'devcare_access_token'
const REFRESH_TOKEN_KEY = 'devcare_refresh_token'
const AVATAR_URL_KEY = 'devcare_avatar_url'

function getAuthHeaders() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}
}

function storeAccessToken(access) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access)
}

async function refreshAccessToken() {
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY)

  if (!refresh) {
    return null
  }

  const res = await fetch(`${API_BASE}/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })

  const data = await res.json()

  if (!res.ok || !data?.access) {
    return null
  }

  storeAccessToken(data.access)
  return data.access
}

async function authenticatedFetch(url, options = {}, retry = true) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...getAuthHeaders(),
    },
  })

  if (response.status !== 401 || !retry) {
    return response
  }

  const refreshedAccess = await refreshAccessToken()
  if (!refreshedAccess) {
    return response
  }

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${refreshedAccess}`,
    },
  })
}

export async function registerUser({ username, email, role, password, password_confirm }) {
  const res = await fetch(`${API_BASE}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, role, password, password_confirm }),
  })

  const data = await res.json()

  if (!res.ok) {
    const message =
      typeof data === 'object'
        ? Object.values(data).flat().join(' ')
        : 'Registration failed'
    throw new Error(message)
  }

  return data
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${API_BASE}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })


  const data = await res.json()

  if (!res.ok) {
    const message =
      typeof data === 'object'
        ? Object.values(data).flat().join(' ')
        : 'Login failed'
    throw new Error(message)
  }

  return data
}

export async function getCurrentProfile() {
  const res = await authenticatedFetch(`${API_BASE}/profile/`)

  const data = await res.json()

  if (!res.ok) {
    const message =
      typeof data === 'object'
        ? Object.values(data).flat().join(' ')
        : 'Failed to load profile'
    throw new Error(message)
  }

  return data
}

export async function updateCurrentProfile(profileData) {
  const res = await authenticatedFetch(`${API_BASE}/profile/`, {
    method: 'PATCH',
    body: profileData,
  })

  const data = await res.json()

  if (!res.ok) {
    const message =
      typeof data === 'object'
        ? Object.values(data).flat().join(' ')
        : 'Failed to update profile'
    throw new Error(message)
  }

  if (data?.avatar_url) {
    localStorage.setItem(AVATAR_URL_KEY, data.avatar_url)
  }

  return data
}
