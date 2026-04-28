import { useRef, useEffect } from "react";
import {
  Camera,
  Mic,
  Speaker,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  Volume2,
  CameraOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DeviceInfo } from "@/hooks/useVideoConsultation";

interface DeviceSetupProps {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  localStream: MediaStream | null;
  isCameraOff: boolean;
  isMuted: boolean;
  cameras: DeviceInfo[];
  microphones: DeviceInfo[];
  speakers: DeviceInfo[];
  selectedCamera: string;
  selectedMic: string;
  selectedSpeaker: string;
  onSwitchDevice: (type: "camera" | "mic" | "speaker", deviceId: string) => void;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onProceed: () => void;
}

export function DeviceSetup({
  localVideoRef,
  localStream,
  isCameraOff,
  isMuted,
  cameras,
  microphones,
  speakers,
  selectedCamera,
  selectedMic,
  selectedSpeaker,
  onSwitchDevice,
  onToggleCamera,
  onToggleMic,
  onProceed,
}: DeviceSetupProps) {
  const internalRef = useRef<HTMLVideoElement>(null);
  const videoRef = (localVideoRef as React.RefObject<HTMLVideoElement>) ?? internalRef;

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, videoRef]);

  return (
    <div className="consultation-bg min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 consultation-badge mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">
              Device Setup
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-white">Ready to Join?</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Check your camera and microphone before entering the consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Preview */}
          <div className="lg:col-span-3">
            <div className="consultation-video-preview">
              {!isCameraOff ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="consultation-avatar-xl">
                    <CameraOff className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">Camera is off</p>
                </div>
              )}

              {/* Preview Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <button
                  onClick={onToggleMic}
                  id="device-setup-mic-toggle"
                  className={`consultation-control-btn ${isMuted ? "consultation-control-btn--off" : ""}`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={onToggleCamera}
                  id="device-setup-camera-toggle"
                  className={`consultation-control-btn ${isCameraOff ? "consultation-control-btn--off" : ""}`}
                  title={isCameraOff ? "Turn on camera" : "Turn off camera"}
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* Audio level indicator */}
              {!isMuted && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 consultation-badge">
                  <Volume2 className="w-3 h-3 text-cyan-400" />
                  <div className="audio-bars">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Device Selectors */}
          <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <DeviceSelect
                icon={<Camera className="w-4 h-4" />}
                label="Camera"
                devices={cameras}
                selected={selectedCamera}
                onChange={(id) => onSwitchDevice("camera", id)}
                id="camera-select"
              />
              <DeviceSelect
                icon={<Mic className="w-4 h-4" />}
                label="Microphone"
                devices={microphones}
                selected={selectedMic}
                onChange={(id) => onSwitchDevice("mic", id)}
                id="mic-select"
              />
              <DeviceSelect
                icon={<Speaker className="w-4 h-4" />}
                label="Speaker"
                devices={speakers}
                selected={selectedSpeaker}
                onChange={(id) => onSwitchDevice("speaker", id)}
                id="speaker-select"
              />
            </div>

            {/* Readiness Checklist */}
            <div className="space-y-2">
              <ReadinessCheck label="Camera ready" passed={!isCameraOff && cameras.length > 0} />
              <ReadinessCheck label="Microphone ready" passed={!isMuted && microphones.length > 0} />
              <ReadinessCheck label="Audio output ready" passed={speakers.length > 0} />
            </div>

            <Button
              onClick={onProceed}
              id="proceed-to-waiting-room-btn"
              className="consultation-btn-primary w-full h-12 text-base"
            >
              Continue to Waiting Room
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DeviceSelectProps {
  icon: React.ReactNode;
  label: string;
  devices: DeviceInfo[];
  selected: string;
  onChange: (deviceId: string) => void;
  id: string;
}

function DeviceSelect({ icon, label, devices, selected, onChange, id }: DeviceSelectProps) {
  return (
    <div className="consultation-device-select">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-cyan-400">{icon}</span>
        <label htmlFor={id} className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      </div>
      <div className="relative">
        <select
          id={id}
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          className="consultation-select"
        >
          {devices.length === 0 ? (
            <option>No {label.toLowerCase()} found</option>
          ) : (
            devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))
          )}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

function ReadinessCheck({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2
        className={`w-4 h-4 transition-colors ${passed ? "text-emerald-400" : "text-slate-700"}`}
      />
      <span className={`text-xs ${passed ? "text-slate-300" : "text-slate-600"}`}>{label}</span>
    </div>
  );
}
