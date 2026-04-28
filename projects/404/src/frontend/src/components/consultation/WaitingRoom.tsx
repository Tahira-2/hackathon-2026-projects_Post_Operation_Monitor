import { useRef, useEffect, useState } from "react";
import {
  Video,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Clock,
  Shield,
  Wifi,
  Play,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DeviceInfo } from "@/hooks/useVideoConsultation";

interface WaitingRoomProps {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  localStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  phase: "waiting-room" | "connecting";
  selectedCamera: string;
  selectedMic: string;
  cameras: DeviceInfo[];
  microphones: DeviceInfo[];
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onJoin: () => void;
  /** Appointment details to display */
  appointmentTime?: string;
  providerName?: string;
  providerRole?: string;
}

export function WaitingRoom({
  localVideoRef,
  localStream,
  isMuted,
  isCameraOff,
  phase,
  onToggleMute,
  onToggleCamera,
  onJoin,
  appointmentTime = "Today at 2:30 PM",
  providerName = "Dr. Sarah Mitchell",
  providerRole = "General Practitioner",
}: WaitingRoomProps) {
  const internalRef = useRef<HTMLVideoElement>(null);
  const videoRef = (localVideoRef as React.RefObject<HTMLVideoElement>) ?? internalRef;
  const [elapsedWait, setElapsedWait] = useState(0);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, videoRef]);

  useEffect(() => {
    const t = setInterval(() => setElapsedWait((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatWait = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    if (m === 0) return `${sec}s`;
    return `${m}m ${sec}s`;
  };

  const isConnecting = phase === "connecting";

  return (
    <div className="consultation-bg min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 consultation-badge mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">
              Waiting Room
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-white">
            {isConnecting ? "Connecting…" : "The provider will be with you shortly"}
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {isConnecting
              ? "Establishing secure connection"
              : "Please wait. Your session is being prepared."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Self preview */}
          <div className="lg:col-span-2">
            <div className="consultation-video-preview" style={{ aspectRatio: "16/9" }}>
              {!isCameraOff ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="consultation-avatar-xl">
                    <CameraOff className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">Your camera is off</p>
                </div>
              )}

              {/* Self label */}
              <div className="absolute top-4 left-4 consultation-badge">
                <span className="text-xs text-slate-300">You</span>
              </div>

              {/* Preview controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <button
                  onClick={onToggleMute}
                  id="waiting-room-mic-btn"
                  className={`consultation-control-btn ${isMuted ? "consultation-control-btn--off" : ""}`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  onClick={onToggleCamera}
                  id="waiting-room-camera-btn"
                  className={`consultation-control-btn ${isCameraOff ? "consultation-control-btn--off" : ""}`}
                  title={isCameraOff ? "Turn on camera" : "Turn off camera"}
                >
                  {isCameraOff ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                </button>
              </div>

              {/* Connection quality */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 consultation-badge">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400">Good connection</span>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Appointment info */}
            <div className="consultation-info-card">
              <div className="flex items-start gap-4">
                <div className="consultation-provider-avatar">
                  <Video className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{providerName}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{providerRole}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-cyan-400 text-xs font-medium">{appointmentTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wait timer */}
            <div className="consultation-info-card text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Waiting</p>
              <p className="text-3xl font-mono font-bold text-white">{formatWait(elapsedWait)}</p>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-950/40 border border-emerald-900/40">
              <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-400 text-xs font-medium">End-to-end encrypted</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  HIPAA-compliant secure consultation
                </p>
              </div>
            </div>

            {/* Join Button */}
            <Button
              onClick={onJoin}
              id="join-call-btn"
              disabled={isConnecting}
              className="consultation-btn-primary w-full h-12 text-base"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connecting…
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Join Now
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
