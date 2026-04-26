import { Link } from 'react-router-dom'
import { Activity, Users, PlusCircle, ArrowUpRight, TrendingUp, Calendar, ChevronRight } from 'lucide-react'

const USERNAME_KEY = 'devcare_username'

function Dashboard() {
  const username = localStorage.getItem(USERNAME_KEY)

  // Mock data
  const patients = [
    { id: 1, name: 'Alice Smith', progress: 75, lastActivity: '2 hours ago', initials: 'AS' },
    { id: 2, name: 'Bob Johnson', progress: 45, lastActivity: '5 hours ago', initials: 'BJ' },
    { id: 3, name: 'Charlie Davis', progress: 90, lastActivity: 'Yesterday', initials: 'CD' },
  ]

  const stats = [
    { label: 'Total Patients', val: '24', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Sessions', val: '12', icon: Activity, color: 'bg-green-50 text-green-600' },
    { label: 'New Requests', val: '3', icon: PlusCircle, color: 'bg-orange-50 text-orange-600' },
  ]

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
               <h3 className="text-2xl font-black mt-1">{stat.val}</h3>
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
              {patients.map(patient => (
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
              ))}
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
               "Based on recent movement data, <strong>Charlie Davis</strong> is ready for advanced stability exercises. Consider adjusting his plan."
             </p>
             <button className="mt-8 w-full py-4 rounded-2xl bg-white text-[var(--color-secondary)] font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
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
