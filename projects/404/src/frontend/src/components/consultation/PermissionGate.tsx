import { ShieldAlert, Camera, Mic, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PermissionState } from "@/hooks/useVideoConsultation";

interface PermissionGateProps {
  phase: "checking-permissions" | "permission-denied";
  cameraPermission: PermissionState;
  micPermission: PermissionState;
  onRetry: () => void;
}

export function PermissionGate({
  phase,
  cameraPermission,
  micPermission,
  onRetry,
}: PermissionGateProps) {
  const isChecking = phase === "checking-permissions";

  return (
    <div className="consultation-bg min-h-screen flex items-center justify-center p-6">
      <div className="consultation-card max-w-lg w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          {isChecking ? (
            <div className="consultation-icon-ring">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            </div>
          ) : (
            <div className="consultation-icon-ring consultation-icon-ring--error">
              <ShieldAlert className="w-10 h-10 text-rose-400" />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">
            {isChecking ? "Checking Device Access" : "Permissions Required"}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
            {isChecking
              ? "Please allow access to your camera and microphone when your browser prompts you."
              : "Camera and microphone access was denied. You'll need to grant permissions to join the consultation."}
          </p>
        </div>

        {/* Permission Status */}
        <div className="space-y-3">
          <PermissionRow
            icon={<Camera className="w-4 h-4" />}
            label="Camera"
            state={cameraPermission}
            isChecking={isChecking}
          />
          <PermissionRow
            icon={<Mic className="w-4 h-4" />}
            label="Microphone"
            state={micPermission}
            isChecking={isChecking}
          />
        </div>

        {/* Instructions for denied */}
        {!isChecking && (
          <div className="consultation-alert-box">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-left space-y-1">
              <p className="text-amber-300 text-sm font-medium">How to enable permissions</p>
              <ol className="text-slate-400 text-xs space-y-1 list-decimal list-inside">
                <li>Click the camera icon in your browser's address bar</li>
                <li>Select "Allow" for both camera and microphone</li>
                <li>Click "Try Again" below to retry</li>
              </ol>
            </div>
          </div>
        )}

        {/* Actions */}
        {!isChecking && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onRetry}
              className="consultation-btn-primary flex-1"
              id="retry-permissions-btn"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <a
              href="https://support.google.com/chrome/answer/2693767"
              target="_blank"
              rel="noopener noreferrer"
              className="consultation-btn-ghost flex-1 inline-flex items-center justify-center"
            >
              Learn More
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

interface PermissionRowProps {
  icon: React.ReactNode;
  label: string;
  state: PermissionState;
  isChecking: boolean;
}

function PermissionRow({ icon, label, state, isChecking }: PermissionRowProps) {
  const config = {
    pending: {
      dot: "bg-slate-500",
      text: "text-slate-400",
      label: "Waiting for permission…",
      ring: "ring-slate-700",
    },
    granted: {
      dot: "bg-emerald-400",
      text: "text-emerald-400",
      label: "Access granted",
      ring: "ring-emerald-900/50",
    },
    denied: {
      dot: "bg-rose-400",
      text: "text-rose-400",
      label: "Access denied",
      ring: "ring-rose-900/50",
    },
    unavailable: {
      dot: "bg-amber-400",
      text: "text-amber-400",
      label: "Device not found",
      ring: "ring-amber-900/50",
    },
  };

  const c = config[isChecking ? "pending" : state];

  return (
    <div className={`consultation-permission-row ring-1 ${c.ring}`}>
      <div className="flex items-center gap-3">
        <div className="consultation-permission-icon">{icon}</div>
        <span className="text-sm font-medium text-white">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {isChecking ? (
          <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
        ) : (
          <span className={`w-2 h-2 rounded-full ${c.dot}`} />
        )}
        <span className={`text-xs ${c.text}`}>{c.label}</span>
      </div>
    </div>
  );
}
