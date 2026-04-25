import { useNavigate } from 'react-router-dom'
import { Clock, Activity, Zap, BookOpen, MessageCircle } from 'lucide-react'

import PatientSidebar from '../components/PatientSidebar'
import PatientTopNav from '../components/PatientTopNav'

const ACCESS_TOKEN_KEY = 'devcare_access_token'
const REFRESH_TOKEN_KEY = 'devcare_refresh_token'
const USERNAME_KEY = 'devcare_username'
const ROLE_KEY = 'devcare_role'

function PatientDashboardPage() {
  const username = localStorage.getItem('devcare_username')

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <PatientSidebar username={username} onLogout={handleLogout} />

      <main className="flex-1 pt-16 md:pt-0 md:pl-0 flex flex-col">
        <PatientTopNav username={username} />
        
        <div className="flex-1 overflow-y-auto">
          <div className="site-container py-8">
            {/* Welcome Section */}
            <div className="mb-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                Welcome Back
              </p>
              <h1 className="mt-3 text-4xl font-bold sm:text-5xl text-[var(--color-text)]">
                Good morning, {username || 'Patient'}
              </h1>
              <p className="mt-4 text-base text-[var(--color-text-muted)]">
                You've reached 85% of your health goals this week. Keep up the consistent effort—your vital signs are showing significant data-driven progress.
              </p>
            </div>

            {/* Main Content Grid - Large Left Section + Right Sidebar */}
            <section className="mb-12 grid gap-8 lg:grid-cols-3">
              {/* Left Side - Large Featured Section */}
              <div className="lg:col-span-2">
                {/* Therapy Performance Card */}
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm mb-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Your Therapy Score</h3>
                      <p className="mt-4 text-5xl font-bold text-[var(--color-primary)]">85%</p>
                      <p className="mt-2 text-sm text-[var(--color-text-muted)]">Posture accuracy & exercise completion</p>
                      
                      {/* Metrics Row */}
                      <div className="mt-6 grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Consistency</p>
                          <p className="mt-2 text-2xl font-bold text-[var(--color-accent)]">12 Sessions</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">This Week</p>
                          <p className="mt-2 text-2xl font-bold text-[var(--color-success)]">4/6 Done</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-8 flex h-32 w-32 items-center justify-center rounded-full border-4 border-[var(--color-primary)] border-opacity-20 bg-[var(--color-primary)] bg-opacity-5">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-[var(--color-primary)]">85%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned Therapy Exercises */}
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[var(--color-text)]">Assigned Therapy Plan</h3>
                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">Post-ACL Rehabilitation • Assigned by Dr. Sarah Johnson</p>
                    </div>
                    <button className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
                      View full plan →
                    </button>
                  </div>
                  <div className="mt-6 space-y-3">
                    {[
                      { name: 'Quad Strengthening', sets: '3x12', difficulty: 'Intermediate', status: 'pending' },
                      { name: 'Knee Mobility Drills', sets: '3x10', difficulty: 'Beginner', status: 'pending' },
                      { name: 'Balance & Stability', sets: '2x30s', difficulty: 'Intermediate', status: 'completed' }
                    ].map((exercise, idx) => (
                      <div key={idx} className={`flex items-center justify-between rounded-lg p-4 ${exercise.status === 'completed' ? 'border border-[var(--color-accent)] border-opacity-20 bg-[var(--color-surface)]' : 'bg-[var(--color-bg)]'}`}>
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full ${exercise.status === 'completed' ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-primary)] bg-opacity-20'}`}>
                            <Activity className={`h-3 w-3 ${exercise.status === 'completed' ? 'text-white' : 'text-[var(--color-primary)]'}`} />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-[var(--color-text)]">{exercise.name}</span>
                            <p className="text-xs text-[var(--color-text-muted)]">{exercise.sets} • {exercise.difficulty}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${exercise.status === 'completed' ? 'bg-[var(--color-accent)] bg-opacity-20 text-[var(--color-accent)]' : 'bg-[var(--color-warning)] bg-opacity-20 text-[var(--color-warning)]'}`}>
                          {exercise.status === 'completed' ? '✓ Done' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Two Stacked Cards with Divider */}
              <div className="flex flex-col gap-0">
                {/* Top Card - Next Session */}
                <div className="rounded-t-2xl border border-[var(--color-border)] border-b-0 bg-[#1e293b] p-8 text-white shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Next Session</p>
                      <h3 className="mt-3 text-2xl font-bold">Quad Strengthening</h3>
                      <div className="mt-4 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Today at 2:30 PM</span>
                      </div>
                    </div>
                  </div>
                  <button className="btn-primary mt-6 w-full bg-white text-[var(--color-text)] font-semibold hover:shadow-lg transition-shadow">
                    Start Session
                  </button>
                </div>

                {/* Divider Line */}
                <div className="border-b border-[var(--color-border)]"></div>

                {/* Bottom Card - Doctor Feedback */}
                <div className="rounded-b-2xl border border-[var(--color-border)] border-t-0 bg-[var(--color-surface)] p-8 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Doctor Feedback</p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Latest Review</p>
                      <p className="mt-1 text-lg font-semibold text-[var(--color-text)]">Keep your knee aligned during the full movement range.</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Review Date</p>
                      <p className="mt-1 text-xl font-bold text-[var(--color-primary)]">Apr 26, 2026</p>
                    </div>
                    <div className="pt-2">
                      <span className="inline-flex rounded-full bg-[var(--color-accent)] bg-opacity-20 px-3 py-1 text-xs font-semibold text-[var(--color-accent)]">
                        Session Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Insights Section */}
            <section className="mb-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--color-text)]">AI Therapy Insights</h3>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                    Your posture accuracy has improved by 8% since last week! Keep focusing on maintaining proper knee alignment during quad exercises. The AI detected slight forward lean in your last session—try engaging your core more actively. Continue this pace and you'll reach your mobility goals 2 weeks ahead of schedule.
                  </p>
                  <button className="mt-4 text-sm font-semibold text-[var(--color-primary)] hover:underline">
                    View detailed analysis →
                  </button>
                </div>
              </div>
            </section>

            {/* Quick Actions Section */}
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-6">
              <h3 className="mb-4 text-lg font-bold text-[var(--color-text)]">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button className="btn-primary flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Start Therapy Now
                </button>
                <button className="btn-secondary flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Browse Exercises
                </button>
                <button className="btn-secondary flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat with CareBot
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PatientDashboardPage
