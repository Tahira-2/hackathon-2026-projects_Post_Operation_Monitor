import { CalendarDays, Clock3, IdCard, MapPin, type LucideIcon } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";

interface AppointmentDetail {
  label: string;
  value: string;
  Icon: LucideIcon;
}

interface BookingReviewContent {
  title: string;
  subtitle: string;
  doctor: {
    name: string;
    specialty: string;
    clinic: string;
    avatarUrl: string;
  };
  details: AppointmentDetail[];
  insurance: {
    provider: string;
    memberId: string;
  };
  actions: {
    confirmLabel: string;
    editLabel: string;
  };
}

const REVIEW_CONTENT: BookingReviewContent = {
  title: "Review Your Request",
  subtitle: "Submit this request and wait for specialist approval.",
  doctor: {
    name: "Dr. Sarah Jenkins",
    specialty: "Cardiology",
    clinic: "Westside Heart Clinic",
    avatarUrl:
      "https://images.unsplash.com/photo-1614436163996-25cee5f54290?auto=format&fit=crop&w=160&q=80",
  },
  details: [
    {
      label: "Date",
      value: "Monday, Oct 12, 2023",
      Icon: CalendarDays,
    },
    {
      label: "Time",
      value: "10:15 AM",
      Icon: Clock3,
    },
    {
      label: "Location",
      value: "Westside Heart Clinic, Suite 400",
      Icon: MapPin,
    },
  ],
  insurance: {
    provider: "Blue Shield",
    memberId: "XYZ123",
  },
  actions: {
    confirmLabel: "Submit Request",
    editLabel: "Edit Selection",
  },
};

export default function PatientBookingReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useParams();

  const portalBasePath = location.pathname.startsWith("/patient/")
    ? "/patient"
    : "/p";
  const bookingPath = token
    ? `${portalBasePath}/${token}/book`
    : `${portalBasePath}/book`;
  const confirmationPath = token
    ? `${portalBasePath}/${token}/confirmed`
    : `${portalBasePath}/confirmed`;

  return (
    <div className="min-h-screen bg-[#eceef3]">
      <main className="mx-auto flex w-full max-w-150 justify-center px-4 py-10 sm:py-14 md:py-16">
        <section className="w-full rounded-xl border border-border bg-surface shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
          <div className="border-b border-border p-6 text-center">
            <h2 className="text-xl font-semibold text-primary sm:text-2xl">
              {REVIEW_CONTENT.title}
            </h2>
            <p className="mt-2 text-sm text-muted ">
              {REVIEW_CONTENT.subtitle}
            </p>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="flex items-center gap-3">
              <img
                src={REVIEW_CONTENT.doctor.avatarUrl}
                alt={REVIEW_CONTENT.doctor.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-lg leading-tight font-semibold text-primary sm:text-xl">
                  {REVIEW_CONTENT.doctor.name}
                </p>
                <p className="text-xs font-semibold tracking-wider text-accent uppercase">
                  {REVIEW_CONTENT.doctor.specialty}
                </p>
                <p className="text-[16px] text-muted">{REVIEW_CONTENT.doctor.clinic}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-base p-4">
              {REVIEW_CONTENT.details.map(({ label, value, Icon }, index) => (
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

                  {index < REVIEW_CONTENT.details.length - 1 ? (
                    <div className="my-3 border-t border-border" />
                  ) : null}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-base px-3 py-2.5">
              <div className="flex items-center gap-2 text-[18px] text-primary">
                <IdCard size={14} className="text-muted" />
                <span>{REVIEW_CONTENT.insurance.provider}</span>
              </div>
              <p className="text-[18px] text-primary">
                ID: {REVIEW_CONTENT.insurance.memberId}
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <Button
                fullWidth
                size="lg"
                className="rounded-lg tracking-wider uppercase"
                onClick={() => navigate(confirmationPath)}
              >
                {REVIEW_CONTENT.actions.confirmLabel}
              </Button>
              <Button
                fullWidth
                size="lg"
                variant="ghost"
                className="rounded-lg border border-border bg-surface tracking-wider uppercase hover:bg-base"
                onClick={() => navigate(bookingPath)}
              >
                {REVIEW_CONTENT.actions.editLabel}
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
