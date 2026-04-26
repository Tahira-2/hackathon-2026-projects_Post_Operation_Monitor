import { ClipboardList, ShieldCheck } from 'lucide-react';
import { analyticsCards } from './dashboardData';

export default function HCAnalyticsSection() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analyticsCards.map((card) => (
          <article
            key={card.label}
            className={`rounded-2xl border border-white/10 bg-gradient-to-br ${card.tone} p-5 shadow-2xl shadow-black/20 backdrop-blur-xl`}
          >
            <p className="text-sm font-medium text-slate-300">{card.label}</p>
            <p className={`mt-3 text-3xl font-extrabold ${card.accent}`}>{card.value}</p>
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
              { label: 'Children due this week', value: '86', tone: 'text-blue-200' },
              { label: 'Completed follow-ups', value: '61', tone: 'text-emerald-200' },
              { label: 'Programs needing approval', value: '4', tone: 'text-amber-200' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-300">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.tone}`}>{item.value}</p>
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