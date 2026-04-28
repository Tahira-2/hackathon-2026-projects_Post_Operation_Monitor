import { useState } from 'react'
import Home from './pages/Home.jsx'
import Triage from './pages/Triage.jsx'
import History from './pages/History.jsx'
import { loadHistory, upsertSession } from './historyStorage.js'

export default function App() {
  const [page, setPage] = useState('home')
  const [history, setHistory] = useState(loadHistory)
  const [activeSession, setActiveSession] = useState(null)

  const navigate = (p) => setPage(p)

  const startNewSession = () => {
    setActiveSession(null)
    navigate('triage')
  }

  const openSession = (session) => {
    setActiveSession(session)
    navigate('triage')
  }

  const saveSession = (session) => {
    setHistory(upsertSession(session))
  }

  if (page === 'triage') return <Triage session={activeSession} onBack={() => navigate('home')} onSave={saveSession} />
  if (page === 'history') return <History sessions={history} onBack={() => navigate('home')} onOpenSession={openSession} />
  return <Home onStart={startNewSession} onHistory={() => navigate('history')} />
}
