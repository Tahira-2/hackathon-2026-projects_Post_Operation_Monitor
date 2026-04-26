import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, CalendarDays, Trophy } from 'lucide-react'


const USERNAME_KEY = 'devcare_username'
const ACCESS_TOKEN_KEY = 'devcare_access_token'
const REFRESH_TOKEN_KEY = 'devcare_refresh_token'
const ROLE_KEY = 'devcare_role'

function ProgressPage() {
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
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-2">
           <div className="h-1 w-4 bg-[var(--color-primary)] rounded-full"></div>
           Recovery Metrics
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-text)]">Progress & History</h1>
        <p className="text-lg font-medium text-[var(--color-text-muted)] mt-2">Track your rehabilitation progress, date range, and streak</p>
      </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Therapy Window</p>
                <p className="mt-3 text-2xl font-bold text-[var(--color-primary)]">Apr 20 - May 18</p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)] flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Doctor assigned plan</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Current Streak</p>
                <p className="mt-3 text-4xl font-bold text-[var(--color-accent)]">12 Days</p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)] flex items-center gap-2"><Trophy className="h-4 w-4" /> Best streak this month</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Consistency</p>
                <p className="mt-3 text-4xl font-bold text-[var(--color-success)]">87%</p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">Session completion rate</p>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Total Sessions</p>
                <p className="mt-3 text-4xl font-bold text-[var(--color-primary)]">24</p>
                <p className="text-sm text-[var(--color-text-muted)] mt-2">Completed this month</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Average Accuracy</p>
                <p className="mt-3 text-4xl font-bold text-[var(--color-accent)]">87%</p>
                <p className="text-sm text-[var(--color-success)] mt-2">↑ +8% from last week</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Current Streak</p>
                <p className="mt-3 text-4xl font-bold text-[var(--color-success)]">12 Days</p>
                <p className="text-sm text-[var(--color-text-muted)] mt-2">Keep it up!</p>
              </div>
            </div>

            {/* Progress Chart Placeholder */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 mb-8">
              <h3 className="font-bold text-lg text-[var(--color-text)] mb-6">Accuracy Trend</h3>
              <div className="h-64 bg-[var(--color-bg)] rounded-lg flex items-center justify-center border border-[var(--color-border)]">
                <p className="text-[var(--color-text-muted)]">Chart will appear here</p>
              </div>
            </div>

            {/* Session History */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <h3 className="font-bold text-lg text-[var(--color-text)] mb-4">Recent Sessions</h3>
              <div className="space-y-3">
                {[
                  { date: '2026-04-25', exercise: 'Quad Strengthening', accuracy: 92, streak: '12 days' },
                  { date: '2026-04-24', exercise: 'Balance & Stability', accuracy: 85, streak: '11 days' },
                  { date: '2026-04-23', exercise: 'Knee Mobility Drills', accuracy: 88, streak: '10 days' },
                  { date: '2026-04-22', exercise: 'Advanced Balance', accuracy: 79, streak: '9 days' },
                ].map((session, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-bg)]">
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{session.exercise}</p>
                      <p className="text-sm text-[var(--color-text-muted)]">{session.date} • Streak {session.streak}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[var(--color-primary)]">{session.accuracy}%</p>
                      <TrendingUp className="h-4 w-4 text-[var(--color-success)] ml-auto mt-1" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
    </div>
  )
}

export default ProgressPage
