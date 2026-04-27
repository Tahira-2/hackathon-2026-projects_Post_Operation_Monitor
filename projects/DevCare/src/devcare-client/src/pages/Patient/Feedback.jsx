import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, MessageSquare } from 'lucide-react'


const USERNAME_KEY = 'devcare_username'
const ACCESS_TOKEN_KEY = 'devcare_access_token'
const REFRESH_TOKEN_KEY = 'devcare_refresh_token'
const ROLE_KEY = 'devcare_role'

function FeedbackPage() {
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
           Review & Insights
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-text)]">Feedback</h1>
        <p className="text-lg font-medium text-[var(--color-text-muted)] mt-2">AI insights and doctor recommendations</p>
      </div>

            {/* AI Feedback */}
            <div className="mb-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-[var(--color-text)]">AI Posture Analysis</h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">From your last 5 sessions</p>
                  <div className="mt-4 p-4 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]">
                    <p className="text-sm text-[var(--color-text)]">
                      ✓ Excellent quad engagement with proper form<br/>
                      ⚠ Slight forward lean detected in 2 sessions - focus on core activation<br/>
                      ✓ Consistent range of motion across all reps<br/>
                      💡 Try engaging your core 2 seconds before each rep for better stability
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Feedback */}
            <div className="mb-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
                  <Star className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-[var(--color-text)]">Doctor Feedback</h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">From Dr. Sarah Johnson</p>
                  <div className="mt-4 p-4 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]">
                    <p className="text-sm text-[var(--color-text)] mb-3">
                      Great progress! Your consistency over the last 2 weeks is impressive. Keep maintaining this schedule and you'll be ready for the next phase soon.
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[var(--color-text-muted)]">Rating:</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-[var(--color-warning)] text-[var(--color-warning)]" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Rating */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-8">
              <h3 className="font-bold text-lg text-[var(--color-text)] mb-6">Your Overall Rating</h3>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
                  <p className="text-4xl font-bold text-[var(--color-primary)] mb-2">92%</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Posture Accuracy</p>
                </div>
                <div className="text-center p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
                  <p className="text-4xl font-bold text-[var(--color-accent)] mb-2">87%</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Consistency</p>
                </div>
                <div className="text-center p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
                  <p className="text-4xl font-bold text-[var(--color-success)] mb-2">4.5</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Doctor Rating</p>
                </div>
              </div>
            </div>
          </div>
  )
}

export default FeedbackPage
