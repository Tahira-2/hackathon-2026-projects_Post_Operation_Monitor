import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Users, CalendarClock, TrendingUp, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { StatCard } from '../components/ui/StatCard'
import { AiInsightCard } from '../components/ui/AiInsightCard'
import { ReferralTable } from '../components/referrals/ReferralTable'
import { api } from '../lib/axios'
import type { Referral, ReferralStatus } from '../types/referral'

const URGENCY_MAP: Record<string, Referral['urgency']> = {
  low: 'ROUTINE', medium: 'ELEVATED', high: 'HIGH',
}
const STATUS_MAP: Record<string, ReferralStatus> = {
  pending: 'PENDING', sent: 'SENT', accepted: 'ACCEPTED', completed: 'COMPLETED',
}

type ReferralRow = {
  id: string; diagnosis: string | null; required_specialty: string | null
  urgency: string; status: string; created_at: string
  patients: { full_name: string } | null
}

async function fetchReferrals(): Promise<Referral[]> {
  const { data } = await api.get('/api/referrals', { params: { pageSize: 100 } })
  const items: ReferralRow[] = data.items ?? data
  return items.map((r) => ({
    id: r.id,
    patient: r.patients?.full_name ?? 'Unknown',
    diagnosis: r.diagnosis ?? 'N/A',
    specialty: r.required_specialty ?? 'N/A',
    specialist: 'Unassigned',
    urgency: URGENCY_MAP[r.urgency] ?? 'ROUTINE',
    status: STATUS_MAP[r.status] ?? 'PENDING',
    date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }))
}

const MONTHLY_TREND = [
  { month: 'May', referrals: 78 }, { month: 'Jun', referrals: 95 },
  { month: 'Jul', referrals: 88 }, { month: 'Aug', referrals: 112 },
  { month: 'Sep', referrals: 134 }, { month: 'Oct', referrals: 156 },
  { month: 'Nov', referrals: 142 }, { month: 'Dec', referrals: 168 },
  { month: 'Jan', referrals: 185 }, { month: 'Feb', referrals: 172 },
  { month: 'Mar', referrals: 198 }, { month: 'Apr', referrals: 220 },
]

const BY_SPECIALTY = [
  { specialty: 'Cardiology', count: 312 },
  { specialty: 'Neurology', count: 248 },
  { specialty: 'Orthopedics', count: 196 },
  { specialty: 'Dermatology', count: 154 },
  { specialty: 'Oncology', count: 132 },
]

const STATUS_DIST = [
  { name: 'Completed', value: 856, color: '#22c55e' },
  { name: 'Accepted', value: 214, color: '#3b82f6' },
  { name: 'Pending', value: 112, color: '#f97316' },
  { name: 'Sent', value: 66, color: '#94a3b8' },
]

const TOTAL_STATUS = STATUS_DIST.reduce((s, d) => s + d.value, 0)

const tooltipStyle = { borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-primary">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: allReferrals = [] } = useQuery({
    queryKey: ['referrals'],
    queryFn: fetchReferrals,
  })

  const totalReferrals = allReferrals.length
  const pendingCount = allReferrals.filter((r) => r.status === 'PENDING').length
  const recentReferrals = allReferrals.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary">Dashboard</h2>
        <p className="text-sm text-muted mt-0.5">Overview of your referral network and patient flow.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Referrals"
          value={totalReferrals.toString()}
          icon={<Users size={20} className="text-accent" />}
          sub={<span className="flex items-center gap-1 text-green-600 text-xs font-medium"><TrendingUp size={12} />live</span>}
        />
        <StatCard
          label="Pending"
          value={pendingCount.toString()}
          icon={<CalendarClock size={20} className="text-orange-500" />}
          sub={<span className="text-xs text-muted">requires action</span>}
        />
        <StatCard
          label="Avg Response"
          value="4.2 hrs"
          icon={<Clock size={20} className="text-muted" />}
          sub={<span className="text-xs text-green-600 font-medium">↓ 18 min improvement</span>}
        />
        <AiInsightCard>
          Cardiology wait times up <strong>14%</strong>. Route non-urgent cases to alternative specialists.
        </AiInsightCard>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-[1fr_340px] gap-4">
        <SectionCard title="Referrals Over Time (12 months)">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_TREND} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="refGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ fontWeight: 600, color: '#0F172A' }} />
              <Area type="monotone" dataKey="referrals" stroke="#2563EB" strokeWidth={2} fill="url(#refGrad)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Status Distribution">
          <div className="flex flex-col items-center gap-4">
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={STATUS_DIST.map((d) => ({ ...d, fill: d.color }))}
                  cx="50%" cy="50%" innerRadius={35} outerRadius={55}
                  dataKey="value" stroke="none"
                />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-2">
              {STATUS_DIST.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-primary">{d.name}</span>
                  </div>
                  <span className="text-muted">{Math.round(d.value / TOTAL_STATUS * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Specialty bar chart */}
      <SectionCard title="Top Specialties">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={BY_SPECIALTY} layout="vertical" margin={{ top: 0, right: 16, left: 70, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="specialty" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={70} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#F8FAFC' }} />
            <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Referrals table */}
      <ReferralTable
        referrals={recentReferrals}
        total={totalReferrals}
        onView={(id) => navigate(`/referrals/${id}`)}
      />
    </div>
  )
}
