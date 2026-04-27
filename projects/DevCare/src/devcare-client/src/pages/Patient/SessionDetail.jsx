import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Target, Timer, Zap, Activity, Info, BarChart3, TrendingUp } from 'lucide-react'
import { getSessionDetail } from '../../api/rehabApi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'

function SessionDetail() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSessionDetail(sessionId)
      .then(data => setSession(data))
      .catch(err => {
        console.error('Failed to load session details:', err)
        setSession(null)
      })
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-4">
        <Loader2 className="animate-spin" size={48} />
        <p className="font-bold tracking-widest text-xs uppercase">Generating Clinical Analytics...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-4 animate-fade-in">
        <Info size={48} className="text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700">Session not found</h2>
        <p className="text-sm font-medium">The session you are looking for does not exist or failed to load.</p>
        <button onClick={() => navigate('/session-result')} className="mt-4 px-6 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold text-sm shadow-md">
          Go Back
        </button>
      </div>
    )
  }

  const avgAccuracy = session.body_part_scores?.length > 0
    ? session.body_part_scores.reduce((acc, r) => acc + (r.score || 0), 0) / session.body_part_scores.length
    : 0;
  const totalReps = session.results?.reduce((acc, r) => acc + (r.reps || 0), 0) || 0

  if (!session.completed_at || (session.results?.length === 0 && session.body_part_scores?.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-4 animate-fade-in">
        <Info size={48} className="text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700">Incomplete Session</h2>
        <p className="text-sm font-medium">This session has no recorded results. It may not have been completed.</p>
        <button onClick={() => navigate('/session-result')} className="mt-4 px-6 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold text-sm shadow-md">
          Go Back
        </button>
      </div>
    )
  }

  const handleExportPDF = () => {
    window.print()
  }

  return (
    <div className="animate-fade-in pb-20 print:p-0">
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            aside { display: none !important; }
            .dashboard-main { margin-left: 0 !important; padding: 0 !important; }
            .elevated-card { box-shadow: none !important; border: 1px solid #eee !important; }
            body { background: white !important; }
            .print-header { display: block !important; }
          }
        `}
      </style>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/session-result')} className="no-print rounded-xl p-3 hover:bg-[var(--color-surface)] border border-slate-100 shadow-sm transition-all">
            <ArrowLeft className="h-6 w-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800">Session Analytics</h1>
            <p className="text-sm font-medium text-slate-400">Detailed breakdown for {session.plan_name || 'Recovery Plan'}</p>
          </div>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Session Timestamp</p>
           <p className="text-sm font-bold text-slate-700">
              {new Date(session.completed_at || session.started_at).toLocaleDateString(undefined, { dateStyle: 'medium' })} @ {new Date(session.completed_at || session.started_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
           </p>
           <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mt-1">
              Assigned by Dr. {session.doctor_name || 'Sarah Johnson'}
           </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Summary Stats */}
        <div className="lg:col-span-2 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="elevated-card p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-blue-200">
                 <div className="flex items-center gap-3 mb-4 opacity-80">
                    <Zap size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Accuracy</span>
                 </div>
                 <h2 className="text-4xl font-black mb-1">{Math.round(avgAccuracy)}%</h2>
                 <p className="text-xs font-medium opacity-70">Average across exercises</p>
              </div>
              <div className="elevated-card p-6 bg-white border-slate-100">
                 <div className="flex items-center gap-3 mb-4 text-emerald-500">
                    <Target size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Reps</span>
                 </div>
                 <h2 className="text-4xl font-black text-slate-800 mb-1">{totalReps}</h2>
                 <p className="text-xs font-medium text-slate-400">Completed movements</p>
              </div>
              <div className="elevated-card p-6 bg-white border-slate-100">
                 <div className="flex items-center gap-3 mb-4 text-amber-500">
                    <Activity size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stability</span>
                 </div>
                 <h2 className="text-4xl font-black text-slate-800 mb-1">High</h2>
                 <p className="text-xs font-medium text-slate-400">Form consistency</p>
              </div>
           </div>

           {/* Anatomical Charts */}
           <div className="elevated-card p-8 bg-white border-slate-100">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <BarChart3 className="text-blue-500" size={24} />
                    <h3 className="text-xl font-black text-slate-800">Joint Flexibility Breakdown</h3>
                 </div>
                 <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">
                    <TrendingUp size={12} /> AI Telemetry
                 </span>
              </div>
              
              <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={session.body_part_scores}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="part" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                       <YAxis hide domain={[0, 100]} />
                       <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                          itemStyle={{fontWeight: 800, fontSize: '14px'}}
                       />
                       <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={45}>
                          {session.body_part_scores?.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.score > 90 ? '#10b981' : entry.score > 80 ? '#3b82f6' : '#f59e0b'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Detailed Results Table */}
           <div className="elevated-card p-0 overflow-hidden bg-white border-slate-100">
              <div className="p-6 border-b border-slate-50">
                 <h3 className="text-xl font-black text-slate-800">Exercise Results</h3>
              </div>
              <table className="w-full text-left">
                 <thead className="bg-slate-50">
                    <tr>
                       <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Exercise</th>
                       <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Reps</th>
                       <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Accuracy</th>
                       <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {session.results?.map((res, idx) => (
                       <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-700">{res.exercise_name}</td>
                          <td className="px-6 py-4 font-black text-slate-800">{res.reps}</td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                                <div className="h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
                                   <div className="h-full bg-blue-500" style={{width: `${res.accuracy}%`}}></div>
                                </div>
                                <span className="font-black text-blue-600 text-sm">{res.accuracy}%</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-400">{res.duration}s</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="elevated-card p-6 bg-slate-800 text-white border-none">
              <div className="flex items-center gap-3 mb-4 text-blue-400">
                 <Radar size={20} />
                 <h3 className="font-black">Recovery Radar</h3>
              </div>
              <div className="h-[240px] w-full flex items-center justify-center">
                 {/* Recharts Radar Chart for premium feel */}
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={session.body_part_scores}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="part" tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                       <Radar name="Performance" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <p className="text-center text-[10px] font-bold text-slate-400 mt-4 uppercase">Joint Stability Map</p>
           </div>

           <div className="elevated-card p-6 bg-white border-slate-100">
              <div className="flex items-center gap-3 mb-4 text-emerald-500">
                 <Info size={20} />
                 <h3 className="font-black text-slate-800">Doctor's Review</h3>
              </div>
              <div className="space-y-4">
                 {session.feedback ? (
                   <>
                     <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl">
                       <span className="text-xs font-bold text-slate-500">Rating</span>
                       <span className="text-amber-500 text-lg">{"★".repeat(session.feedback.rating)}{"☆".repeat(5 - session.feedback.rating)}</span>
                     </div>
                     <p className="text-sm text-slate-600 leading-relaxed italic whitespace-pre-wrap">"{session.feedback.guidance}"</p>
                   </>
                 ) : (
                   <p className="text-sm text-slate-400 italic">No clinical feedback provided yet.</p>
                 )}
                 <div className="h-px bg-slate-50 w-full"></div>
                 <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400 uppercase tracking-widest text-[9px]">Verified Provider</span>
                    <span className="text-blue-500 font-black">Dr. {session.doctor_name || 'Assigned Doctor'}</span>
                 </div>
              </div>
           </div>

           <button 
             onClick={handleExportPDF}
             className="no-print w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black py-4 rounded-xl hover:shadow-lg transition-all shadow-orange-200"
           >
              Download PDF Report
           </button>
        </div>
      </div>
    </div>
  )
}

export default SessionDetail
