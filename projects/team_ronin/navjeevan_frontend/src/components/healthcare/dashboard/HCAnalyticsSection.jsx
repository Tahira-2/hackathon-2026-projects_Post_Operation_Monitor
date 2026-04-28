import { ClipboardList, ShieldCheck } from 'lucide-react';

export default function HCAnalyticsSection({ metrics, isLoading, error }) {
  const cards = [
    {
      label: 'Total Vaccine History',
      value: metrics.totalVaccineHistory,
      description: 'All recorded vaccine history entries in database',
      tone: 'from-blue-500/20 to-cyan-500/10',
      accent: 'text-blue-200',
    },
    {
      label: 'Upcoming Events',
      value: metrics.upcomingEvents,
      description: 'Events not yet marked as ended',
      tone: 'from-emerald-500/20 to-teal-500/10',
      accent: 'text-emerald-200',
    },
    {
      label: 'Pending Follow-ups',
      value: metrics.pendingFollowUps,
      description: 'Scheduled or missed doses requiring attention',
      tone: 'from-amber-500/20 to-orange-500/10',
      accent: 'text-amber-200',
    },
    {
      label: 'Registered Citizens',
      value: metrics.totalCitizens,
      description: 'Total active citizen profiles',
      tone: 'from-violet-500/20 to-indigo-500/10',
      accent: 'text-violet-200',
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className={`rounded-2xl border border-white/10 bg-gradient-to-br ${card.tone} p-5 shadow-2xl shadow-black/20 backdrop-blur-xl`}
          >
            <p className="text-sm font-medium text-slate-300">{card.label}</p>
            <p className={`mt-3 text-3xl font-extrabold ${card.accent}`}>
              {isLoading ? '...' : card.value}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{card.description}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-white/10 bg-white/7 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-400/20">
              <ClipboardList size={20} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">Service Overview</h2>
              <p className="text-sm text-slate-400">Recent activity across wards and service areas.</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Completed follow-ups', value: metrics.completedFollowUps, tone: 'text-emerald-200' },
              { label: 'Pending follow-ups', value: metrics.pendingFollowUps, tone: 'text-amber-200' },
              { label: 'Upcoming events', value: metrics.upcomingEvents, tone: 'text-blue-200' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-300">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.tone}`}>{isLoading ? '...' : item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/7 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">Operations Notes</h2>
              <p className="text-sm text-slate-400">Quick signals for the staff team.</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">Two new ward programs are ready for scheduling.</div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">Map view is reserved for live ward coverage and outreach planning.</div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">Citizen registration is active for field staff and clinic desk entry.</div>
          </div>
        </div>
      </div>
    </div>
  );
}