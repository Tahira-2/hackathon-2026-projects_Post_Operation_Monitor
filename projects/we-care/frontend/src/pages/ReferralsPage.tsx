import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ReferralTable } from '../components/referrals/ReferralTable'
import { Button } from '../components/ui/Button'
import { api } from '../lib/axios'
import type { Referral, ReferralStatus } from '../types/referral'

const URGENCY_MAP: Record<string, Referral['urgency']> = {
  low: 'ROUTINE',
  medium: 'ELEVATED',
  high: 'HIGH',
}

const STATUS_MAP: Record<string, ReferralStatus> = {
  pending: 'PENDING',
  sent: 'SENT',
  accepted: 'ACCEPTED',
  completed: 'COMPLETED',
}

const TYPE_STATUSES: Record<string, ReferralStatus[]> = {
  pending: ['PENDING'],
  sent: ['SENT'],
  accepted: ['ACCEPTED'],
  completed: ['COMPLETED'],
}

const TYPE_LABELS: Record<string, { title: string; subtitle: string }> = {
  pending:   { title: 'Pending Referrals',   subtitle: 'Referrals awaiting action.' },
  sent:      { title: 'Sent Referrals',       subtitle: 'Referrals sent to a specialist.' },
  accepted:  { title: 'Accepted Referrals',   subtitle: 'Referrals accepted by a specialist.' },
  completed: { title: 'Completed Referrals',  subtitle: 'Referrals that have been completed.' },
}

type ReferralRow = {
  id: string
  diagnosis: string | null
  required_specialty: string | null
  urgency: string
  status: string
  created_at: string
  patients: { full_name: string } | null
}

function mapReferral(r: ReferralRow): Referral {
  return {
    id: r.id,
    patient: r.patients?.full_name ?? 'Unknown',
    diagnosis: r.diagnosis ?? 'N/A',
    specialty: r.required_specialty ?? 'N/A',
    specialist: 'Unassigned',
    urgency: URGENCY_MAP[r.urgency] ?? 'ROUTINE',
    status: STATUS_MAP[r.status] ?? 'PENDING',
    date: new Date(r.created_at).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }),
  }
}

async function fetchReferrals(): Promise<Referral[]> {
  const { data } = await api.get('/api/referrals', { params: { pageSize: 100 } })
  const items: ReferralRow[] = data.items ?? data
  return items.map(mapReferral)
}

export default function ReferralsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') ?? ''

  const { data: allReferrals = [], isLoading } = useQuery({
    queryKey: ['referrals'],
    queryFn: fetchReferrals,
  })

  const referrals = useMemo(() => {
    const statuses = TYPE_STATUSES[type]
    if (!statuses) return allReferrals
    return allReferrals.filter((r) => statuses.includes(r.status))
  }, [allReferrals, type])

  const { title, subtitle } = TYPE_LABELS[type] ?? {
    title: 'Referrals',
    subtitle: 'Manage and track all patient referrals.',
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">{title}</h2>
          <p className="text-sm text-muted mt-0.5">{subtitle}</p>
        </div>
        <Button onClick={() => navigate('/referrals/new')}>
          <Plus size={15} />
          New Referral
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-muted">Loading referrals…</div>
      ) : (
        <ReferralTable
          referrals={referrals}
          total={referrals.length}
          onView={(id) => navigate(`/referrals/${id}`)}
        />
      )}
    </div>
  )
}
