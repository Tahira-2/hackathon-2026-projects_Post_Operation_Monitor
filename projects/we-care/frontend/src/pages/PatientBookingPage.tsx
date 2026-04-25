import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Info,
  MapPin,
  Sun,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";

interface DayOption {
  id: string;
  day: string;
  date: string;
  hasAvailability: boolean;
}

interface TimeOption {
  id: string;
  label: string;
  disabled?: boolean;
}

const DATE_OPTIONS: DayOption[] = [
  { id: "mon", day: "MON", date: "12", hasAvailability: true },
  { id: "tue", day: "TUE", date: "13", hasAvailability: true },
  { id: "wed", day: "WED", date: "14", hasAvailability: true },
  { id: "thu", day: "THU", date: "15", hasAvailability: false },
  { id: "fri", day: "FRI", date: "16", hasAvailability: true },
  { id: "sat", day: "SAT", date: "17", hasAvailability: false },
  { id: "sun", day: "SUN", date: "18", hasAvailability: false },
];

const MORNING_SLOTS: TimeOption[] = [
  { id: "09:00", label: "09:00 AM" },
  { id: "09:30", label: "09:30 AM" },
  { id: "10:15", label: "10:15 AM" },
  { id: "11:00", label: "11:00 AM" },
  { id: "11:45", label: "11:45 AM" },
];

const AFTERNOON_SLOTS: TimeOption[] = [
  { id: "13:00", label: "01:00 PM" },
  { id: "13:30", label: "01:30 PM", disabled: true },
  { id: "14:15", label: "02:15 PM" },
  { id: "15:00", label: "03:00 PM" },
  { id: "16:30", label: "04:30 PM" },
];

const DAY_LABELS: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

function DayCard({
  option,
  selected,
  onSelect,
}: {
  option: DayOption;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={[
        "flex h-15.5 w-14 cursor-pointer flex-col items-center justify-between rounded-md border px-2 py-1.5 transition-colors",
        selected
          ? "border-accent bg-accent text-white"
          : "border-border bg-surface text-primary hover:bg-base",
      ].join(" ")}
    >
      <span className="text-[11px] font-medium">{option.day}</span>
      <span className="text-3xl leading-none font-medium">{option.date}</span>
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          option.hasAvailability
            ? selected
              ? "bg-white/90"
              : "bg-emerald-500"
            : "bg-transparent",
        ].join(" ")}
      />
    </button>
  );
}

function TimeButton({
  option,
  selected,
  onSelect,
}: {
  option: TimeOption;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      disabled={option.disabled}
      onClick={() => onSelect(option.id)}
      className={[
        "h-9 w-full rounded-sm border text-sm transition-colors",
        option.disabled
          ? "cursor-not-allowed border-border bg-base text-subtle line-through"
          : selected
            ? "border-accent bg-blue-50 text-primary"
            : "cursor-pointer border-border bg-surface text-primary hover:bg-base",
      ].join(" ")}
    >
      {option.label}
    </button>
  );
}

export default function PatientBookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useParams();
  const [selectedDayId, setSelectedDayId] = useState("mon");
  const [selectedTimeId, setSelectedTimeId] = useState("10:15");

  const selectedDay = useMemo(
    () => DATE_OPTIONS.find((option) => option.id === selectedDayId),
    [selectedDayId],
  );
  const selectedTime = useMemo(
    () =>
      [...MORNING_SLOTS, ...AFTERNOON_SLOTS].find(
        (option) => option.id === selectedTimeId,
      ),
    [selectedTimeId],
  );

  const selectedSummary = `${DAY_LABELS[selectedDay?.id ?? "mon"]} ${selectedDay?.date ?? "12"}, ${selectedTime?.label ?? "10:15 AM"}`;
  const portalBasePath = location.pathname.startsWith("/patient/")
    ? "/patient"
    : "/p";
  const portalPath = token ? `${portalBasePath}/${token}` : portalBasePath;
  const reviewPath = token
    ? `${portalBasePath}/${token}/review`
    : `${portalBasePath}/review`;

  return (
    <div className="min-h-screen bg-[#f2f4f8] pb-28">
      <main className="mx-auto w-full max-w-130 px-4 pt-8">
        <button
          type="button"
          onClick={() => navigate(portalPath)}
          className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary hover:text-accent"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <section className="rounded-lg border border-border bg-surface p-5 shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1614436163996-25cee5f54290?auto=format&fit=crop&w=160&q=80"
              alt="Dr. Sarah Jenkins"
              className="h-16 w-16 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h1 className="truncate text-3xl font-semibold text-primary">
                  Dr. Sarah Jenkins
                </h1>
                <span className="rounded-sm bg-blue-100 px-3 py-1 text-[11px] font-semibold tracking-wider text-accent uppercase">
                  Cardiology
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-primary">
                <MapPin size={12} className="text-muted" />
                Westside Heart Clinic
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-primary">
                <Info size={12} className="text-muted" />
                Consultation • 30 min
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
              Select Date
            </p>
            <div className="flex gap-1.5">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-surface text-primary"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-surface text-primary"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {DATE_OPTIONS.map((option) => (
              <DayCard
                key={option.id}
                option={option}
                selected={option.id === selectedDayId}
                onSelect={setSelectedDayId}
              />
            ))}
          </div>
        </section>

        <section className="mt-7">
          <p className="pb-2 text-xs font-semibold tracking-wider text-primary uppercase">
            Available Times
          </p>
          <div className="border-t border-border pt-3">
            <div className="mb-2 flex items-center gap-2 text-sm text-primary">
              <Sun size={14} className="text-primary" />
              <span>Morning</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {MORNING_SLOTS.map((option) => (
                <TimeButton
                  key={option.id}
                  option={option}
                  selected={option.id === selectedTimeId}
                  onSelect={setSelectedTimeId}
                />
              ))}
            </div>
          </div>
          <div className="mt-5 border-t border-transparent pt-3">
            <div className="mb-2 flex items-center gap-2 text-sm text-primary">
              <Sun size={14} className="text-primary" />
              <span>Afternoon</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {AFTERNOON_SLOTS.map((option) => (
                <TimeButton
                  key={option.id}
                  option={option}
                  selected={option.id === selectedTimeId}
                  onSelect={setSelectedTimeId}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="fixed right-0 bottom-0 left-0 border-t border-border bg-surface">
        <div className="mx-auto flex h-20 w-full max-w-130 items-center justify-between px-4">
          <div>
            <p className="text-xs text-muted">Selected</p>
            <p className="text-3xl font-semibold text-primary">
              {selectedSummary}
            </p>
          </div>
          <Button
            className="w-37.5"
            size="md"
            onClick={() => navigate(reviewPath)}
          >
            Review Request
          </Button>
        </div>
      </footer>
    </div>
  );
}
