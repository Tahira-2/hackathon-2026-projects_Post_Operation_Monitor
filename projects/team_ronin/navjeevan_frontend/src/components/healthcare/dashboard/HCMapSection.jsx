import { MapPinned } from 'lucide-react';

export default function HCMapSection() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/7 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-400/20">
              <MapPinned size={20} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">Map View</h2>
              <p className="text-sm text-slate-400">The map section is already handled separately.</p>
            </div>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
          Placeholder only
        </span>
      </div>

      <div className="mt-6 flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-white/15 bg-slate-950/60 p-8 text-center">
        <div className="max-w-md">
          <MapPinned size={42} className="mx-auto text-cyan-300" />
          <h3 className="mt-4 text-lg font-semibold text-white">Map integration goes here</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            This dashboard only reserves the map section. You can plug in the existing map view here without building new UI.
          </p>
        </div>
      </div>
    </div>
  );
}