import { Building2 } from 'lucide-react';
import { navigationItems } from './dashboardData';

export default function HCDashboardSidebar({ activeSection, onSelectSection, displayName, onLogout }) {
  return (
    <aside className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl lg:min-h-screen lg:w-80 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col p-5">
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20">
            <Building2 size={22} />
          </span>
          <div>
            <p className="text-lg font-semibold text-white">Healthcare Portal</p>
            <p className="text-xs text-slate-400">Operational dashboard for staff</p>
          </div>
        </div>

        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-emerald-300' : 'text-slate-400'} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <p className="font-semibold text-white">Signed in as</p>
          <p className="mt-1 text-slate-400">{displayName}</p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-4 inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-400"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}