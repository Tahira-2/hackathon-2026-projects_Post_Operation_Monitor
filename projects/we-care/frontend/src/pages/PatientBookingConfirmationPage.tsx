import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Stethoscope,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";

interface ConfirmationSummaryItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const CONFIRMATION_CONTENT = {
  title: "Appointment Requested",
  message:
    "Your appointment request has been sent to Dr. Sarah Jenkins at Westside Heart Clinic. You will receive a confirmation email and SMS once they approve the slot.",
  ctaLabel: "Back to My Referral",
  summaryTitle: "Request Summary",
  summaryItems: [
    {
      label: "Specialist",
      value: "Dr. Sarah Jenkins",
      icon: Stethoscope,
    },
    {
      label: "Date",
      value: "Monday, Oct 12, 2023",
      icon: CalendarDays,
    },
    {
      label: "Time",
      value: "10:15 AM",
      icon: Clock3,
    },
    {
      label: "Location",
      value: "Westside Heart Clinic, Suite 400",
      icon: MapPin,
    },
  ] as ConfirmationSummaryItem[],
};

export default function PatientBookingConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useParams();

  const portalBasePath = location.pathname.startsWith("/patient/")
    ? "/patient"
    : "/p";
  const portalPath = token ? `${portalBasePath}/${token}` : portalBasePath;

  return (
    <div className="min-h-screen bg-[#eceef3]">
      <main className="mx-auto w-full max-w-130 px-4 py-12 sm:py-16">
        <section className="mx-auto max-w-96 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_4px_12px_rgba(5,150,105,0.25)]">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-7 w-7"
              aria-hidden="true"
            >
              <path
                d="M4.5 10.5L8.2 14.2L15.5 6.8"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="mt-6 text-3xl font-semibold text-primary sm:text-4xl">
            {CONFIRMATION_CONTENT.title}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-[16px] leading-7 text-primary/75">
            {CONFIRMATION_CONTENT.message}
          </p>

          <div className="mt-8 rounded-xl border border-border bg-surface p-5 text-left sm:p-6">
            <p className="text-xs font-semibold tracking-widest text-muted uppercase">
              {CONFIRMATION_CONTENT.summaryTitle}
            </p>

            <div className="mt-4 space-y-0">
              {CONFIRMATION_CONTENT.summaryItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.label}>
                    <div className="flex items-start gap-3 py-2.5">
                      <Icon size={16} className="mt-0.5 text-muted" />
                      <div>
                        <p className="text-xs font-medium tracking-wider text-muted uppercase">
                          {item.label}
                        </p>
                        <p className="text-[16px] leading-snug text-primary">
                          {item.value}
                        </p>
                      </div>
                    </div>

                    {index < CONFIRMATION_CONTENT.summaryItems.length - 1 ? (
                      <div className="border-t border-border" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            fullWidth
            size="lg"
            className="mt-6 rounded-lg text-base"
            onClick={() => navigate(portalPath)}
          >
            {CONFIRMATION_CONTENT.ctaLabel}
            <ArrowRight size={16} />
          </Button>
        </section>
      </main>
    </div>
  );
}
