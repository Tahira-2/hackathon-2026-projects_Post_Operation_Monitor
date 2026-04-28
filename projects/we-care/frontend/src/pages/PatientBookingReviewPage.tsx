import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock3, MapPin, type LucideIcon } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { bookAppointment, getReferral } from "../lib/patient-api";

interface BookingState {
  preferred_date: string;
  time_slot: "morning" | "afternoon" | "evening";
  dateLabel: string;
  timeLabel: string;
}

interface AppointmentDetail {
  label: string;
  value: string;
  Icon: LucideIcon;
}

function SpecialistAvatar({ name }: { name: string }) {
  const initials = name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
      {initials}
    </span>
  );
}

export default function PatientBookingReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useParams();
  const state = location.state as BookingState | null;

  const { data: referral } = useQuery({
    queryKey: ["patient-referral", token],
    queryFn: () => getReferral(token!),
    enabled: !!token,
  });

  const portalBasePath = location.pathname.startsWith("/patient/") ? "/patient" : "/p";
  const bookingPath = token
    ? `${portalBasePath}/${token}/book`
    : `${portalBasePath}/book`;
  const confirmationPath = token
    ? `${portalBasePath}/${token}/confirmed`
    : `${portalBasePath}/confirmed`;

  const mutation = useMutation({
    mutationFn: () =>
      bookAppointment(token!, {
        preferred_date: state!.preferred_date,
        time_slot: state!.time_slot,
      }),
    onSuccess: (appointment) => {
      navigate(confirmationPath, {
        state: {
          appointment,
          specialist: referral?.targetDoctor,
          dateLabel: state?.dateLabel,
          timeLabel: state?.timeLabel,
        },
      });
    },
  });

  const specialist = referral?.targetDoctor;

  const details: AppointmentDetail[] = [
    {
      label: "Date",
      value: state?.dateLabel
        ? new Date(state.preferred_date + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "—",
      Icon: CalendarDays,
    },
    {
      label: "Time",
      value: state?.timeLabel ?? "—",
      Icon: Clock3,
    },
    {
      label: "Location",
      value: specialist?.hospital ?? "—",
      Icon: MapPin,
    },
  ];

  return (
    <div className="min-h-screen bg-[#eceef3]">
      <main className="mx-auto flex w-full max-w-150 justify-center px-4 py-10 sm:py-14 md:py-16">
        <section className="w-full rounded-xl border border-border bg-surface shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
          <div className="border-b border-border p-6 text-center">
            <h2 className="text-xl font-semibold text-primary sm:text-2xl">
              Review Your Request
            </h2>
            <p className="mt-2 text-sm text-muted">
              Submit this request and wait for specialist approval.
            </p>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="flex items-center gap-3">
              {specialist ? (
                <SpecialistAvatar name={specialist.full_name} />
              ) : (
                <div className="h-12 w-12 rounded-full bg-slate-100" />
              )}
              <div className="min-w-0">
                <p className="truncate text-lg leading-tight font-semibold text-primary sm:text-xl">
                  {specialist?.full_name ?? "Loading…"}
                </p>
                <p className="text-xs font-semibold tracking-wider text-accent uppercase">
                  {specialist?.specialty ?? ""}
                </p>
                <p className="text-[16px] text-muted">{specialist?.hospital ?? ""}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-base p-4">
              {details.map(({ label, value, Icon }, index) => (
                <div key={label}>
                  <div className="flex gap-3">
                    <Icon size={16} className="mt-0.5 text-muted" />
                    <div>
                      <p className="text-xs font-semibold tracking-wider text-muted uppercase">
                        {label}
                      </p>
                      <p className="text-[17px] leading-snug text-primary">{value}</p>
                    </div>
                  </div>
                  {index < details.length - 1 ? (
                    <div className="my-3 border-t border-border" />
                  ) : null}
                </div>
              ))}
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-500">
                Something went wrong. Please try again.
              </p>
            )}

            <div className="space-y-3 pt-1">
              <Button
                fullWidth
                size="lg"
                className="rounded-lg tracking-wider uppercase"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !state}
              >
                {mutation.isPending ? "Submitting…" : "Submit Request"}
              </Button>
              <Button
                fullWidth
                size="lg"
                variant="ghost"
                className="rounded-lg border border-border bg-surface tracking-wider uppercase hover:bg-base"
                onClick={() => navigate(bookingPath)}
                disabled={mutation.isPending}
              >
                Edit Selection
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
