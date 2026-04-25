import { useState, useMemo } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { SpecialistTableRow } from '../components/specialists/SpecialistTableRow'
import type { DirectorySpecialist, AvailabilityStatus } from '../types/specialist'

const SPECIALISTS: DirectorySpecialist[] = [
  { id: '1', name: 'Dr. Sarah Adams', initials: 'SA', credentials: 'MD, FACC', specialty: 'Cardiology', location: 'Memorial Hospital, West Wing', availabilityStatus: 'available-now', availabilityLabel: 'Available Now' },
  { id: '2', name: 'Dr. Marcus Chen', initials: 'MC', credentials: 'MD, PhD', specialty: 'Neurology', location: 'Central Clinic, Floor 3', availabilityStatus: 'available-soon', availabilityLabel: 'Available in 2 hrs' },
  { id: '3', name: 'Dr. Elena Rodriguez', initials: 'ER', credentials: 'DO, FAAP', specialty: 'Pediatrics', location: "Children's Care Center", availabilityStatus: 'consulting', availabilityLabel: 'Consulting' },
  { id: '4', name: 'Dr. James Patel', initials: 'JP', credentials: 'MD, FACS', specialty: 'Orthopedics', location: 'Sports Medicine Inst.', availabilityStatus: 'in-surgery', availabilityLabel: 'In Surgery' },
  { id: '5', name: 'Dr. Linda Kim', initials: 'LK', credentials: 'MD', specialty: 'Oncology', location: 'Memorial Hospital, East Wing', availabilityStatus: 'available-now', availabilityLabel: 'Available Now' },
]

const TOTAL = 24
const COLUMNS = ['Specialist Name', 'Specialty', 'Location', 'Availability Status', 'Actions']

const AVAILABILITY_OPTIONS: Array<{ label: string; value: AvailabilityStatus | '' }> = [
  { label: 'All Availability', value: '' },
  { label: 'Available Now', value: 'available-now' },
  { label: 'Available Soon', value: 'available-soon' },
  { label: 'Consulting', value: 'consulting' },
  { label: 'In Surgery', value: 'in-surgery' },
]

const selectCls = 'cursor-pointer appearance-none rounded-full border border-border bg-surface pl-4 pr-8 py-2 text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1'

export default function SpecialistsPage() {
  const [search, setSearch] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityStatus | ''>('')

  const specialties = useMemo(
    () => Array.from(new Set(SPECIALISTS.map((s) => s.specialty))).sort(),
    []
  )

  const locations = useMemo(
    () => Array.from(new Set(SPECIALISTS.map((s) => s.location))).sort(),
    []
  )

  const visible = useMemo(() => {
    return SPECIALISTS.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
      if (specialtyFilter && s.specialty !== specialtyFilter) return false
      if (locationFilter && s.location !== locationFilter) return false
      if (availabilityFilter && s.availabilityStatus !== availabilityFilter) return false
      return true
    })
  }, [search, specialtyFilter, locationFilter, availabilityFilter])

  const hasActiveFilters = search !== '' || specialtyFilter !== '' || locationFilter !== '' || availabilityFilter !== ''

  function clearFilters() {
    setSearch('')
    setSpecialtyFilter('')
    setLocationFilter('')
    setAvailabilityFilter('')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">Specialists Directory</h2>
          <p className="text-sm text-muted mt-0.5">Comprehensive network of verified medical professionals.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search specialists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-border bg-surface pl-8 pr-4 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent"
            />
          </div>

          <div className="relative">
            <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)} className={selectCls}>
              <option value="">All Specialties</option>
              {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>

          <div className="relative">
            <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className={selectCls}>
              <option value="">All Locations</option>
              {locations.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>

          <div className="relative">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as AvailabilityStatus | '')}
              className={selectCls}
            >
              {AVAILABILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-full border border-border px-3 py-2 text-sm font-medium text-muted hover:text-primary transition-colors"
            >
              <X size={13} />
              Clear
            </button>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold tracking-wide text-muted uppercase">
              {COLUMNS.map((col) => (
                <th key={col} className={`px-5 py-3 ${col === 'Actions' ? 'text-right' : ''}`}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-10 text-center text-sm text-muted">
                  No specialists match your search.
                </td>
              </tr>
            ) : (
              visible.map((s) => (
                <SpecialistTableRow key={s.id} specialist={s} onViewProfile={() => {}} />
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <p className="text-xs text-muted">
            Showing 1 to {visible.length} of {TOTAL} specialists
          </p>
          <div className="flex gap-2">
            <button disabled className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-muted disabled:opacity-40">
              Previous
            </button>
            <button className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-primary hover:bg-base transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
