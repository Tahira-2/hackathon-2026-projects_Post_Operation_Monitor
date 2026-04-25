import { useState, useEffect, useMemo } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'
import { ReferralTableRow } from './ReferralTableRow'
import type { Referral, ReferralStatus, Urgency } from '../../types/referral'

interface Tab {
  label: string
  filter: ReferralStatus | null
}

const TABS: Tab[] = [
  { label: 'All Referrals', filter: null },
  { label: 'Pending', filter: 'PENDING' },
  { label: 'Sent', filter: 'SENT' },
  { label: 'Accepted', filter: 'ACCEPTED' },
  { label: 'Completed', filter: 'COMPLETED' },
]

const COLUMNS = [
  'Patient Name',
  'Diagnosis / Reason',
  'Specialty',
  'Specialist',
  'Urgency',
  'Status',
  'Date',
  'Actions',
]

interface ReferralTableProps {
  referrals: Referral[]
  total: number
  onView: (id: string) => void
  initialFilter?: ReferralStatus | null
}

export function ReferralTable({ referrals, total, onView, initialFilter = null }: ReferralTableProps) {
  const [activeFilter, setActiveFilter] = useState<ReferralStatus | null>(initialFilter)
  const [search, setSearch] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | ''>('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')

  useEffect(() => {
    setActiveFilter(initialFilter ?? null)
  }, [initialFilter])

  const specialties = useMemo(
    () => [...new Set(referrals.map((r) => r.specialty))].sort(),
    [referrals]
  )

  const visible = useMemo(() => {
    return referrals.filter((r) => {
      if (activeFilter && r.status !== activeFilter) return false
      if (urgencyFilter && r.urgency !== urgencyFilter) return false
      if (specialtyFilter && r.specialty !== specialtyFilter) return false
      if (search && !r.patient.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [referrals, activeFilter, urgencyFilter, specialtyFilter, search])

  const hasActiveFilters = search !== '' || urgencyFilter !== '' || specialtyFilter !== ''

  function clearFilters() {
    setSearch('')
    setUrgencyFilter('')
    setSpecialtyFilter('')
  }

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex gap-1 border-b border-border px-4 pt-3">
        {TABS.map(({ label, filter }) => (
          <button
            key={label}
            onClick={() => setActiveFilter(filter)}
            className={[
              'px-3 py-2 text-sm font-medium transition-colors',
              activeFilter === filter
                ? 'border-b-2 border-accent text-accent'
                : 'text-muted hover:text-primary',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

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
            {COLUMNS.map((col) => (
              <th key={col} className="px-5 py-3">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {visible.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="px-5 py-10 text-center text-sm text-muted">
                No referrals match your search.
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
          Showing 1–{visible.length} of {total.toLocaleString()} referrals
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
  )
}
