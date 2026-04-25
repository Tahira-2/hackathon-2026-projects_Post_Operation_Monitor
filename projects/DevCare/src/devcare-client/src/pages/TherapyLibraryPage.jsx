import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Filter, MessageSquareText, History } from 'lucide-react'

import PatientSidebar from '../components/PatientSidebar'
import PatientTopNav from '../components/PatientTopNav'

const USERNAME_KEY = 'devcare_username'
const ACCESS_TOKEN_KEY = 'devcare_access_token'
const REFRESH_TOKEN_KEY = 'devcare_refresh_token'
const ROLE_KEY = 'devcare_role'

function TherapyLibraryPage() {
  const navigate = useNavigate()
  const username = localStorage.getItem(USERNAME_KEY)

  function handleLogout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)
    localStorage.removeItem(ROLE_KEY)
    navigate('/')
  }

  const exercises = [
    { id: 1, name: 'Quad Strengthening', injury: 'ACL Recovery', difficulty: 'Intermediate', duration: '8 mins', reps: '3x12' },
    { id: 2, name: 'Knee Mobility Drills', injury: 'ACL Recovery', difficulty: 'Beginner', duration: '10 mins', reps: '3x10' },
    { id: 3, name: 'Balance & Stability', injury: 'General', difficulty: 'Intermediate', duration: '7 mins', reps: '2x30s' },
    { id: 4, name: 'Hamstring Stretching', injury: 'General', difficulty: 'Beginner', duration: '5 mins', reps: 'Hold 30s' },
    { id: 5, name: 'Calf Raises', injury: 'General', difficulty: 'Beginner', duration: '6 mins', reps: '3x15' },
    { id: 6, name: 'Advanced Balance', injury: 'ACL Recovery', difficulty: 'Advanced', duration: '10 mins', reps: 'Circuit' },
  ]

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <PatientSidebar username={username} onLogout={handleLogout} />

      <main className="flex-1 pt-16 md:pt-0 md:pl-0 flex flex-col">
        <PatientTopNav username={username} />
        
        <div className="flex-1 overflow-y-auto">
          <div className="site-container py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/dashboard/patient')} className="rounded-lg p-2 hover:bg-[var(--color-surface)]">
                  <ArrowLeft className="h-6 w-6 text-[var(--color-text)]" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-[var(--color-text)]">Therapy Library</h1>
                  <p className="text-sm text-[var(--color-text-muted)]">Browse and learn about all available exercises</p>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-3 h-5 w-5 text-[var(--color-text-muted)]" />
                  <input 
                    type="text" 
                    placeholder="Search exercises..." 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)]"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Exercises Grid */}
              <div className="lg:col-span-2">
                <div className="grid gap-6 md:grid-cols-2">
                  {exercises.map((exercise) => (
                    <div key={exercise.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="mb-4">
                        <h3 className="font-bold text-lg text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">{exercise.name}</h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">{exercise.injury}</p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-xs text-[var(--color-text-muted)]">Difficulty</span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            exercise.difficulty === 'Beginner' ? 'bg-[var(--color-success)] bg-opacity-20 text-[var(--color-success)]' :
                            exercise.difficulty === 'Intermediate' ? 'bg-[var(--color-accent)] bg-opacity-20 text-[var(--color-accent)]' :
                            'bg-[var(--color-danger)] bg-opacity-20 text-[var(--color-danger)]'
                          }`}>{exercise.difficulty}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-[var(--color-text-muted)]">Duration</span>
                          <span className="text-xs font-semibold text-[var(--color-text)]">{exercise.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-[var(--color-text-muted)]">Sets/Reps</span>
                          <span className="text-xs font-semibold text-[var(--color-text)]">{exercise.reps}</span>
                        </div>
                      </div>

                      <button className="w-full btn-secondary">Learn More</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Therapy History + Doctor Feedback */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <History className="h-5 w-5 text-[var(--color-primary)]" />
                    <h3 className="font-bold text-[var(--color-text)]">Therapy History</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { date: 'Apr 25', name: 'Quad Strengthening', score: '92%' },
                      { date: 'Apr 24', name: 'Balance & Stability', score: '85%' },
                      { date: 'Apr 23', name: 'Knee Mobility Drills', score: '88%' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg bg-[var(--color-bg)] p-3">
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text)]">{item.name}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{item.date}</p>
                        </div>
                        <span className="text-sm font-bold text-[var(--color-primary)]">{item.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageSquareText className="h-5 w-5 text-[var(--color-accent)]" />
                    <h3 className="font-bold text-[var(--color-text)]">Doctor Feedback</h3>
                  </div>
                  <div className="space-y-4 text-sm text-[var(--color-text)]">
                    <p>Dr. Sarah Johnson: Great control on the last session. Keep the movement slower for better alignment.</p>
                    <p className="text-[var(--color-text-muted)]">Latest rating: 4.7/5</p>
                    <button className="btn-secondary w-full">View all feedback</button>
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

export default TherapyLibraryPage
