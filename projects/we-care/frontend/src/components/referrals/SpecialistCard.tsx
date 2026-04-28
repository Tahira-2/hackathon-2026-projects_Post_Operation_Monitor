import { Check, MapPin } from "lucide-react";
import type { Specialist } from "../../types/specialist";

interface SpecialistCardProps {
  specialist: Specialist;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function SpecialistCard({
  specialist,
  selected,
  onSelect,
}: SpecialistCardProps) {
  return (
    <button
      onClick={() => onSelect(specialist.id)}
      className={[
        "relative w-full rounded-xl border-2 p-4 text-left transition-colors",
        selected
          ? "border-accent bg-blue-50"
          : "border-border bg-surface hover:border-accent/40",
      ].join(" ")}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-accent">
          <Check size={13} strokeWidth={3} className="text-white" />
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
          {specialist.avatarUrl ? (
            <img
              src={specialist.avatarUrl}
              alt={specialist.name}
              className="h-full w-full object-cover"
            />
          ) : (
            specialist.initials
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-primary">{specialist.name}</p>
            <span
              className={[
                "h-2 w-2 rounded-full shrink-0",
                specialist.available ? "bg-green-500" : "bg-slate-300",
              ].join(" ")}
            />
          </div>
          <p className="text-xs font-semibold tracking-wide text-muted uppercase mt-0.5">
            {specialist.subspecialty}
          </p>
          <div className="mt-2 space-y-1 text-xs text-muted">
            <p>{specialist.hospital}</p>
            <div className="flex items-center gap-1.5">
              <MapPin size={12} />
              <span>{specialist.location || "Location unavailable"}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
