import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, CalendarDays, ClipboardCheck, Loader2, Info } from 'lucide-react'
import { getMyPlans } from '../../api/rehabApi'

function TherapyRoadmap() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyPlans()
      .then(data => setPlans(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-2">
             <div className="h-1 w-4 bg-[var(--color-primary)] rounded-full"></div>
             Recovery Sessions
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-text)]">Sessions</h1>
          <p className="text-lg font-medium text-[var(--color-text-muted)] mt-2">View assigned plans and complete your daily roadmap.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
          <Loader2 className="animate-spin" size={40} />
          <p className="font-bold tracking-widest text-xs uppercase">Syncing your recovery roadmap...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-slate-50/50 p-12 text-center">
          <div className="h-16 w-16 rounded-3xl bg-white flex items-center justify-center text-slate-300 mx-auto mb-6 shadow-sm">
            <Info size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-600">No active plans assigned</h3>
          <p className="text-slate-400 mt-2 max-w-sm mx-auto font-medium">Your physical therapist hasn't assigned a specific plan yet. Contact your clinic to get started.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {plans.map((plan) => (
            <div key={plan.id} className="elevated-card p-0 overflow-hidden border-none shadow-xl bg-white">
              <div className="flex flex-col lg:flex-row lg:items-stretch">
                {/* Left Section: Core Info & Exercises */}
                <div className="flex-1 p-8 lg:border-r border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] bg-[var(--color-primary-soft)] px-3 py-1 rounded-full mb-3 inline-block">Active Plan</span>
                      <h3 className="text-2xl font-black text-slate-800">{plan.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                      <CalendarDays size={16} />
                      {new Date(plan.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <div className="h-1 w-4 bg-[var(--color-primary)] rounded-full"></div>
                    Clinical Exercises
                  </h4>
                  
                  <div className="grid gap-3 sm:grid-cols-2">
                    {plan.exercises && plan.exercises.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-[var(--color-primary)] transition-colors">
                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center font-bold text-slate-400 group-hover:text-[var(--color-primary)] shadow-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{item.exercise?.name || 'Exercise'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.target_reps} Repetitions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Section: Roadmap Tasks & CTA */}
                <div className="w-full lg:w-[380px] bg-slate-50/50 p-8 flex flex-col">
                   <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <ClipboardCheck size={16} className="text-emerald-500" />
                    Daily Roadmap Tasks
                  </h4>

                  <div className="flex-1 space-y-3 mb-8">
                    {plan.tasks && plan.tasks.length > 0 ? (
                      plan.tasks.map((task, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                           <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400 shrink-0"></div>
                           <p className="text-xs font-bold text-slate-600 leading-relaxed">{task}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl">
                         <p className="text-[10px] font-bold text-slate-400 uppercase">No supplemental tasks</p>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={async () => {
                      try {
                        // Call backend to start session
                        const { startSession } = await import('../../api/rehabApi');
                        const sessionData = await startSession(plan.id);
                        navigate(`/start-session/${sessionData.id}`, { state: { plan, session: sessionData } });
                      } catch (err) {
                        console.error('Failed to start session on backend:', err);
                        // Fallback navigation if backend is unavailable (using a dummy id)
                        navigate(`/start-session/${plan.id}`, { state: { plan } });
                      }
                    }}
                    className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Play className="h-5 w-5" />
                    <span className="font-black uppercase tracking-widest text-sm">Start Session</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TherapyRoadmap
