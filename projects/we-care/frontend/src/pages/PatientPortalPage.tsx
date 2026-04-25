import { Check, Circle, Phone } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";

interface TimelineStep {
  id: string;
  title: string;
  subtitle: string;
  done?: boolean;
  current?: boolean;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: "created",
    title: "Referral Created",
    subtitle: "Dr. Emily Chen • Oct 12",
    done: true,
  },
  {
    id: "ready",
    title: "Ready to Request",
    subtitle: "Choose a slot and submit your request",
    current: true,
  },
  {
    id: "confirmation",
    title: "Specialist Confirmation",
    subtitle: "Pending doctor approval",
  },
];

function TimelineMarker({
  done,
  current,
}: {
  done?: boolean;
  current?: boolean;
}) {
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

export default function PatientPortalPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base px-4 py-8">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="space-y-5 px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Hello Sarah,</h1>
            <p className="mt-1 text-sm text-muted">
              Here is the latest update on your referral tracker.
            </p>
          </div>

          <section className="rounded-xl border border-border bg-base p-5 text-center">
            <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-widest text-muted uppercase">
              Action Required
            </div>
            <h2 className="mt-3 text-3xl font-semibold text-primary">
              Ready to Request
            </h2>
            <p className="mt-1 text-sm text-muted">
              Referral #REF-{token?.slice(0, 5).toUpperCase() ?? "89241"}
            </p>
            <p className="mt-1 text-xs text-muted">
              After you request a slot, the specialist will approve or decline
              it.
            </p>
          </section>

          <section>
            <p className="mb-3 text-xs font-semibold tracking-widest text-muted uppercase">
              Referral Timeline
            </p>
            <div className="rounded-xl border border-border bg-surface p-4">
              {TIMELINE_STEPS.map((step, index) => (
                <div key={step.id} className="grid grid-cols-[24px_1fr] gap-3">
                  <div className="relative flex justify-center">
                    <TimelineMarker done={step.done} current={step.current} />
                    {index < TIMELINE_STEPS.length - 1 ? (
                      <span className="absolute top-6 h-10 w-px bg-border" />
                    ) : null}
                  </div>
                  <div
                    className={index < TIMELINE_STEPS.length - 1 ? "pb-5" : ""}
                  >
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
              <img
                src="https://images.unsplash.com/photo-1614436163996-25cee5f54290?auto=format&fit=crop&w=160&q=80"
                alt="Dr. Elena Rodriguez"
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold text-primary">
                  Dr. Elena Rodriguez
                </p>
                <p className="truncate text-sm text-muted">
                  Cardiology • Memorial Hospital
                </p>
              </div>
              <button
                type="button"
                aria-label="Call specialist"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              >
                <Phone size={16} />
              </button>
            </div>
          </section>
        </div>

        <div className="border-t border-border bg-surface px-4 py-4">
          <Button fullWidth size="lg" onClick={() => navigate("book")}>
            Request Appointment
          </Button>
        </div>
      </div>
    </div>
  );
}
