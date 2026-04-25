import { useState } from 'react'
import Home from './pages/Home.jsx'
import Triage from './pages/Triage.jsx'
import History from './pages/History.jsx'

export default function App() {
  const [page, setPage] = useState('home')
  const [history, setHistory] = useState([])

  const navigate = (p) => setPage(p)

  const saveSession = (session) => {
    setHistory(prev => [{ ...session, id: Date.now(), date: new Date().toLocaleString() }, ...prev])
  }

  if (page === 'triage') return <Triage onBack={() => navigate('home')} onSave={saveSession} />
  if (page === 'history') return <History sessions={history} onBack={() => navigate('home')} />
  return <Home onStart={() => navigate('triage')} onHistory={() => navigate('history')} />
}
