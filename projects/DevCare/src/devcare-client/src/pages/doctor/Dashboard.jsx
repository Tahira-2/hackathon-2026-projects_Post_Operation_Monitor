import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Users, PlusCircle, ArrowUpRight, TrendingUp, Calendar, ChevronRight, Loader2 } from 'lucide-react'
import { getMyPatients } from '../../api/connectionsApi'
import { getPatientSessions } from '../../api/rehabApi'

const USERNAME_KEY = 'devcare_username'

const iconMap = {
  Users,
  Activity,
  PlusCircle,
}

function Dashboard() {
  const username = localStorage.getItem(USERNAME_KEY)

  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [statsData, setStatsData] = useState({ totalPatients: 0, totalSessions: 0, pendingReviews: 0 })
  const [insight, setInsight] = useState("AI is analyzing patient data...")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientsData = await getMyPatients()
        
        let totalSessions = 0;
        let pendingReviews = 0;
        
        const patientsWithSessions = await Promise.all(patientsData.map(async (p) => {
          try {
            const sessions = await getPatientSessions(p.id);
            totalSessions += sessions.length;
            pendingReviews += sessions.filter(s => !s.feedback).length;
            
            const lastSessionDate = sessions.length > 0 
              ? new Date(sessions[0].started_at).toLocaleDateString() 
              : 'No sessions yet';
              
            return {
              ...p,
              initials: p.name.split(' ').map(n => n[0]).join(''),
              lastActivity: lastSessionDate,
              sessionsCount: sessions.length
            }
          } catch (e) {
            return {
              ...p,
              initials: p.name.split(' ').map(n => n[0]).join(''),
              lastActivity: 'N/A',
              sessionsCount: 0
            }
          }
        }))

        patientsWithSessions.sort((a, b) => b.sessionsCount - a.sessionsCount)

        setPatients(patientsWithSessions.slice(0, 5))
        setStatsData({
          totalPatients: patientsData.length,
          totalSessions: totalSessions,
          pendingReviews: pendingReviews
        })
        
        if (patientsWithSessions.length > 0 && patientsWithSessions[0].sessionsCount > 0) {
           setInsight(`Based on recent movement data, ${patientsWithSessions[0].name} has completed several sessions. Consider reviewing their progress.`)
        } else {
           setInsight("No recent session data available. Consider assigning new therapy plans to your patients.")
        }

      } catch (error) {
        console.error("Failed to load dashboard data", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const stats = [
    { label: 'Total Patients', val: statsData.totalPatients.toString(), icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Sessions', val: statsData.totalSessions.toString(), icon: Activity, color: 'bg-green-50 text-green-600' },
    { label: 'Pending Reviews', val: statsData.pendingReviews.toString(), icon: PlusCircle, color: 'bg-orange-50 text-orange-600' },
  ]

  const handleGenerateSuggestions = () => {
    window.dispatchEvent(new CustomEvent('generate-suggestion'))
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
      </div>
    )
  }


  return (
    <div className="animate-fade-in">
      <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-2">
             <div className="h-1 w-4 bg-[var(--color-primary)] rounded-full"></div>
             Physician Portal
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Hello, Dr. {username || 'Physician'}
          </h1>
          <p className="mt-2 text-lg text-[var(--color-text-muted)] font-medium">
            Monitor patient progress and manage clinical tasks.
          </p>
        </div>
        <div className="flex gap-3">
           <Link to="/doctor/assign" className="btn-primary">
             <PlusCircle size={18} />
             <span>New Therapy</span>
           </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-3 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="elevated-card p-6 flex items-center gap-5">
             <div className={`h-14 w-14 rounded-2xl ${stat.color} flex items-center justify-center`}>
               <stat.icon size={28} />
             </div>
             <div>
               <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{stat.label}</p>
               <h3 className="text-2xl font-black mt-1">
                 {loading ? <Loader2 className="animate-spin text-slate-400" size={24} /> : stat.val}
               </h3>
             </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Content: Patient List */}
        <div className="lg:col-span-8 space-y-8">
          <section className="elevated-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--color-border-soft)] p-8">
              <div>
                <h2 className="text-xl font-bold">Recent Patients</h2>
                <p className="text-sm text-[var(--color-text-muted)] font-medium mt-1">High-priority monitoring list</p>
              </div>
              <Link to="/doctor/patients" className="flex items-center gap-1 text-sm font-bold text-[var(--color-primary)] hover:gap-2 transition-all">
                See all patients <ArrowUpRight size={16} />
              </Link>
            </div>
            
            <div className="divide-y divide-[var(--color-border-soft)]">
              {loading ? (
                <div className="p-8 text-center text-[var(--color-text-muted)] font-medium">Loading patients...</div>
              ) : patients.length > 0 ? (
                patients.map(patient => (
                  <div key={patient.id} className="flex items-center justify-between p-8 hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-[var(--color-secondary)] group-hover:bg-[var(--color-primary-soft)] group-hover:text-[var(--color-primary)] transition-colors">
                        {patient.initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{patient.name}</h4>
                        <p className="text-sm text-[var(--color-text-muted)] font-medium">Last Session: {patient.lastActivity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <Link 
                        to={`/doctor/patient/${patient.id}`}
                        className="h-10 w-10 flex items-center justify-center rounded-full border border-[var(--color-border)] hover:bg-white hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] shadow-sm transition-all"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-[var(--color-text-muted)] font-medium">No recent patients connected.</div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: AI Assistant & Alerts */}
        <div className="lg:col-span-4 space-y-8">
           <section className="bg-[var(--color-secondary)] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
             <div className="absolute -right-4 -top-4 h-32 w-32 bg-white/5 rounded-full blur-2xl"></div>
             <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Activity size={20} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-bold">AI Clinical Insight</h3>
             </div>
             <p className="text-sm leading-relaxed opacity-80 font-medium">
               "{insight}"
             </p>
             <button 
               onClick={handleGenerateSuggestions}
               className="mt-8 w-full py-4 rounded-2xl bg-white text-[var(--color-secondary)] font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
             >
                Generate Suggestions
                <ArrowUpRight size={16} />
             </button>
           </section>

        </div>
      </div>
    </div>
  )
}

export default Dashboard
