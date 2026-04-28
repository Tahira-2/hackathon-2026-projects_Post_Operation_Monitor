import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserPlus, Filter, MoreHorizontal, Users, Loader2 } from 'lucide-react'
import { getMyPatients } from '../../api/connectionsApi'
import { getPatientSessions } from '../../api/rehabApi'
import PatientFilterBar from '../../components/PatientFilterBar'
import { toastError } from '../../utils/toast'

function PatientList() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')



  useEffect(() => {
    const fetchPatientsWithStatus = async () => {
      try {
        const data = await getMyPatients()

        const patientsWithStatus = await Promise.all(data.map(async (p) => {
          let hasPendingReview = false;
          try {
            const sessions = await getPatientSessions(p.id);
            hasPendingReview = sessions.some(s => !s.feedback);
          } catch (err) {
            console.error(`Failed to fetch sessions for patient ${p.id}`, err);
          }

          return {
            id: p.id,
            name: p.name,
            progress: 0,
            condition: 'Recently Connected',
            lastSeen: p.connected_at ? new Date(p.connected_at).toLocaleDateString() : 'N/A',
            status: hasPendingReview ? 'Pending Review' : 'Reviewed',
            risk: 'None',
            isReal: true
          }
        }))

        setPatients(patientsWithStatus)
      } catch (err) {
        console.error(err)
        toastError(err.message || 'Failed to load patients')
      } finally {
        setLoading(false)
      }
    }

    fetchPatientsWithStatus()
  }, [])

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending Review': return 'bg-amber-50 text-amber-600 border-amber-100'
      case 'Reviewed': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      default: return 'bg-slate-50 text-slate-600 border-slate-100'
    }
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toString().includes(searchQuery);

    const matchesFilter = filterStatus === 'All' || patient.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

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
        <PatientFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
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
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Connection Status</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Connected Date</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500"> Status</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(patient => (
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-12 text-center text-slate-500">
                      No patients found matching your search and filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between px-4">
        <p className="text-sm text-slate-500 font-medium">Showing <strong>{filteredPatients.length}</strong> connected patients</p>
        <div className="flex gap-2">
          <button className="btn-secondary py-2 px-6 text-xs" disabled>Previous</button>
          <button className="btn-secondary py-2 px-6 text-xs" disabled={filteredPatients.length < 10}>Next Page</button>
        </div>
      </div>
    </div>
  )
}

export default PatientList
