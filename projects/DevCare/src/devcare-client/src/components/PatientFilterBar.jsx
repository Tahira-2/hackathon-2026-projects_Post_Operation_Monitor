import { Search, Filter, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PatientFilterBar({ 
  searchQuery, 
  setSearchQuery, 
  filterStatus, 
  setFilterStatus 
}) {
  return (
    <div className="flex flex-wrap gap-3 w-full lg:w-auto">
      <div className="relative flex-1 min-w-[280px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, ID or condition..." 
          className="auth-input h-[52px] w-full !pl-14"
        />
      </div>
      
      <div className="relative">
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="btn-secondary h-[52px] appearance-none pl-4 pr-12 cursor-pointer outline-none bg-white"
        >
          <option value="All">All Statuses</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Reviewed">Reviewed</option>
          <option value="On Track">On Track</option>
          <option value="Falling Behind">Falling Behind</option>
        </select>
        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-secondary)] pointer-events-none" size={18} />
      </div>

      <Link to="/doctor/share" className="btn-primary h-[52px]">
        <UserPlus size={18} />
        <span>New Connection</span>
      </Link>
    </div>
  )
}
