import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Filter, MessageSquareText, History, Loader2, Info, CheckCircle2, Timer, Target, Activity, Star } from 'lucide-react'
import { getSessionHistory } from '../../api/rehabApi'

function SessionResult() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSessionHistory()
      .then(data => {
        // Process data to calculate aggregate metrics for the UI
        const processedData = data.map(session => {
          const results = session.results || [];
          const totalReps = results.reduce((acc, r) => acc + (r.reps || 0), 0);
          const totalDurationSecs = results.reduce((acc, r) => acc + (r.duration || 0), 0);
          
          const bps = session.body_part_scores || [];
          const avgScore = bps.length > 0 
            ? Math.round(bps.reduce((acc, s) => acc + (s.score || 0), 0) / bps.length)
            : 0;
            
          const mins = Math.floor(totalDurationSecs / 60);
          const secs = Math.floor(totalDurationSecs % 60);
          const formattedDuration = `${mins}m ${secs.toString().padStart(2, '0')}s`;
          
          let stability = 'Needs Work';
          if (avgScore >= 90) stability = 'Excellent';
          else if (avgScore >= 75) stability = 'Good';

          return {
            ...session,
            reps: totalReps,
            duration: formattedDuration,
            durationSecs: totalDurationSecs,
            accuracy: avgScore,
            stability: stability,
            hasBodyScores: bps.length > 0
          };
        }).filter(session => session.durationSecs > 0 && session.hasBodyScores);
        
        setHistory(processedData)
      })
      .catch(err => {
        console.error('Failed to fetch session history:', err)
        setHistory([])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="animate-fade-in pb-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-2">
               <div className="h-1 w-4 bg-[var(--color-primary)] rounded-full"></div>
               Performance Overview
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-text)]">Session Result</h1>
            <p className="text-lg font-medium text-[var(--color-text-muted)] mt-2">Analyze the specific outcomes and metrics of your therapy sessions.</p>
          </div>
        </div>
      </div>

        {/* Search & Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3 h-5 w-5 text-[var(--color-text-muted)]" />
            <input 
              type="text" 
              placeholder="Search past sessions..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)]"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Sessions Grid */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
               <Loader2 className="animate-spin" size={40} />
               <p className="font-bold tracking-widest text-xs uppercase">Syncing Session Collection...</p>
            </div>
          ) : history.length === 0 ? (
             <div className="rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-slate-50/50 p-12 text-center">
                <div className="h-16 w-16 rounded-3xl bg-white flex items-center justify-center text-slate-300 mx-auto mb-6 shadow-sm">
                   <Info size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-600">No sessions completed yet</h3>
                <p className="text-slate-400 mt-2 max-w-sm mx-auto font-medium">Start your first therapy session from the "My Sessions" tab to see your progress here.</p>
             </div>
          ) : (
            <div className="space-y-6">
              {history.map((session) => (
                <div key={session.id} className="elevated-card p-6 border-none shadow-lg bg-white group hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                       <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                          <CheckCircle2 size={24} />
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-slate-800">{session.plan_name}</h3>
                          <div className="flex flex-col gap-0.5">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Completed on {new Date(session.completed_at || session.started_at).toLocaleDateString()} @ {new Date(session.completed_at || session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </p>
                             <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tight">
                                Assigned by Dr. {session.doctor_name || 'Sarah Johnson'}
                             </p>
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-black text-[var(--color-primary)]">Score: {session.accuracy || 90}%</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Avg. Accuracy</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-50">
                     <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                           <Timer size={12} /> Duration
                        </span>
                        <span className="text-sm font-black text-slate-700">{session.duration || '10m 00s'}</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                           <Target size={12} /> Reps
                        </span>
                        <span className="text-sm font-black text-slate-700">{session.reps || 24} Total</span>
                     </div>
                     <div className="flex flex-col gap-1 text-right">
                        <span className="flex items-center justify-end gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                           Stability
                        </span>
                        <span className={`text-sm font-black ${session.stability === 'Excellent' ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {session.stability || 'Good'}
                        </span>
                     </div>
                  </div>

                  {session.body_part_scores && session.body_part_scores.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-50">
                       <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Anatomical Performance</p>
                       <div className="flex flex-wrap gap-2">
                          {session.body_part_scores.map((score, sIdx) => (
                             <div key={sIdx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-500 capitalize">{score.part}</span>
                                <div className="h-1.5 w-12 bg-slate-200 rounded-full overflow-hidden">
                                   <div 
                                      className={`h-full rounded-full ${score.score > 90 ? 'bg-emerald-400' : score.score > 80 ? 'bg-blue-400' : 'bg-amber-400'}`}
                                      style={{ width: `${score.score}%` }}
                                   ></div>
                                </div>
                                <span className="text-[10px] font-black text-slate-700">{score.score}%</span>
                             </div>
                          ))}
                       </div>
                    </div>
                  )}

                  <button 
                    onClick={() => navigate(`/session-result/${session.id}`)}
                    className="w-full mt-6 py-3 rounded-xl bg-slate-50 text-slate-500 font-bold text-xs hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)] transition-all"
                  >
                     View Session Analytics
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Therapy History + Doctor Feedback */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <History className="h-5 w-5 text-[var(--color-primary)]" />
              <h3 className="font-bold text-[var(--color-text)]">Recent Milestones</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Weekly Sessions', val: '4/6' },
                { label: 'Total Movement', val: '2.4 hrs' },
                { label: 'Consistency', val: '98%' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg bg-[var(--color-bg)] p-3 border border-[var(--color-border)]">
                  <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-tighter">{item.label}</span>
                  <span className="text-sm font-black text-[var(--color-primary)]">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100">
                  <Star size={20} fill="currentColor" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Doctor's Review</h3>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={18} fill={star <= 4 ? "#F59E0B" : "none"} stroke={star <= 4 ? "#F59E0B" : "#CBD5E1"} />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-lg leading-relaxed text-slate-600 italic font-medium">
                "Your knee flexion accuracy is significantly higher this session. Recommendation: Increase load by 5% next week."
              </p>

              <div className="h-px bg-slate-100 w-full"></div>

              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Verified Provider</span>
                 <span className="text-sm font-bold text-blue-600">Dr. Sarah Johnson</span>
              </div>
            </div>
          </div>

          <button className="w-full bg-[#EA580C] text-white font-extrabold py-5 rounded-[2rem] hover:bg-[#C2410C] transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-2">
            Download PDF Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default SessionResult
