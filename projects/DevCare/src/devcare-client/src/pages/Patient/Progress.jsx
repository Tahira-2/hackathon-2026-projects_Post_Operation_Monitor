import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  CalendarDays, 
  Trophy, 
  Activity, 
  CheckCircle2, 
  XCircle,
  Info,
  ChevronRight,
  Flame,
  Target,
  BarChart3,
  Loader2,
  Calendar
} from 'lucide-react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  Cell
} from 'recharts'
import { getSessionHistory } from '../../api/rehabApi'
import { toastError } from '../../utils/toast'

function ProgressPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getSessionHistory()
        
        if (data && data.length > 0) {
          const processedReal = data.map(s => {
            const bps = s.body_part_scores || []
            const avg = bps.length > 0 ? Math.round(bps.reduce((acc, curr) => acc + curr.score, 0) / bps.length) : 0
            const dateObj = new Date(s.completed_at || s.started_at)
            const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            
            return {
              id: s.id,
              date,
              fullDate: dateObj.toLocaleDateString('en-CA'),
              exercise: s.plan_name || 'Therapy Session',
              score: avg,
              status: s.completed_at ? 'Completed' : 'Missed',
              reps: s.results?.reduce((acc, r) => acc + (r.reps || 0), 0) || 0,
              duration: s.completed_at ? '12m' : '0m',
              isReal: true,
              body_part_scores: bps
            }
          })
          
          // Sort by date descending
          processedReal.sort((a, b) => new Date(b.fullDate) - new Date(a.fullDate))
          setSessions(processedReal)
        } else {
          setSessions([])
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err)
        toastError('Unable to load your progress history. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Calculations
  const completedSessions = sessions.filter(s => s.status === 'Completed')
  const totalSessions = sessions.length
  const avgScore = completedSessions.length > 0 
    ? Math.round(completedSessions.reduce((acc, curr) => acc + curr.score, 0) / completedSessions.length)
    : 0
  const completionRate = totalSessions > 0 ? Math.round((completedSessions.length / totalSessions) * 100) : 0
  
  const lastScore = completedSessions.length > 0 ? completedSessions[0].score : 0
  const prevScore = completedSessions.length > 1 ? completedSessions[1].score : lastScore
  const trend = lastScore >= prevScore ? 'up' : 'down'
  const improvement = Math.abs(lastScore - prevScore)
  
  // Dynamic Streak Calculation
  const calculateStreak = () => {
    if (sessions.length === 0) return 0
    const completedSorted = [...sessions].filter(s => s.status === 'Completed')
    if (completedSorted.length === 0) return 0
    
    let streak = 0
    const today = new Date()
    today.setHours(0,0,0,0)
    
    for (let i = 0; i < completedSorted.length; i++) {
      const sessionDate = new Date(completedSorted[i].fullDate)
      sessionDate.setHours(0,0,0,0)
      
      const diffDays = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24))
      
      if (i === 0 && diffDays > 1) return 0
      
      if (i === 0 || diffDays === i || diffDays === i + 1) {
        streak++
      } else {
        break
      }
    }
    return streak
  }
  const currentStreak = calculateStreak()
  
  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1)
  const [barPage, setBarPage] = useState(0)
  const itemsPerPage = 5
  const indexOfLastSession = currentPage * itemsPerPage
  const indexOfFirstSession = indexOfLastSession - itemsPerPage
  const currentSessions = sessions.slice(indexOfFirstSession, indexOfLastSession)
  const totalPages = Math.ceil(sessions.length / itemsPerPage)

  // Git-style Heatmap Data Generation (Last 28 days)
  const generateHeatmapData = () => {
    const data = []
    const today = new Date()
    for (let i = 27; i >= 0; i--) {
      const d = new Date()
      d.setDate(today.getDate() - i)
      const dateStr = d.toLocaleDateString('en-CA') 
      
      const session = sessions.find(s => s.fullDate === dateStr)
      
      data.push({
        date: dateStr,
        status: session ? session.status : 'None'
      })
    }
    return data
  }

  // 5. Anatomical Aggregation
  const getBodyPartAverages = () => {
    const parts = {
      'Shoulder': { total: 0, count: 0 },
      'Elbow': { total: 0, count: 0 },
      'Wrist': { total: 0, count: 0 },
      'Hip': { total: 0, count: 0 },
      'Knee': { total: 0, count: 0 },
      'Ankle': { total: 0, count: 0 }
    }
    
    sessions.forEach(s => {
      if (s.body_part_scores) {
        s.body_part_scores.forEach(bps => {
          if (parts[bps.part]) {
            parts[bps.part].total += bps.score
            parts[bps.part].count++
          }
        })
      }
    })

    return Object.keys(parts).map(part => ({
      name: part,
      score: parts[part].count > 0 ? Math.round(parts[part].total / parts[part].count) : 0
    }))
  }

  const bodyAverages = getBodyPartAverages()

  const heatmapData = generateHeatmapData()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Analyzing your recovery data...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-12 px-4 md:px-0">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/patient/dashboard')}
        className="mb-8 flex items-center gap-2 text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-2">
            <div className="h-1 w-4 bg-[var(--color-primary)] rounded-full"></div>
            Recovery Dashboard
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-text)]">Your Progress</h1>
          <p className="text-lg font-medium text-[var(--color-text-muted)] mt-2">Personalized insights and rehabilitation metrics</p>
        </div>
        
        <div className="bg-green-50 px-6 py-4 rounded-2xl border border-green-100 flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Flame className="h-6 w-6 text-[#4CAF50] fill-[#4CAF50]" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-green-600 tracking-wider">Current Streak</p>
            <p className="text-2xl font-black text-[#4CAF50]">{currentStreak} Days</p>
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Activity className="h-10 w-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No Sessions Yet</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Start your first therapy session to begin tracking your recovery progress and anatomical recovery.
          </p>
          <button 
            onClick={() => navigate('/patient/therapy-library')}
            className="px-8 py-3 bg-[#1E88E5] text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-md"
          >
            Go to Therapy Library
          </button>
        </div>
      ) : (
        <>


      {/* 1. Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <SummaryCard 
          title="Avg Score" 
          value={`${avgScore}%`} 
          icon={<Trophy className="text-yellow-500" />}
          trend={trend === 'up' ? `+${improvement}%` : `-${improvement}%`}
          trendUp={trend === 'up'}
          subtext="Overall accuracy"
        />
        <SummaryCard 
          title="Total Sessions" 
          value={completedSessions.length} 
          icon={<Activity className="text-blue-500" />}
          subtext={`out of ${totalSessions} sessions`}
        />
        <SummaryCard 
          title="Completion Rate" 
          value={`${completionRate}%`} 
          icon={<CheckCircle2 className="text-green-500" />}
          subtext="Plan adherence"
        />
        <SummaryCard 
          title="Weekly Growth" 
          value="+12%" 
          icon={<BarChart3 className="text-purple-500" />}
          subtext="Improvement vs last week"
        />
      </div>

      {/* Refined Recovery Consistency (GitHub-Style) */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm mb-10 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              Recovery Consistency
            </h3>
            <p className="text-sm font-medium text-slate-400">Track your daily therapy adherence and progress</p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
            <Flame size={16} className="text-[#4CAF50] fill-[#4CAF50]" />
            <span className="text-sm font-black text-green-600 tracking-tight">{currentStreak}-day streak</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          {/* Days of week labels */}
          <div className="flex flex-col justify-between py-1 text-[10px] font-bold text-slate-400 uppercase h-40 w-8">
            <span className="h-4">Mon</span>
            <span className="h-4"></span>
            <span className="h-4">Wed</span>
            <span className="h-4"></span>
            <span className="h-4">Fri</span>
            <span className="h-4"></span>
            <span className="h-4">Sun</span>
          </div>
          
          <div className="flex-1 overflow-x-auto pb-2">
            <div className="grid grid-flow-col grid-rows-7 gap-1.5 h-40 w-fit">
              {heatmapData.map((day, idx) => {
                const isToday = day.date === new Date().toISOString().split('T')[0]
                const session = sessions.find(s => s.fullDate === day.date)
                const score = session?.score || 0
                
                // Refined Color System
                let bgColor = '#ECEFF1' // Default: No session
                if (day.status === 'Completed') {
                  if (score >= 95) bgColor = '#2E7D32' // Excellent
                  else if (score >= 80) bgColor = '#66BB6A' // Good
                  else bgColor = '#A5D6A7' // Low/Initial
                } else if (day.status === 'Missed') {
                  bgColor = '#E53935' // Missed
                }

                return (
                  <div 
                    key={idx} 
                    className={`w-4 h-4 rounded-sm transition-all hover:scale-125 cursor-help ${isToday ? 'ring-2 ring-[#1E88E5] ring-offset-1 z-10' : ''}`}
                    style={{ backgroundColor: bgColor }}
                    title={`${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}\nScore: ${score > 0 ? score + '%' : 'N/A'}\nStatus: ${day.status === 'None' ? 'No session' : day.status}`}
                  ></div>
                )
              })}
            </div>
            
            {/* Timeline Month Labels */}
            <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
               <span>Mar 30</span>
               <div className="flex gap-12">
                  <span>April</span>
                  <span>Today →</span>
               </div>
            </div>
          </div>
        </div>
        
        {/* Compact Visual Legend */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-slate-50 pt-6">
           <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-tight text-slate-400">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#ECEFF1]"></div> None</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#E53935]"></div> Missed</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#A5D6A7]"></div> Low</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#66BB6A]"></div> Med</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#2E7D32]"></div> High</div>
           </div>
           
           <div className="bg-slate-50 px-4 py-2 rounded-xl">
              <p className="text-xs font-medium text-slate-500 italic">
                “You've been consistent this week, but missed {sessions.filter(s => s.status === 'Missed' && new Date(s.fullDate) > new Date(Date.now() - 7*24*60*60*1000)).length} sessions. Keep going!”
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* 2. Progress Graph (Main Section) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Accuracy Performance</h3>
              <p className="text-sm text-slate-400">Accuracy score trend</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
              {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trend === 'up' ? 'Improving' : 'Stable'}
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...sessions].reverse()}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1E88E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                  cursor={{ stroke: '#1E88E5', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#1E88E5" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Activity Volume (Bar Chart) with Pagination */}
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
           <div className="flex items-center justify-between mb-2">
             <h3 className="text-xl font-bold text-slate-800">Activity Volume</h3>
             <div className="flex items-center gap-1">
                <button 
                  onClick={() => setBarPage(p => Math.max(p - 1, 0))}
                  disabled={barPage === 0}
                  className="p-1 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors"
                >
                  <ArrowLeft size={16} className="text-slate-400" />
                </button>
                <button 
                  onClick={() => setBarPage(p => p + 1)}
                  disabled={(barPage + 1) * 7 >= sessions.filter(s => s.status === 'Completed').length}
                  className="p-1 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
             </div>
           </div>
           <p className="text-sm text-slate-400 mb-8">Repetitions per session</p>
           
           <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...sessions].filter(s => s.status === 'Completed').reverse().slice(barPage * 7, (barPage + 1) * 7)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="reps" radius={[4, 4, 0, 0]}>
                    {sessions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#1E88E5" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
           
           <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-[var(--color-text-muted)]">Max Reps</p>
                <p className="text-lg font-black text-[var(--color-secondary)]">
                   {Math.max(...completedSessions.map(s => s.reps), 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-[var(--color-text-muted)]">Avg Reps</p>
                <p className="text-lg font-black text-[var(--color-primary)]">
                  {completedSessions.length > 0 ? Math.round(completedSessions.reduce((acc, s) => acc + s.reps, 0) / completedSessions.length) : 0}
                </p>
              </div>
           </div>
        </div>
      </div>

      {/* Anatomical Recovery Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center">
           <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Anatomical Recovery</h3>
              <p className="text-sm text-slate-400 mb-8">Joint-specific performance based on historical session data</p>
              
              <div className="space-y-6">
                {bodyAverages.map(part => (
                  <div key={part.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-600">{part.name}</span>
                      <span className={`text-xs font-black ${part.score >= 80 ? 'text-green-600' : part.score >= 60 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {part.score > 0 ? `${part.score}%` : 'Not Measured'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${part.score >= 80 ? 'bg-green-500' : 'bg-amber-400'}`}
                        style={{ width: `${part.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           <div className="relative w-64 h-[480px] bg-slate-50 rounded-2xl flex items-center justify-center p-6 overflow-hidden">
              {/* Detailed Anatomical Silhouette (Darker) */}
              <svg viewBox="0 0 100 220" className="h-full w-auto text-slate-800 fill-current opacity-20 drop-shadow-sm">
                <path d="
                  M50,5 c4,0,7,3,7,7 c0,4-3,7-7,7 s-7-3-7-7 C43,8,46,5,50,5 z
                  M50,20 c2,0,3,1,3,3 v5
                  c10,1,18,6,22,15 c2,4,3,10,3,15 v25 c0,5-2,10-6,12 c-2,1-4,1-6,0 v110 c0,5-3,10-8,10 s-8-5-8-10 v-85 h-4 v85 c0,5-3,10-8,10 s-8-5-8-10 v-110 c-2,1-4,1-6,0 c-4-2-6-7-6-12 v-25 c0-5,1-11,3-15 c4-9,12-14,22-15 v-5 C47,21,48,20,50,20 z
                " />
              </svg>

              {/* Interaction Nodes (Recalibrated & Labeled) */}
              {/* Shoulders */}
              <BodyNode part="Shoulder" score={bodyAverages.find(a => a.name === 'Shoulder')?.score} top="23%" left="32%" />
              <BodyNode part="Shoulder" score={bodyAverages.find(a => a.name === 'Shoulder')?.score} top="23%" left="64%" />
              {/* Elbows */}
              <BodyNode part="Elbow" score={bodyAverages.find(a => a.name === 'Elbow')?.score} top="40%" left="27%" />
              <BodyNode part="Elbow" score={bodyAverages.find(a => a.name === 'Elbow')?.score} top="40%" left="69%" />
              {/* Hips */}
              <BodyNode part="Hip" score={bodyAverages.find(a => a.name === 'Hip')?.score} top="52%" left="41%" />
              <BodyNode part="Hip" score={bodyAverages.find(a => a.name === 'Hip')?.score} top="52%" left="55%" />
              {/* Knees */}
              <BodyNode part="Knee" score={bodyAverages.find(a => a.name === 'Knee')?.score} top="72%" left="41%" />
              <BodyNode part="Knee" score={bodyAverages.find(a => a.name === 'Knee')?.score} top="72%" left="55%" />
              {/* Ankles */}
              <BodyNode part="Ankle" score={bodyAverages.find(a => a.name === 'Ankle')?.score} top="90%" left="41%" />
              <BodyNode part="Ankle" score={bodyAverages.find(a => a.name === 'Ankle')?.score} top="90%" left="55%" />
           </div>
        </div>

        {/* Weekly Snapshot */}
        <div className="rounded-3xl border border-slate-100 bg-slate-900 p-8 shadow-lg text-white flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar size={20} className="opacity-70" />
              Weekly Report
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-sm opacity-60">Sessions this week</span>
                <span className="text-lg font-bold">6 Sessions</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-sm opacity-60">Avg Accuracy</span>
                <span className="text-lg font-bold">{avgScore}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-60">Growth Score</span>
                <span className="text-lg font-bold text-green-400">+{improvement}%</span>
              </div>
            </div>
          </div>
          <button className="mt-8 w-full py-4 bg-[#1E88E5] text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg">
             Download Detailed PDF
          </button>
        </div>
      </div>



      {/* 3. Session History List */}
      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-[var(--color-text)]">Activity Log</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Complete historical record of your rehabilitation</p>
          </div>
          <button className="text-sm font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1">
             View Archive <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              <div className="col-span-3">Date & Exercise</div>
              <div className="col-span-2">Reps</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-2 text-center">Score</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-1"></div>
            </div>
            
            <div className="space-y-3">
              {currentSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="grid grid-cols-12 gap-4 items-center p-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => session.status === 'Completed' && navigate(`/patient/session-result/${session.id}`)}
                >
                  <div className="col-span-3">
                    <p className="text-xs font-bold text-[var(--color-text-muted)] mb-0.5">{session.date}</p>
                    <p className="font-bold text-[var(--color-secondary)]">{session.exercise}</p>
                  </div>
                  <div className="col-span-2 font-semibold text-[var(--color-text)]">
                    {session.reps > 0 ? `${session.reps} Reps` : '-'}
                  </div>
                  <div className="col-span-2 text-sm text-[var(--color-text-muted)] font-medium">
                    {session.duration}
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black ${
                      session.score >= 80 ? 'bg-green-100 text-green-700' : 
                      session.score >= 60 ? 'bg-blue-100 text-blue-700' : 
                      session.score > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {session.score > 0 ? `${session.score}%` : '-'}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    {session.status === 'Completed' ? (
                      <div className="flex items-center justify-center gap-1.5 text-green-600">
                        <CheckCircle2 size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Success</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 text-[var(--color-danger)]">
                        <XCircle size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Missed</span>
                      </div>
                    )}
                  </div>
                  <div className="col-span-1 text-right">
                    <ChevronRight size={18} className="text-[var(--color-border)] group-hover:text-[var(--color-primary)] transition-colors ml-auto" />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-[var(--color-border)] pt-6">
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Showing {indexOfFirstSession + 1} to {Math.min(indexOfLastSession, sessions.length)} of {sessions.length}
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-30 disabled:hover:border-[var(--color-border)] disabled:hover:text-inherit transition-all"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  
                  <div className="flex items-center gap-1 mx-2">
                    {[...Array(totalPages)].map((_, i) => {
                      // Only show a few pages if there are many
                      if (totalPages > 6 && Math.abs(currentPage - (i + 1)) > 2 && i !== 0 && i !== totalPages - 1) {
                         if (Math.abs(currentPage - (i + 1)) === 3) return <span key={i} className="text-[var(--color-text-muted)]">...</span>
                         return null
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                            currentPage === i + 1 
                            ? 'bg-[var(--color-primary)] text-white shadow-md' 
                            : 'bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft)]'
                          }`}
                        >
                          {i + 1}
                        </button>
                      )
                    })}
                  </div>

                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-30 disabled:hover:border-[var(--color-border)] disabled:hover:text-inherit transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </>
    )}
  </div>
)
}

function SummaryCard({ title, value, icon, trend, trendUp, subtext }) {
  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-xs font-bold uppercase text-[var(--color-text-muted)] tracking-wider">{title}</p>
      <p className="text-3xl font-black text-[var(--color-secondary)] mt-1">{value}</p>
      <p className="text-xs font-medium text-[var(--color-text-muted)] mt-2">{subtext}</p>
    </div>
  )
}

function BodyNode({ part, score, top, left }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-400' : 'bg-slate-300'
  const isRightSide = parseFloat(left) > 50
  
  return (
    <div 
      className="absolute group flex items-center"
      style={{ top, left }}
    >
      <div className={`w-3 h-3 rounded-full ${color} ring-4 ring-white shadow-sm cursor-help transition-all group-hover:scale-150 group-hover:ring-[#1E88E5] z-10`}></div>
      
      {/* Persistent label */}
      <span className={`absolute ${isRightSide ? 'left-5' : 'right-5'} text-[9px] font-black text-slate-400 uppercase tracking-tighter opacity-70 group-hover:opacity-100 group-hover:text-slate-800 transition-all pointer-events-none whitespace-nowrap`}>
        {part}
      </span>

      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
        {part}: {score > 0 ? score + '%' : 'N/A'}
      </div>
    </div>
  )
}

export default ProgressPage
