import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Users, CalendarClock, CheckCircle2 } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StatCard } from '../components/ui/StatCard'
import { AiInsightCard } from '../components/ui/AiInsightCard'
import { ReferralTable } from '../components/referrals/ReferralTable'
import { useDashboardQuery } from '../lib/auth-hooks'
import { REFERRAL_VIEW_LABELS, normalizeReferralViewType } from '../lib/referral-view'
import { useAuthStore } from '../stores/authStore'

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
  const [searchParams] = useSearchParams()
  const doctor = useAuthStore((state) => state.doctor)
  const viewType = normalizeReferralViewType(searchParams.get('type'))
  const dashboardQuery = useDashboardQuery(viewType)

  if (dashboardQuery.isLoading) {
    return <div className="text-sm text-muted">Loading dashboard...</div>
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <div className="rounded-xl border border-border bg-surface px-6 py-8 text-sm text-muted shadow-sm">
        Unable to load dashboard data right now.
      </div>
    )
  }

  const { kpis, monthlyTrend, bySpecialty, statusDistribution, recentReferrals, aiInsight } = dashboardQuery.data
  const totalStatus = statusDistribution.reduce((sum, entry) => sum + entry.value, 0)
  const doctorName = doctor?.full_name ?? 'Doctor'
  const doctorSpecialty = doctor?.specialty ?? 'your specialty'
  const viewLabel = REFERRAL_VIEW_LABELS[viewType]
  const doctorColumnLabel = viewType === 'outbound' ? 'Target Doctor' : 'Referred By'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary">{viewLabel.title}</h2>
        <p className="text-sm text-muted mt-0.5">
          {doctorName}, here&apos;s your current referral activity across {doctorSpecialty}.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label={viewType === 'pending' ? 'Pending Queue' : `Total ${viewLabel.title.replace(' Referrals', '')}`}
          value={kpis.totalReferrals.toLocaleString()}
          icon={<Users size={20} className="text-accent" />}
          sub={<span className="text-xs text-muted">{viewLabel.subtitle.toLowerCase()}</span>}
        />
        <StatCard
          label="Pending"
          value={kpis.pendingReferrals.toLocaleString()}
          icon={<CalendarClock size={20} className="text-orange-500" />}
          sub={<span className="text-xs text-muted">requires action</span>}
        />
        <StatCard
          label="Completed"
          value={kpis.completedReferrals.toLocaleString()}
          icon={<CheckCircle2 size={20} className="text-green-600" />}
          sub={<span className="text-xs text-muted">{kpis.acceptedReferrals.toLocaleString()} currently accepted</span>}
        />
        <AiInsightCard>{aiInsight}</AiInsightCard>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-4">
        <SectionCard title={`${viewLabel.title} Over Time (6 months)`}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
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
                  data={statusDistribution.map((entry) => ({ ...entry, fill: entry.color }))}
                  cx="50%" cy="50%" innerRadius={35} outerRadius={55}
                  dataKey="value" stroke="none"
                />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-2">
              {statusDistribution.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-primary">{d.name}</span>
                  </div>
                  <span className="text-muted">{totalStatus ? Math.round(d.value / totalStatus * 100) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Top Specialties">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={bySpecialty} layout="vertical" margin={{ top: 0, right: 16, left: 70, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="specialty" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={70} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#F8FAFC' }} />
            <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      <ReferralTable
        referrals={recentReferrals}
        total={kpis.totalReferrals}
        onView={(id) => navigate(`/referrals/${id}`)}
        doctorColumnLabel={doctorColumnLabel}
        emptyMessage={`No recent ${viewType} referrals available.`}
      />
    </div>
  )
}
