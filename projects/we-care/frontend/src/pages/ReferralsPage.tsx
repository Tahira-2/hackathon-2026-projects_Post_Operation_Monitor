import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { ReferralTable } from '../components/referrals/ReferralTable'
import type { Referral, ReferralStatus } from '../types/referral'

const REFERRALS: Referral[] = [
  { id: '1', patient: 'Sarah Jenkins', diagnosis: 'Atypical chest pain', specialty: 'Cardiology', specialist: 'Dr. Robert Chen', urgency: 'HIGH', status: 'PENDING', date: 'Oct 24, 2023' },
  { id: '2', patient: 'Michael Chang', diagnosis: 'Chronic migraine evaluation', specialty: 'Neurology', specialist: 'Dr. Sarah Palmer', urgency: 'ROUTINE', status: 'ACCEPTED', date: 'Oct 23, 2023' },
  { id: '3', patient: 'Elena Rodriguez', diagnosis: 'Suspicious mole excision', specialty: 'Dermatology', specialist: 'Unassigned', urgency: 'ELEVATED', status: 'SENT', date: 'Oct 22, 2023' },
  { id: '4', patient: 'David Kim', diagnosis: 'Post-op physical therapy', specialty: 'Orthopedics', specialist: 'Dr. James Wilson', urgency: 'ROUTINE', status: 'COMPLETED', date: 'Oct 15, 2023' },
  { id: '5', patient: 'Maria Gonzalez', diagnosis: 'Type 2 diabetes management', specialty: 'Endocrinology', specialist: 'Dr. Linda Park', urgency: 'ROUTINE', status: 'PENDING', date: 'Oct 14, 2023' },
  { id: '6', patient: 'James Carter', diagnosis: 'Persistent lower back pain', specialty: 'Orthopedics', specialist: 'Dr. James Wilson', urgency: 'ELEVATED', status: 'ACCEPTED', date: 'Oct 13, 2023' },
  { id: '7', patient: 'Priya Patel', diagnosis: 'Anxiety and sleep disorder', specialty: 'Psychiatry', specialist: 'Dr. Alan Moore', urgency: 'ROUTINE', status: 'SENT', date: 'Oct 12, 2023' },
  { id: '8', patient: 'Tom Nguyen', diagnosis: 'Unexplained weight loss', specialty: 'Oncology', specialist: 'Unassigned', urgency: 'HIGH', status: 'PENDING', date: 'Oct 11, 2023' },
]

// Statuses that belong to each directional view
const TYPE_STATUSES: Record<string, ReferralStatus[]> = {
  inbound: ['PENDING', 'ACCEPTED'],   // referrals coming TO you
  outbound: ['SENT', 'COMPLETED'],    // referrals you sent OUT
  pending: ['PENDING'],               // universal to-do
}

const TYPE_LABELS: Record<string, { title: string; subtitle: string }> = {
  inbound: { title: 'Inbound Referrals', subtitle: 'Patients being referred to you by another provider.' },
  outbound: { title: 'Outbound Referrals', subtitle: 'Patients you referred to another specialist or facility.' },
  pending: { title: 'Pending Referrals', subtitle: 'Referrals awaiting action — your primary to-do list.' },
}

export default function ReferralsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') ?? ''

  const referrals = useMemo(() => {
    const statuses = TYPE_STATUSES[type]
    if (!statuses) return REFERRALS
    return REFERRALS.filter((r) => statuses.includes(r.status))
  }, [type])

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

      <ReferralTable
        referrals={referrals}
        total={referrals.length}
        onView={(id) => navigate(`/referrals/${id}`)}
      />
    </div>
  )
}
