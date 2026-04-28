import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SpecialistTableRow } from '../components/specialists/SpecialistTableRow'
import { getSpecialistsDirectory, type SpecialistsDirectoryItem } from '../lib/specialists-api'
import { queryKeys } from '../lib/query-keys'
import type { DirectorySpecialist } from '../types/specialist'

const COLUMNS = ['Specialist Name', 'Specialty', 'Location', 'Actions']

const selectCls = 'cursor-pointer appearance-none rounded-full border border-border bg-surface pl-4 pr-8 py-2 text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1'

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')
}

function mapDirectorySpecialist(clinician: SpecialistsDirectoryItem): DirectorySpecialist {
  return {
    id: clinician.id,
    name: clinician.full_name,
    initials: getInitials(clinician.full_name),
    credentials: clinician.clinician_type === 'doctor' ? 'Doctor' : 'Specialist',
    specialty: clinician.specialty || 'General',
    location: clinician.hospital || 'Unassigned',
    clinicianType: clinician.clinician_type,
  }
}

export default function SpecialistsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const specialistsDirectoryQuery = useQuery({
    queryKey: [...queryKeys.specialistsDirectory, page, pageSize],
    queryFn: () => getSpecialistsDirectory(page, pageSize),
  })

  const specialists = useMemo(
    () => (specialistsDirectoryQuery.data?.items ?? []).map(mapDirectorySpecialist),
    [specialistsDirectoryQuery.data]
  )

  const specialties = useMemo(
    () => Array.from(new Set(specialists.map((specialist) => specialist.specialty))).sort(),
    [specialists]
  )

  const locations = useMemo(
    () => Array.from(new Set(specialists.map((specialist) => specialist.location))).sort(),
    [specialists]
  )

  const visible = useMemo(() => {
    return specialists.filter((specialist) => {
      if (search && !specialist.name.toLowerCase().includes(search.toLowerCase())) return false
      if (specialtyFilter && specialist.specialty !== specialtyFilter) return false
      if (locationFilter && specialist.location !== locationFilter) return false
      return true
    })
  }, [locationFilter, search, specialists, specialtyFilter])

  const hasActiveFilters = search !== '' || specialtyFilter !== '' || locationFilter !== ''

  function clearFilters() {
    setSearch('')
    setSpecialtyFilter('')
    setLocationFilter('')
    setPage(1)
  }

  const total = specialistsDirectoryQuery.data?.total ?? specialists.length
  const totalPages = specialistsDirectoryQuery.data?.totalPages ?? 1
  const canGoPrevious = page > 1
  const canGoNext = page < totalPages

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
              placeholder="Search specialists and doctors..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-full border border-border bg-surface pl-8 pr-4 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent"
            />
          </div>

          <div className="relative">
            <select value={specialtyFilter} onChange={(event) => {
              setSpecialtyFilter(event.target.value)
              setPage(1)
            }} className={selectCls}>
              <option value="">All Specialties</option>
              {specialties.map((specialty) => <option key={specialty} value={specialty}>{specialty}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>

          <div className="relative">
            <select value={locationFilter} onChange={(event) => {
              setLocationFilter(event.target.value)
              setPage(1)
            }} className={selectCls}>
              <option value="">All Locations</option>
              {locations.map((location) => <option key={location} value={location}>{location}</option>)}
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
              {COLUMNS.map((column) => (
                <th key={column} className={`px-5 py-3 ${column === 'Actions' ? 'text-right' : ''}`}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {specialistsDirectoryQuery.isLoading ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-10 text-center text-sm text-muted">
                  Loading directory...
                </td>
              </tr>
            ) : specialistsDirectoryQuery.isError ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-10 text-center text-sm text-muted">
                  Unable to load the directory right now.
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-10 text-center text-sm text-muted">
                  No specialists or doctors match your search.
                </td>
              </tr>
            ) : (
              visible.map((specialist) => (
                <SpecialistTableRow
                  key={specialist.id}
                  specialist={specialist}
                  onViewProfile={(doctorId) => navigate(`/doctors/${doctorId}`)}
                />
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <p className="text-xs text-muted">
            Showing {visible.length} of {total} clinicians
          </p>
          <div className="flex gap-2">
            <button
              disabled={!canGoPrevious}
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-muted disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={!canGoNext}
              onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
              className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-primary hover:bg-base transition-colors disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
