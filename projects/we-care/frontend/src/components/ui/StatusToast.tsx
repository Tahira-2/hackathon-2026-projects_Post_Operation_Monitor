import { CheckCircle2, CircleAlert, X } from "lucide-react";

interface StatusToastProps {
  message: string;
  tone: "success" | "error";
  onClose: () => void;
}

const TONE_STYLES = {
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: "text-emerald-600",
    button: "text-emerald-700 hover:bg-emerald-100",
    Icon: CheckCircle2,
  },
  error: {
    container: "border-red-200 bg-red-50 text-red-900",
    icon: "text-red-600",
    button: "text-red-700 hover:bg-red-100",
    Icon: CircleAlert,
  },
} as const;

export function StatusToast({ message, tone, onClose }: StatusToastProps) {
  const { container, icon, button, Icon } = TONE_STYLES[tone];

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex w-[min(24rem,calc(100vw-2rem))] items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${container}`}
      role="alert"
      aria-live="polite"
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${icon}`} />
      <p className="min-w-0 flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className={`rounded-md p-1 transition-colors ${button}`}
        aria-label="Dismiss status message"
      >
        <X size={16} />
      </button>
    </div>
  );
}
