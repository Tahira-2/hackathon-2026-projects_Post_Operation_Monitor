import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Activity, Zap, BookOpen, MessageCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { getDashboardStats } from '../../api/dashboardApi'


const ACCESS_TOKEN_KEY = 'devcare_access_token'
const REFRESH_TOKEN_KEY = 'devcare_refresh_token'
const USERNAME_KEY = 'devcare_username'
const ROLE_KEY = 'devcare_role'

function PatientDashboard() {
  const username = localStorage.getItem('devcare_username')
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    score: 85,
    consistency: 0,
    weekly_done: 0,
    weekly_goal: 6,
    current_plan_name: 'No Active Plan',
    doctor_name: 'No Doctor Assigned',
    exercises: [],
    latest_feedback: { guidance: 'No feedback yet.', date: 'N/A' }
  })

  useEffect(() => {
    async function loadData() {
      try {
        const statsData = await getDashboardStats()
        setData(statsData)
      } catch (err) {
        console.error('Error loading patient dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
      </div>
    )
  }

  const { score, consistency, weekly_done, weekly_goal, current_plan_name, doctor_name, exercises, latest_feedback, session_history } = data

  return (
    <div className="animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-12 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-[var(--color-primary-soft)] to-transparent opacity-50"></div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">
           <div className="h-1 w-4 bg-[var(--color-primary)] rounded-full"></div>
           Welcome Back
        </div>
        <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-900">
          Good morning, {username || 'Patient'}
        </h1>
        <p className="mt-4 text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
          You've reached {score}% of your health goals this week. Keep up the consistent effort—your vital signs are showing significant data-driven progress.
        </p>
      </div>
            {/* Main Content Grid - Large Left Section + Right Sidebar */}
            <section className="mb-12 grid gap-8 lg:grid-cols-3">
              {/* Left Side - Large Featured Section */}
              <div className="lg:col-span-2">
                {/* Therapy Performance Card */}
                <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-10 shadow-sm mb-8 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Your Therapy Score</h3>
                      <p className="mt-6 text-6xl font-black text-slate-900">{score}%</p>
                      <p className="mt-3 text-sm text-slate-500 font-medium">Posture accuracy & exercise completion</p>
                      
                      {/* Metrics Row */}
                      <div className="mt-8 grid grid-cols-2 gap-10">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Consistency</p>
                          <p className="mt-2 text-2xl font-black text-slate-900">{consistency} Sessions</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">This Week</p>
                          <p className="mt-2 text-2xl font-black text-emerald-600">{weekly_done}/{weekly_goal} Done</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-8 relative h-40 w-40 flex items-center justify-center">
                        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                          {/* Background Circle */}
                          <circle
                            className="text-slate-100"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                          {/* Progress Circle */}
                          <circle
                            className="text-emerald-500 transition-all duration-1000 ease-out"
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 40}
                            strokeDashoffset={2 * Math.PI * 40 * (1 - score / 100)}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-black text-slate-900">{score}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Score</span>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Activity Bar Chart */}
                <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-10 shadow-sm mb-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Weekly Activity</h3>
                      <p className="mt-1 text-sm text-slate-500 font-medium">Session frequency tracking</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Streak</p>
                      <p className="text-xl font-black text-[var(--color-primary)]">{data.streak || 0} Days</p>
                    </div>
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={session_history}>
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 10, fontWeight: 700, fill: 'var(--color-text-muted)'}}
                          dy={10}
                        />
                        <YAxis hide domain={[0, 'dataMax + 1']} />
                        <Tooltip 
                          cursor={{fill: 'var(--color-primary-soft)', opacity: 0.1}}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 4, 4]} barSize={24}>
                          {session_history?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.count > 0 ? 'var(--color-primary)' : 'var(--color-border-soft)'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Assigned Therapy Exercises */}
                <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-10 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Assigned Therapy Plan</h3>
                      <p className="mt-1 text-sm text-slate-500 font-medium">{current_plan_name} • Dr. {doctor_name}</p>
                    </div>
                    <button className="text-xs font-black uppercase tracking-widest text-[var(--color-primary)] hover:underline">
                      Full Plan →
                    </button>
                  </div>
                  <div className="space-y-4">
                    {exercises.length > 0 ? (
                      exercises.map((exercise, idx) => (
                        <div key={idx} className={`flex items-center justify-between rounded-2xl p-6 border transition-all hover:shadow-md ${exercise.status === 'completed' ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/30'}`}>
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${exercise.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                              <Activity size={20} />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-slate-900">{exercise.name}</span>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{exercise.sets} • {exercise.difficulty}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${exercise.status === 'completed' ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : 'border-amber-200 bg-amber-100 text-amber-700'}`}>
                            {exercise.status === 'completed' ? '✓ Done' : 'Pending'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        No exercises assigned yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side - Two Stacked Cards with Divider */}
              <div className="space-y-6">
                {/* Top Card - Next Session */}
                <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Next Session</p>
                  <h3 className="text-3xl font-black mb-4">{exercises[0]?.name || 'Next Exercise'}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-10">
                    <Clock size={14} />
                    <span>{exercises.length > 0 ? 'Ready to start' : 'No tasks assigned'}</span>
                  </div>
                  <button 
                    onClick={() => navigate('/my-sessions')} 
                    disabled={exercises.length === 0}
                    className="w-full py-4 rounded-2xl bg-white text-slate-900 font-black text-sm hover:bg-slate-50 transition-all transform active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Session
                  </button>
                </div>

                {/* Bottom Card - Doctor Feedback */}
                <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Doctor Feedback</p>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Latest Review</p>
                      <p className="text-lg font-bold text-slate-800 leading-relaxed italic">"{latest_feedback.guidance}"</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                       <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Review Date</p>
                         <p className="text-sm font-black text-slate-900">{latest_feedback.date}</p>
                       </div>
                       <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Insights Section */}
            <section className="mb-12 rounded-[2.5rem] bg-indigo-900 p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 h-full w-full opacity-10 pointer-events-none">
                 <div className="absolute top-10 right-10 h-64 w-64 border border-white rounded-full"></div>
                 <div className="absolute -bottom-20 -left-20 h-96 w-96 border border-white rounded-full"></div>
              </div>
              <div className="flex items-start gap-6 relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-indigo-300 border border-white/10">
                  <Zap size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black">AI Therapy Insights</h3>
                  <p className="mt-4 text-indigo-100 leading-relaxed font-medium opacity-80">
                    Your average posture accuracy is {score}%. {score >= 80 ? 'Excellent work! Keep maintaining your form.' : 'Focus on your alignment during movements to improve your recovery rate.'} Based on your last sessions, your consistency is at {consistency} sessions.
                  </p>
                  <button className="mt-8 text-xs font-black uppercase tracking-[0.2em] border-b-2 border-indigo-400 pb-1 hover:text-indigo-200 transition-colors">
                    Detailed Analysis →
                  </button>
                </div>
              </div>
            </section>

            {/* Quick Actions Section */}
            <section className="rounded-[2.5rem] bg-slate-50 p-10 border border-slate-100">
              <h3 className="mb-8 text-lg font-black text-slate-900 uppercase tracking-widest">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate('/my-sessions')} className="btn-dark px-8 py-4 rounded-2xl flex items-center gap-3">
                  <Activity size={18} />
                  Start Therapy
                </button>
                <button onClick={() => navigate('/therapy-library')} className="btn-secondary px-8 py-4 rounded-2xl flex items-center gap-3 border-slate-200 bg-white">
                  <BookOpen size={18} />
                  Browse Exercises
                </button>
              </div>
            </section>
    </div>
  )
}

export default PatientDashboard
