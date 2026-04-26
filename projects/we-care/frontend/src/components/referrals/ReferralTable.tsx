import { useMemo, useState } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'
import { ReferralTableRow } from './ReferralTableRow'
import type { Referral, Urgency } from '../../types/referral'

interface ReferralTableProps {
  referrals: Referral[]
  total: number
  onView: (id: string) => void
  emptyMessage?: string
  doctorColumnLabel?: string
  pagination?: {
    page: number
    totalPages: number
    onPrevious: () => void
    onNext: () => void
  }
}

export function ReferralTable({
  referrals,
  total,
  onView,
  emptyMessage = 'No referrals match your search.',
  doctorColumnLabel = 'Doctor',
  pagination,
}: ReferralTableProps) {
  const [search, setSearch] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | ''>('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')

  const specialties = useMemo(
    () => [...new Set(referrals.map((r) => r.specialty))].sort(),
    [referrals]
  )

  const visible = useMemo(() => {
    return referrals.filter((r) => {
      if (urgencyFilter && r.urgency !== urgencyFilter) return false
      if (specialtyFilter && r.specialty !== specialtyFilter) return false
      if (search && !r.patient.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [referrals, urgencyFilter, specialtyFilter, search])

  const hasActiveFilters = search !== '' || urgencyFilter !== '' || specialtyFilter !== ''

  function clearFilters() {
    setSearch('')
    setUrgencyFilter('')
    setSpecialtyFilter('')
  }

  const columns = useMemo(
    () => [
      'Patient Name',
      'Diagnosis / Reason',
      'Specialty',
      doctorColumnLabel,
      'Urgency',
      'Status',
      'Date',
      'Actions',
    ],
    [doctorColumnLabel],
  )

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-surface pl-8 pr-4 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent"
          />
        </div>

        <div className="relative">
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="cursor-pointer appearance-none rounded-full border border-border bg-surface pl-4 pr-8 py-2 text-sm font-medium text-primary focus:outline-none focus:border-accent"
          >
            <option value="">All Specialties</option>
            {specialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
        </div>

        <div className="relative">
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value as Urgency | '')}
            className="cursor-pointer appearance-none rounded-full border border-border bg-surface pl-4 pr-8 py-2 text-sm font-medium text-primary focus:outline-none focus:border-accent"
          >
            <option value="">All Urgencies</option>
            <option value="HIGH">High</option>
            <option value="ELEVATED">Elevated</option>
            <option value="ROUTINE">Routine</option>
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
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
            {columns.map((col) => (
              <th key={col} className="px-5 py-3">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {visible.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-10 text-center text-sm text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            visible.map((r) => (
              <ReferralTableRow key={r.id} referral={r} onView={onView} />
            ))
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <p className="text-xs text-muted">
          Showing {visible.length} of {total.toLocaleString()} referrals
        </p>
        {pagination ? (
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={pagination.onPrevious}
              className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-muted disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={pagination.onNext}
              className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-primary hover:bg-base transition-colors disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
