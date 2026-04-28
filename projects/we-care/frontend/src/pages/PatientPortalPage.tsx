import { useQuery } from "@tanstack/react-query";
import { Check, Circle, Phone } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { getReferral } from "../lib/patient-api";

function getTimeline(status: string, createdAt: string) {
  const created = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return [
    { id: "created", title: "Referral Created", subtitle: `${created}`, done: true, current: status === "pending" },
    {
      id: "ready",
      title: "Ready to Book",
      subtitle: "Choose a slot and submit your request",
      done: status === "accepted" || status === "completed",
      current: status === "sent",
    },
    {
      id: "confirmation",
      title: "Appointment Confirmed",
      subtitle: "Pending specialist approval",
      done: status === "completed",
      current: status === "accepted",
    },
  ];
}

function getStatusCard(status: string) {
  switch (status) {
    case "pending":
      return {
        title: "Referral Pending",
        subtitle: "Your referral is being processed.",
        buttonText: "Please wait",
        buttonDisabled: true,
      };
    case "sent":
      return {
        title: "Ready to Request",
        subtitle: "Choose a slot and submit your request.",
        buttonText: "Request Appointment",
        buttonDisabled: false,
      };
    case "accepted":
      return {
        title: "Appointment Confirmed",
        subtitle: "Your specialist has accepted the request.",
        buttonText: "View Appointment",
        buttonDisabled: false,
      };
    case "completed":
      return {
        title: "Referral Completed",
        subtitle: "Your appointment has been completed.",
        buttonText: "View Details",
        buttonDisabled: false,
      };
    default:
      return {
        title: "Referral Status",
        subtitle: "Track your referral progress.",
        buttonText: "Request Appointment",
        buttonDisabled: false,
      };
  }
}

function TimelineMarker({ done, current }: { done?: boolean; current?: boolean }) {
  if (done) {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
        <Check size={14} />
      </span>
    );
  }
  if (current) {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-accent bg-white text-accent">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
      </span>
    );
  }
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white text-subtle">
      <Circle size={12} />
    </span>
  );
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

export default function PatientPortalPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const { data: referral, isLoading, isError } = useQuery({
    queryKey: ["patient-referral", token],
    queryFn: () => getReferral(token!),
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <p className="text-muted">Loading your referral…</p>
      </div>
    );
  }

  if (isError || !referral) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <p className="text-muted">This link is invalid or has expired.</p>
      </div>
    );
  }

  const firstName = referral.patients.full_name.split(" ")[0];
  const specialist = referral.targetDoctor;
  const specialistName = specialist?.full_name ?? "Unassigned";
  const specialistSpecialty = specialist?.specialty ?? "N/A";
  const specialistHospital = specialist?.hospital ?? "N/A";
  const specialistPhone = specialist?.phone;
  const timeline = getTimeline(referral.status, referral.created_at);
  const refId = referral.id.slice(0, 5).toUpperCase();
  const statusCard = getStatusCard(referral.status);

  return (
    <div className="min-h-screen bg-base px-4 py-8">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="space-y-5 px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Hello {firstName},</h1>
            <p className="mt-1 text-sm text-muted">
              Here is the latest update on your referral tracker.
            </p>
          </div>

          <section className="rounded-xl border border-border bg-base p-5 text-center">
            <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-widest text-muted uppercase">
              Action Required
            </div>
            <h2 className="mt-3 text-3xl font-semibold text-primary">{statusCard.title}</h2>
            <p className="mt-1 text-sm text-muted">Referral #REF-{refId}</p>
            <p className="mt-1 text-xs text-muted">{statusCard.subtitle}</p>
          </section>

          <section>
            <p className="mb-3 text-xs font-semibold tracking-widest text-muted uppercase">
              Referral Timeline
            </p>
            <div className="rounded-xl border border-border bg-surface p-4">
              {timeline.map((step, index) => (
                <div key={step.id} className="grid grid-cols-[24px_1fr] gap-3">
                  <div className="relative flex justify-center">
                    <TimelineMarker done={step.done} current={step.current} />
                    {index < timeline.length - 1 ? (
                      <span className="absolute top-6 h-10 w-px bg-border" />
                    ) : null}
                  </div>
                  <div className={index < timeline.length - 1 ? "pb-5" : ""}>
                    <p
                      className={`text-lg font-semibold ${step.current ? "text-accent" : "text-primary"}`}
                    >
                      {step.title}
                    </p>
                    <p className="text-sm text-muted">{step.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-3 text-xs font-semibold tracking-widest text-muted uppercase">
              Assigned Specialist
            </p>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
              <SpecialistAvatar name={specialistName} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold text-primary">{specialistName}</p>
                <p className="truncate text-sm text-muted">
                  {specialistSpecialty} • {specialistHospital}
                </p>
              </div>
              {specialistPhone ? (
                <a
                  href={`tel:${specialistPhone}`}
                  aria-label="Call specialist"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                >
                  <Phone size={16} />
                </a>
              ) : (
                <button
                  type="button"
                  aria-label="No phone available"
                  disabled
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400"
                >
                  <Phone size={16} />
                </button>
              )}
            </div>
          </section>
        </div>

        <div className="border-t border-border bg-surface px-4 py-4">
          <Button
            fullWidth
            size="lg"
            onClick={() => navigate("book")}
            disabled={statusCard.buttonDisabled}
          >
            {statusCard.buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
