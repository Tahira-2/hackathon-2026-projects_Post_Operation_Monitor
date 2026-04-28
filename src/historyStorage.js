const HISTORY_STORAGE_KEY = 'medroute_history'

export function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
    return true
  } catch {
    return false
  }
}

export function upsertSession(session) {
  const savedSession = {
    ...session,
    id: session.id || Date.now(),
    date: session.date || new Date().toLocaleString(),
    updatedAt: new Date().toLocaleString(),
  }
  const history = loadHistory()
  const existingIndex = history.findIndex(item => item.id === savedSession.id)
  const nextHistory = existingIndex >= 0
    ? history.map(item => item.id === savedSession.id ? { ...item, ...savedSession } : item)
    : [savedSession, ...history]

  saveHistory(nextHistory)
  return nextHistory
}

export function getHistoryStorageStatus() {
  try {
    const rawValue = localStorage.getItem(HISTORY_STORAGE_KEY)
    return {
      available: true,
      key: HISTORY_STORAGE_KEY,
      rawLength: rawValue?.length || 0,
      count: loadHistory().length,
    }
  } catch {
    return {
      available: false,
      key: HISTORY_STORAGE_KEY,
      rawLength: 0,
      count: 0,
    }
  }
}
