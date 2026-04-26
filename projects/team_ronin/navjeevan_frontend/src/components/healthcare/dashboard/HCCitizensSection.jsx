import { Calendar, Mail, Phone, Save, Users } from 'lucide-react';

export default function HCCitizensSection({
  citizens,
  citizenForm,
  onCitizenChange,
  onCitizenSubmit,
  isSubmitting,
  error,
  success,
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form
          onSubmit={onCitizenSubmit}
          className="rounded-2xl border border-white/10 bg-white/7 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20">
              <Users size={20} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">Add Citizen</h2>
              <p className="text-sm text-slate-400">Register a child and send their Login ID by email.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative">
                <Users size={16} className="pointer-events-none absolute left-3 top-3 text-slate-500" />
                <input
                  value={citizenForm.name}
                  onChange={(event) => onCitizenChange('name', event.target.value)}
                  placeholder="Child name"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-3 text-slate-500" />
                <input
                  value={citizenForm.email}
                  onChange={(event) => onCitizenChange('email', event.target.value)}
                  placeholder="Email address"
                  type="email"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative">
                <Phone size={16} className="pointer-events-none absolute left-3 top-3 text-slate-500" />
                <input
                  value={citizenForm.phoneNumber}
                  onChange={(event) => onCitizenChange('phoneNumber', event.target.value)}
                  placeholder="Phone number"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <Calendar size={16} className="pointer-events-none absolute left-3 top-3 text-slate-500" />
                <input
                  value={citizenForm.dateOfBirth}
                  onChange={(event) => onCitizenChange('dateOfBirth', event.target.value)}
                  type="date"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <input
              value={citizenForm.region}
              onChange={(event) => onCitizenChange('region', event.target.value)}
              placeholder="Region / Ward"
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={citizenForm.specialConditions}
              onChange={(event) => onCitizenChange('specialConditions', event.target.value)}
              placeholder="Special conditions (optional)"
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving Citizen...
                </span>
              ) : (
                <>
                  <Save size={16} /> Save Citizen
                </>
              )}
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-white/10 bg-white/7 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">Citizen Register</h2>
              <p className="text-sm text-slate-400">Recently added citizens and profile data.</p>
            </div>
            <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-200">
              {citizens.length} entries
            </span>
          </div>

          <div className="space-y-4">
            {citizens.map((citizen) => (
              <div key={`${citizen.loginId}-${citizen.name}`} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{citizen.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{citizen.loginId}</p>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                    {citizen.region}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                  <div>
                    <p className="text-slate-500">Email</p>
                    <p className="font-medium text-white">{citizen.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Phone</p>
                    <p className="font-medium text-white">{citizen.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Date of birth</p>
                    <p className="font-medium text-white">{citizen.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Status</p>
                    <p className="font-medium text-white">{citizen.status}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  Special conditions: <span className="font-semibold text-white">{citizen.specialConditions}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}