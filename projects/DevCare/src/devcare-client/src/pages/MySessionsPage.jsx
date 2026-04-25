import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, CalendarDays, TrendingUp } from 'lucide-react'

import PatientSidebar from '../components/PatientSidebar'
import PatientTopNav from '../components/PatientTopNav'

const USERNAME_KEY = 'devcare_username'
const ACCESS_TOKEN_KEY = 'devcare_access_token'
const REFRESH_TOKEN_KEY = 'devcare_refresh_token'
const ROLE_KEY = 'devcare_role'

function MySessionsPage() {
  const navigate = useNavigate()
  const username = localStorage.getItem(USERNAME_KEY)

  function handleLogout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)
    localStorage.removeItem(ROLE_KEY)
    navigate('/')
  }

  const sessions = [
    { 
      id: 1, 
      name: 'Quad Strengthening', 
      doctor: 'Dr. Sarah Johnson', 
      date: 'Today', 
      status: 'pending', 
      difficulty: 'Intermediate',
      streak: 12,
      planRange: 'Apr 20 - May 18',
      completedSessions: 8,
      totalSessions: 12
    },
    { 
      id: 2, 
      name: 'Knee Mobility Drills', 
      doctor: 'Dr. Sarah Johnson', 
      date: 'Tomorrow', 
      status: 'pending', 
      difficulty: 'Beginner',
      streak: 5,
      planRange: 'Apr 25 - May 25',
      completedSessions: 2,
      totalSessions: 10
    },
    { 
      id: 3, 
      name: 'Balance & Stability', 
      doctor: 'Dr. Sarah Johnson', 
      date: 'Yesterday', 
      status: 'completed', 
      difficulty: 'Intermediate',
      streak: 15,
      planRange: 'Apr 10 - May 10',
      completedSessions: 12,
      totalSessions: 12
    },
  ]

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <PatientSidebar username={username} onLogout={handleLogout} />

      <main className="flex-1 pt-16 md:pt-0 md:pl-0 flex flex-col">
        <PatientTopNav username={username} />
        
        <div className="flex-1 overflow-y-auto">
          <div className="site-container py-8">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
              <button onClick={() => navigate('/dashboard/patient')} className="rounded-lg p-2 hover:bg-[var(--color-surface)]">
                <ArrowLeft className="h-6 w-6 text-[var(--color-text)]" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-[var(--color-text)]">My Sessions</h1>
                <p className="text-sm text-[var(--color-text-muted)]">Doctor-assigned plan with date range and streak tracking</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Plan Range</p>
                <p className="mt-3 text-2xl font-bold text-[var(--color-primary)]">Apr 20 - May 18</p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)] flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Doctor assigned</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Current Streak</p>
                <p className="mt-3 text-4xl font-bold text-[var(--color-accent)]">12 Days</p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">Keep the streak alive</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Weekly Progress</p>
                <p className="mt-3 text-4xl font-bold text-[var(--color-success)]">4/6</p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">Sessions completed</p>
              </div>
            </div>

            {/* Sessions List */}
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-[var(--color-text)]">{session.name}</h3>
                      <p className="text-sm text-[var(--color-text-muted)] mt-1">Assigned by {session.doctor}</p>
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <span className="text-sm text-[var(--color-text-muted)]">{session.date}</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                          session.difficulty === 'Beginner' ? 'border-[var(--color-success)] text-[var(--color-success)] bg-[var(--color-bg)]' :
                          session.difficulty === 'Intermediate' ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-bg)]' :
                          'border-[var(--color-danger)] text-[var(--color-danger)] bg-[var(--color-bg)]'
                        }`}>{session.difficulty}</span>
                        <span className="text-xs font-semibold text-[var(--color-primary)] border border-[var(--color-primary)] px-2 py-1 rounded-md flex items-center gap-1 bg-[var(--color-bg)]">
                          <TrendingUp className="h-3 w-3" /> {session.streak} day streak
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" /> {session.planRange}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-4 max-w-md">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[var(--color-text-muted)]">Plan Progress</span>
                          <span className="font-semibold text-[var(--color-text)]">{session.completedSessions}/{session.totalSessions} sessions</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--color-border)] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[var(--color-success)] rounded-full transition-all duration-500" 
                            style={{ width: `${(session.completedSessions / session.totalSessions) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                        session.status === 'completed' 
                          ? 'border-[var(--color-success)] text-[var(--color-success)] bg-[var(--color-bg)]'
                          : 'border-[var(--color-warning)] text-[var(--color-warning)] bg-[var(--color-bg)]'
                      }`}>
                        {session.status === 'completed' ? '✓ Completed' : 'Pending'}
                      </span>
                      {session.status === 'pending' && (
                        <button onClick={() => navigate('/therapy-session')} className="flex items-center gap-2 px-4 py-2 btn-primary text-sm">
                          <Play className="h-4 w-4" />
                          Start Therapy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default MySessionsPage
