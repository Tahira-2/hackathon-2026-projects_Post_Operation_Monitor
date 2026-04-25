import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Square, Volume2, Settings } from 'lucide-react'

import PatientSidebar from '../components/PatientSidebar'
import PatientTopNav from '../components/PatientTopNav'

const USERNAME_KEY = 'devcare_username'
const ACCESS_TOKEN_KEY = 'devcare_access_token'
const REFRESH_TOKEN_KEY = 'devcare_refresh_token'
const ROLE_KEY = 'devcare_role'

function TherapySessionPage() {
  const navigate = useNavigate()
  const username = localStorage.getItem(USERNAME_KEY)

  function handleLogout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)
    localStorage.removeItem(ROLE_KEY)
    navigate('/')
  }

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
                <h1 className="text-3xl font-bold text-[var(--color-text)]">Quad Strengthening</h1>
                <p className="text-sm text-[var(--color-text-muted)]">3 sets of 12 reps • Intermediate</p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="mb-12 grid gap-8 lg:grid-cols-3">
              {/* Left Side - Camera Feed */}
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-[var(--color-border)] bg-black p-0 shadow-sm overflow-hidden">
                  {/* Camera Feed Placeholder */}
                  <div className="aspect-video bg-black flex items-center justify-center relative">
                    <div className="text-white text-center">
                      <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-sm opacity-75">Camera feed will appear here</p>
                      <p className="text-xs opacity-50 mt-2">Click Start Session to begin</p>
                    </div>
                    
                    {/* Status Indicators */}
                    <div className="absolute top-4 right-4 space-y-2">
                      <div className="bg-red-500 bg-opacity-80 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                        <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                        Camera Off
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="bg-[var(--color-surface)] p-6 border-t border-[var(--color-border)]">
                    <div className="flex gap-3">
                      <button className="flex-1 btn-primary flex items-center justify-center gap-2">
                        <Play className="h-4 w-4" />
                        Start Session
                      </button>
                      <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                        <Square className="h-4 w-4" />
                        Stop
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Exercise Info & Feedback */}
              <div className="space-y-6">
                {/* Exercise Details */}
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                  <h3 className="font-semibold text-[var(--color-text)] mb-4">Exercise Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Duration</p>
                      <p className="mt-1 text-lg font-bold text-[var(--color-primary)]">8 minutes</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Sets & Reps</p>
                      <p className="mt-1 text-lg font-bold text-[var(--color-primary)]">3 × 12</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Difficulty</p>
                      <p className="mt-1 text-lg font-bold text-[var(--color-accent)]">Intermediate</p>
                    </div>
                  </div>
                </div>

                {/* Real-time Feedback */}
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-6">
                  <h3 className="font-semibold text-[var(--color-text)] mb-4">Live Feedback</h3>
                  <div className="bg-white rounded-lg p-4 text-center border border-[var(--color-border)]">
                    <p className="text-sm text-[var(--color-text-muted)]">Waiting for session start...</p>
                  </div>
                </div>

                {/* Session Stats */}
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                  <h3 className="font-semibold text-[var(--color-text)] mb-4">Session Stats</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Time Elapsed</p>
                      <p className="mt-1 text-lg font-bold text-[var(--color-text)]">0:00</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Reps Completed</p>
                      <p className="mt-1 text-lg font-bold text-[var(--color-primary)]">0/12</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Accuracy</p>
                      <p className="mt-1 text-lg font-bold text-[var(--color-success)]">—</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TherapySessionPage
