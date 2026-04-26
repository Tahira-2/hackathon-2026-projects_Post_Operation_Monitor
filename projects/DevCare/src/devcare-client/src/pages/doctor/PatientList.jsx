import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserPlus, Filter, MoreHorizontal, Users, Loader2 } from 'lucide-react'
import { getMyPatients } from '../../api/connectionsApi'

function PatientList() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Mock data for demo consistency
  const mockPatients = [
    { id: 'm1', name: 'Alice Smith', progress: 75, condition: 'ACL Reconstruction', lastSeen: '2026-04-20', status: 'On Track', risk: 'Low' },
    { id: 'm2', name: 'Bob Johnson', progress: 45, condition: 'Shoulder Impingement', lastSeen: '2026-04-18', status: 'Falling Behind', risk: 'High' },
  ]

  useEffect(() => {
    getMyPatients()
      .then(data => {
        // Map real data to match the UI structure
        const realPatients = data.map(p => ({
          id: p.id,
          name: p.name,
          progress: 0,
          condition: 'Recently Connected',
          lastSeen: p.connected_at ? new Date(p.connected_at).toLocaleDateString() : 'N/A',
          status: 'Review Ready',
          risk: 'None',
          isReal: true
        }))
        setPatients([...realPatients, ...mockPatients])
      })
      .catch(err => {
        console.error(err)
        setError(err.message)
        setPatients(mockPatients)
      })
      .finally(() => setLoading(false))
  }, [])

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Falling Behind': return 'bg-red-50 text-red-600 border-red-100'
      case 'Review Ready': return 'bg-blue-50 text-blue-600 border-blue-100'
      default: return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-2">
             <div className="h-1 w-4 bg-[var(--color-primary)] rounded-full"></div>
             Patient Management
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Patient List</h1>
          <p className="text-[var(--color-text-muted)] mt-2 text-lg font-medium">Manage and monitor all your connected patients.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ID or condition..." 
              className="auth-input h-[52px] !pl-14"
            />
          </div>
          <button className="btn-secondary h-[52px]">
            <Filter size={18} />
            <span>Filters</span>
          </button>
          <Link to="/doctor/share" className="btn-primary h-[52px]">
            <UserPlus size={18} />
            <span>New Connection</span>
          </Link>
        </div>
      </div>

      <div className="elevated-card overflow-hidden border-none shadow-xl min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="animate-spin" size={40} />
            <p className="font-bold tracking-widest text-xs uppercase">Syncing Clinical Records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Patient Identity</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Clinical Condition</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Last Encounter</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Clinical Status</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patients.map(patient => (
                  <tr key={patient.id} className="hover:bg-slate-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center font-bold transition-colors ${patient.isReal ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]' : 'bg-slate-100 text-slate-600'}`}>
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                           <span className="block font-bold text-slate-800">{patient.name}</span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {patient.isReal ? `DC-REAL-${patient.id}` : `DC-MOCK-${patient.id}`}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-semibold text-slate-600">{patient.condition}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-slate-500">{patient.lastSeen}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center rounded-lg border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(patient.status)}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <Link 
                          to={`/doctor/patient/${patient.id}`}
                          className="btn-secondary py-2 px-4 text-xs h-9"
                         >
                           Manage
                         </Link>
                         <button className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50">
                           <MoreHorizontal size={18} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between px-4">
         <p className="text-sm text-slate-500 font-medium">Showing <strong>{patients.length}</strong> connected patients</p>
         <div className="flex gap-2">
            <button className="btn-secondary py-2 px-6 text-xs" disabled>Previous</button>
            <button className="btn-secondary py-2 px-6 text-xs" disabled={patients.length < 10}>Next Page</button>
         </div>
      </div>
    </div>
  )
}

export default PatientList
