import { useParams, Link } from 'react-router-dom'
import { 
  ChevronLeft, 
  Calendar, 
  Activity, 
  ChevronRight, 
  Sparkles, 
  Plus, 
  Edit3,
  Clock,
  Target,
  TrendingDown
} from 'lucide-react'

function PatientDetail() {
  const { id } = useParams()

  // Mock data matching the provided mockup
  const patient = {
    id,
    name: 'Sarah Chen',
    condition: 'Post-ACL Reconstruction (Left)',
    timeline: 'Day 45 of 120',
    compliance: '92%',
    lastSession: 'Oct 24',
    painLevel: '2.4',
    painTrend: '-0.5',
    initials: 'SC',
    notes: [
      { 
        id: 1, 
        date: 'OCT 24, 2023 • 09:15 AM', 
        tag: 'FOLLOW-UP', 
        content: 'Patient reported morning stiffness but pain decreased during exercise. Increased terminal knee extension (TKE) repetitions to 15. Manual therapy performed to address medial scar tissue adhesion.' 
      },
      { 
        id: 2, 
        date: 'OCT 18, 2023 • 11:30 AM', 
        tag: 'ASSESSMENT', 
        content: 'Range of motion test: Extension 0°, Flexion 115°. Progressing well toward Week 6 goals. Initiated weight-bearing exercise transition.' 
      }
    ],
    currentPlan: [
      { id: 1, name: 'Quadriceps Sets', details: '3 sets • 15 reps • 5s hold', icon: '⚡' },
      { id: 2, name: 'Heel Slides', details: '2 sets • 10 reps • Slow tempo', icon: '🚶' },
      { id: 3, name: 'Straight Leg Raises', details: '3 sets • 12 reps • No lag', icon: '🦵' }
    ],
    sessionReport: {
      exercise_results: [
        { name: 'Bicep Curl', reps: 5, accuracy: '95%', duration: '60s' },
        { name: 'Squat', reps: 5, accuracy: '95%', duration: '60s' },
      ],
      body_part_scores: [
        { part: "Knees", score: 96, color: 'bg-emerald-500' },
        { part: "Arms", score: 92, color: 'bg-blue-500' },
        { part: "Shoulders", score: 85, color: 'bg-amber-500' },
        { part: "Hips", score: 78, color: 'bg-orange-500' },
        { part: "Ankles", score: 75, color: 'bg-slate-500' }
      ]
    }
  }

  return (
    <div className="animate-fade-in pb-12">
      {/* Breadcrumbs & Header */}
      <div className="mb-8 flex items-center justify-between">
        <Link to="/doctor/patients" className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
          <ChevronLeft size={18} />
          Back to Directory
        </Link>
        <div className="flex gap-2">
           <button className="btn-secondary py-2 px-4 text-xs h-10">Export Records</button>
           <button className="btn-primary py-2 px-4 text-xs h-10">Assign Review</button>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="mb-10 grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="elevated-card border-none bg-white p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="flex flex-col gap-10 md:flex-row md:items-center relative z-10">
              <div className="h-28 w-28 overflow-hidden rounded-[2rem] bg-slate-100 border-4 border-white shadow-lg">
                 <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" 
                  alt={patient.name} 
                  className="h-full w-full object-cover"
                 />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{patient.name}</h1>
                    <p className="mt-1.5 text-lg font-semibold text-slate-500">
                      {patient.condition} <span className="mx-2 text-slate-300">•</span> {patient.timeline}
                    </p>
                  </div>
                  <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                    <Edit3 size={16} />
                    Edit Plan
                  </button>
                </div>
                
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="elevated-card border-none bg-white p-8 text-slate-900 h-full relative overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-900">
               <Sparkles size={120} />
             </div>
             <div className="flex items-center gap-2 mb-6 relative z-10">
               <div className="h-1 w-4 bg-blue-600 rounded-full"></div>
               <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">AI Insights</h3>
             </div>
             <p className="text-base leading-relaxed text-slate-900 font-bold relative z-10">
               Sarah's knee extension range has improved by <span className="text-blue-600 font-black">4° this week</span>. Form detection identifies slight pelvic tilting during single-leg squats.
             </p>
             <div className="mt-10 rounded-2xl bg-blue-50/50 p-5 border border-blue-100 relative z-10">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Suggested Adjustment</p>
               <p className="mt-2 text-xs font-black leading-relaxed text-slate-900">
                 Increase resistance on Terminal Knee Extension (TKE) by 5%.
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Left: Charts & History */}
        <div className="lg:col-span-8 space-y-8">
          <section className="elevated-card border-none p-10 shadow-lg">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-2">
                   <div className="h-1 w-4 bg-[var(--color-primary)] rounded-full"></div>
                   Anatomical Analytics
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Latest Session Report</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Generated automatically after session completion</p>
              </div>
              <div className="h-10 px-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-widest">
                 <Activity size={14} /> AI Verified
              </div>
            </div>
            
            <div className="space-y-8">
              {/* Exercise Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Exercise</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Reps</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Accuracy</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {patient.sessionReport.exercise_results.map((res, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5 text-sm font-bold text-slate-900">{res.name}</td>
                        <td className="px-6 py-5 text-sm font-black text-slate-900 text-center">{res.reps}</td>
                        <td className="px-6 py-5 text-sm font-black text-emerald-600 text-center">{res.accuracy}</td>
                        <td className="px-6 py-5 text-sm font-bold text-slate-500 text-right">{res.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Body Part Scores */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 px-1">Biometric Body Part Scores</h4>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {patient.sessionReport.body_part_scores.map((score, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                       <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-slate-500">{score.part}</span>
                          <span className="text-sm font-black text-slate-900">{score.score}</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${score.color} transition-all duration-1000`}
                            style={{ width: `${score.score}%` }}
                          />
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Clinical Notes */}
          <section className="elevated-card border-none p-10 shadow-lg">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-2">
                   <div className="h-1 w-4 bg-[var(--color-primary)] rounded-full"></div>
                   Physician Records
                </div>
                <h3 className="text-2xl font-bold">Clinical Notes</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Timeline of assessments and adjustments</p>
              </div>
              <Link 
                to="/doctor/feedback"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md"
              >
                <Plus size={16} /> New Entry
              </Link>
            </div>
            
            <div className="space-y-12">
              {patient.notes.map((note, i) => (
                <div key={note.id} className="relative pl-12">
                   <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full bg-white border-4 border-slate-900 ring-8 ring-slate-50 shadow-sm z-10"></div>
                   {i !== patient.notes.length - 1 && <div className="absolute left-[7.5px] top-8 bottom-[-48px] w-0.5 bg-slate-100"></div>}
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">{note.date}</span>
                        <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                        <span className="text-[9px] font-black tracking-widest bg-blue-50 text-blue-600 px-2 py-1 rounded-lg border border-blue-100">{note.tag}</span>
                     </div>
                   </div>
                   <p className="text-base leading-relaxed text-slate-600 font-medium bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-100/50">
                     {note.content}
                   </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <section className="elevated-card border-none p-8 shadow-lg">
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-4">
                <div className="h-1 w-4 bg-[var(--color-primary)] rounded-full"></div>
                Active Protocol
             </div>
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900">Current Plan</h3>
               <Link to="/doctor/assign" className="text-xs font-bold text-blue-600 hover:underline">Modify</Link>
            </div>
            <div className="space-y-4">
              {patient.currentPlan.map(ex => (
                <div key={ex.id} className="flex items-center gap-5 rounded-[1.5rem] bg-slate-50 p-5 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all cursor-pointer group shadow-sm hover:shadow-md">
                  <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {ex.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{ex.name}</h4>
                    <p className="text-[11px] text-slate-500 font-bold mt-1.5 flex items-center gap-1.5">
                       <Clock size={10} className="text-blue-400" />
                       {ex.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="elevated-card border-none p-8 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-xl font-bold text-slate-900">Activity Intensity</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Daily session frequency and form accuracy</p>
               </div>
               <div className="flex gap-6">
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Current Streak</p>
                    <p className="text-lg font-black text-emerald-600">12 Days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Missed</p>
                    <p className="text-lg font-black text-rose-500">1</p>
                  </div>
               </div>
            </div>

            <div className="relative">
              {/* Month Labels */}
              <div className="flex justify-between mb-2 px-2">
                 {['Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map(m => (
                   <span key={m} className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{m}</span>
                 ))}
              </div>
              
              <div className="flex gap-1.5 flex-wrap">
                {[...Array(140)].map((_, i) => {
                  // Simulate some activity data
                  const level = Math.random() > 0.3 ? (Math.random() > 0.5 ? (Math.random() > 0.5 ? 4 : 3) : 2) : 0;
                  const colors = [
                    'bg-slate-100/50', // Level 0
                    'bg-emerald-100',  // Level 1
                    'bg-emerald-300',  // Level 2
                    'bg-emerald-500',  // Level 3
                    'bg-emerald-700'   // Level 4
                  ];
                  
                  return (
                    <div 
                      key={i} 
                      className={`h-3 w-3 rounded-sm ${colors[level]} transition-all hover:scale-150 hover:z-10 cursor-pointer shadow-sm`}
                      title={`Activity Level: ${level}`}
                    ></div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 flex items-center justify-end gap-2 px-1">
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Less</span>
                 <div className="flex gap-1">
                    <div className="h-2.5 w-2.5 rounded-sm bg-slate-100/50"></div>
                    <div className="h-2.5 w-2.5 rounded-sm bg-emerald-100"></div>
                    <div className="h-2.5 w-2.5 rounded-sm bg-emerald-300"></div>
                    <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500"></div>
                    <div className="h-2.5 w-2.5 rounded-sm bg-emerald-700"></div>
                 </div>
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">More</span>
              </div>
            </div>
            
            <div className="space-y-6 pt-10 mt-10 border-t border-slate-50">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Biomechanic Metrics</p>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { l: 'Stability: Optimal', c: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                  { l: 'Tilt: Minimal (+2°)', c: 'bg-amber-50 text-amber-700 border-amber-100' },
                  { l: 'Tempo: Consistent', c: 'bg-blue-50 text-blue-700 border-blue-100' },
                  { l: 'Weight Dist: 60/40', c: 'bg-slate-100 text-slate-700 border-slate-200' }
                ].map(tag => (
                  <span key={tag.l} className={`px-4 py-2 rounded-xl text-[10px] font-bold border ${tag.c}`}>
                    {tag.l}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default PatientDetail
