import { PlusCircle, Save } from 'lucide-react';

export default function HCProgramsSection({ programs, programForm, onProgramChange, onProgramSubmit }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form
          onSubmit={onProgramSubmit}
          className="rounded-2xl border border-white/10 bg-white/7 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-400/20">
              <PlusCircle size={20} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">Add Upcoming Program</h2>
              <p className="text-sm text-slate-400">Create vaccination camp details for your area.</p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              value={programForm.name}
              onChange={(event) => onProgramChange('name', event.target.value)}
              placeholder="Program name"
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={programForm.date}
                onChange={(event) => onProgramChange('date', event.target.value)}
                placeholder="Date"
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                value={programForm.targetGroup}
                onChange={(event) => onProgramChange('targetGroup', event.target.value)}
                placeholder="Target group"
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <textarea
              value={programForm.location}
              onChange={(event) => onProgramChange('location', event.target.value)}
              placeholder="Location"
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white transition hover:bg-blue-400"
            >
              <Save size={16} /> Save Program
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-white/10 bg-white/7 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">Upcoming Programs</h2>
              <p className="text-sm text-slate-400">Programs you have already scheduled.</p>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              {programs.length} total
            </span>
          </div>

          <div className="space-y-4">
            {programs.map((program) => (
              <div key={`${program.name}-${program.date}`} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{program.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{program.location}</p>
                  </div>
                  <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-200">
                    {program.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                  <div>
                    <p className="text-slate-500">Date</p>
                    <p className="font-medium text-white">{program.date}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Target group</p>
                    <p className="font-medium text-white">{program.targetGroup}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}