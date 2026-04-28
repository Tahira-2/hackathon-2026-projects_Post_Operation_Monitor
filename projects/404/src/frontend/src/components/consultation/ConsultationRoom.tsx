import { useRef, useEffect, useState } from "react";
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  PhoneOff,
  Maximize2,
  Minimize2,
  PanelRight,
  PanelRightClose,
  Wifi,
  WifiOff,
  Signal,
  RefreshCw,
  Loader2,
  MoreHorizontal,
  Volume2,
  VolumeX,
  MessageSquare,
  ClipboardList,
  User,
  Clock,
  Activity,
  FileText,
} from "lucide-react";
import type { ConsultationState } from "@/hooks/useVideoConsultation";

interface ConsultationRoomProps {
  state: ConsultationState;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
  onReconnect: () => void;
  onToggleFullscreen: () => void;
  onToggleSidePanel: () => void;
  onSetActiveTab: (tab: "notes" | "info" | "chat" | "summary") => void;
  onSetNotes: (notes: string) => void;
  formatDuration: (s: number) => string;
  providerName?: string;
  providerRole?: string;
}

export function ConsultationRoom({
  state,
  localVideoRef,
  remoteVideoRef,
  onToggleMute,
  onToggleCamera,
  onEndCall,
  onReconnect,
  onToggleFullscreen,
  onToggleSidePanel,
  onSetActiveTab,
  onSetNotes,
  formatDuration,
  providerName = "Dr. Sarah Mitchell",
  providerRole = "General Practitioner",
}: ConsultationRoomProps) {
  const internalLocalRef = useRef<HTMLVideoElement>(null);
  const localRef = (localVideoRef as React.RefObject<HTMLVideoElement>) ?? internalLocalRef;
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (localRef.current && state.localStream) {
      localRef.current.srcObject = state.localStream;
    }
  }, [state.localStream, localRef]);

  // Auto-hide controls after inactivity
  const showControls = () => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 4000);
  };

  useEffect(() => {
    showControls();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [captionVisible, setCaptionVisible] = useState(false);
  useEffect(() => {
    if (state.liveCaption) {
      setCaptionVisible(true);
      const timer = setTimeout(() => setCaptionVisible(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [state.liveCaption]);

  const isReconnecting = state.phase === "reconnecting";

  const qualityConfig = {
    excellent: { color: "text-emerald-400", icon: <Signal className="w-3.5 h-3.5" />, label: "Excellent" },
    good: { color: "text-cyan-400", icon: <Wifi className="w-3.5 h-3.5" />, label: "Good" },
    poor: { color: "text-amber-400", icon: <WifiOff className="w-3.5 h-3.5" />, label: "Poor" },
    unknown: { color: "text-slate-500", icon: <Wifi className="w-3.5 h-3.5" />, label: "Checking…" },
  };
  const quality = qualityConfig[state.connectionQuality];

  return (
    <div
      className={`consultation-room ${state.isFullscreen ? "consultation-room--fullscreen" : ""}`}
      onMouseMove={showControls}
      onClick={showControls}
    >
      {/* Remote video (main) */}
      <div className="consultation-remote-video">
        {isReconnecting ? (
          <ReconnectOverlay onReconnect={onReconnect} />
        ) : (
          <>
            {/* Simulated remote — in production this is the WebRTC remote stream */}
            <div className="remote-video-placeholder">
              <div className="remote-video-avatar">
                <span className="text-4xl font-semibold text-white">SM</span>
              </div>
              <p className="text-slate-400 text-sm mt-3">{providerName}</p>
            </div>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="consultation-video-stream"
            />
          </>
        )}
      </div>

      {/* Top HUD */}
      <div className={`consultation-hud-top transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0"}`}>
        <div className="flex items-center gap-3">
          {/* Call duration */}
          <div className="consultation-badge">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="text-xs font-mono text-white">{formatDuration(state.callDuration)}</span>
          </div>
          {/* Connection quality */}
          <div className={`consultation-badge gap-1.5 ${quality.color}`}>
            {quality.icon}
            <span className="text-xs">{quality.label}</span>
          </div>
        </div>

        {/* Provider name */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{providerName}</p>
            <p className="text-xs text-slate-400">{providerRole}</p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSidePanel}
            id="toggle-side-panel-btn"
            className="consultation-hud-btn"
            title="Toggle clinical panel"
          >
            {state.isSidePanelOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRight className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onToggleFullscreen}
            id="toggle-fullscreen-btn"
            className="consultation-hud-btn"
            title="Toggle fullscreen"
          >
            {state.isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Local PiP video */}
      <div className="consultation-pip">
        {!state.isCameraOff ? (
          <video
            ref={localRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-slate-800">
            <CameraOff className="w-5 h-5 text-slate-500" />
          </div>
        )}
        <div className="absolute bottom-1.5 left-2 text-xs text-white/70 font-medium">You</div>
        {state.isMuted && (
          <div className="absolute top-1.5 right-2">
            <MicOff className="w-3.5 h-3.5 text-rose-400" />
          </div>
        )}
      </div>

      {/* Live Captions Overlay */}
      <div className={`absolute bottom-28 left-0 right-0 flex justify-center pointer-events-none px-4 z-10 transition-opacity duration-500 ${captionVisible ? "opacity-100" : "opacity-0"}`}>
        <div className="bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/10 shadow-2xl max-w-2xl text-center">
          <span className="text-cyan-400 font-semibold text-xs tracking-wider uppercase mr-3">
            {state.liveCaption?.speaker}
          </span>
          <span className="text-white text-[15px] tracking-wide drop-shadow-md">
            {state.liveCaption?.text}
          </span>
        </div>
      </div>

      {/* Bottom controls */}
      <div className={`consultation-controls transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0"}`}>
        <div className="consultation-controls-inner">
          {/* Left extras */}
          <div className="hidden md:flex items-center gap-2">
            <button className="consultation-hud-btn" title="More options">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Center main controls */}
          <div className="flex items-center gap-3">
            <CallControlBtn
              id="in-call-mic-btn"
              onClick={onToggleMute}
              isOff={state.isMuted}
              title={state.isMuted ? "Unmute" : "Mute"}
              offIcon={<MicOff className="w-5 h-5" />}
              onIcon={<Mic className="w-5 h-5" />}
            />
            <CallControlBtn
              id="in-call-camera-btn"
              onClick={onToggleCamera}
              isOff={state.isCameraOff}
              title={state.isCameraOff ? "Turn on camera" : "Turn off camera"}
              offIcon={<CameraOff className="w-5 h-5" />}
              onIcon={<Camera className="w-5 h-5" />}
            />
            <button
              onClick={onEndCall}
              id="end-call-btn"
              className="consultation-end-call-btn"
              title="End call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <CallControlBtn
              id="in-call-speaker-btn"
              onClick={() => {}}
              isOff={state.isRemoteMuted}
              title="Speaker"
              offIcon={<VolumeX className="w-5 h-5" />}
              onIcon={<Volume2 className="w-5 h-5" />}
            />
          </div>

          {/* Right extras */}
          <div className="hidden md:flex items-center gap-2">
            <button
              className="consultation-hud-btn"
              title="Activity"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Clinical Side Panel */}
      {state.isSidePanelOpen && (
        <ClinicalSidePanel
          activeTab={state.activeTab}
          notes={state.notes}
          onSetActiveTab={onSetActiveTab}
          onSetNotes={onSetNotes}
          providerName={providerName}
          providerRole={providerRole}
          callDuration={state.callDuration}
          formatDuration={formatDuration}
          callSessionId={state.callSessionId}
        />
      )}
    </div>
  );
}

/* ─── Sub-components ─── */

function CallControlBtn({
  id,
  onClick,
  isOff,
  title,
  offIcon,
  onIcon,
}: {
  id: string;
  onClick: () => void;
  isOff: boolean;
  title: string;
  offIcon: React.ReactNode;
  onIcon: React.ReactNode;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`consultation-control-btn-lg ${isOff ? "consultation-control-btn-lg--off" : ""}`}
      title={title}
    >
      {isOff ? offIcon : onIcon}
    </button>
  );
}

function ReconnectOverlay({ onReconnect }: { onReconnect: () => void }) {
  const [reconnecting, setReconnecting] = useState(false);

  const handleReconnect = () => {
    setReconnecting(true);
    onReconnect();
    setTimeout(() => setReconnecting(false), 3500);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-6">
      <div className="consultation-icon-ring consultation-icon-ring--warning">
        <WifiOff className="w-10 h-10 text-amber-400" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Connection Lost</h2>
        <p className="text-slate-400 text-sm max-w-sm">
          Your connection was interrupted. Attempting to restore your secure consultation.
        </p>
      </div>
      <button
        onClick={handleReconnect}
        id="reconnect-btn"
        disabled={reconnecting}
        className="consultation-btn-primary px-6 py-2.5 rounded-xl"
      >
        {reconnecting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Reconnecting…
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reconnect
          </>
        )}
      </button>
    </div>
  );
}

interface ClinicalSidePanelProps {
  activeTab: "notes" | "info" | "chat" | "summary";
  notes: string;
  onSetActiveTab: (tab: "notes" | "info" | "chat" | "summary") => void;
  onSetNotes: (notes: string) => void;
  providerName: string;
  providerRole: string;
  callDuration: number;
  formatDuration: (s: number) => string;
  callSessionId: string | null;
}

function ClinicalSidePanel({
  activeTab,
  notes,
  onSetActiveTab,
  onSetNotes,
  providerName,
  providerRole,
  callDuration,
  formatDuration,
  callSessionId,
}: ClinicalSidePanelProps) {
  const tabs = [
    { id: "info" as const, label: "Info", icon: <User className="w-3.5 h-3.5" /> },
    { id: "notes" as const, label: "Notes", icon: <FileText className="w-3.5 h-3.5" /> },
    { id: "chat" as const, label: "Chat", icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: "summary" as const, label: "Summary", icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  return (
    <aside className="consultation-side-panel">
      {/* Panel header */}
      <div className="consultation-side-panel-header">
        <ClipboardList className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-medium text-white">Clinical Panel</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSetActiveTab(tab.id)}
            id={`panel-tab-${tab.id}`}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "info" && (
          <InfoTab
            providerName={providerName}
            providerRole={providerRole}
            callDuration={callDuration}
            formatDuration={formatDuration}
          />
        )}
        {activeTab === "notes" && (
          <NotesTab notes={notes} onChange={onSetNotes} />
        )}
        {activeTab === "chat" && <ChatTab />}
        {activeTab === "summary" && <SummaryTab callSessionId={callSessionId} />}
      </div>
    </aside>
  );
}

function InfoTab({
  providerName,
  providerRole,
  callDuration,
  formatDuration,
}: {
  providerName: string;
  providerRole: string;
  callDuration: number;
  formatDuration: (s: number) => string;
}) {
  return (
    <div className="space-y-4">
      <div className="consultation-info-card">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Provider</p>
        <div className="flex items-center gap-3">
          <div className="consultation-provider-avatar-sm">
            <span className="text-sm font-semibold text-white">SM</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{providerName}</p>
            <p className="text-xs text-slate-400">{providerRole}</p>
          </div>
        </div>
      </div>

      <div className="consultation-info-card">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Session</p>
        <div className="space-y-2.5">
          <InfoRow label="Duration" value={formatDuration(callDuration)} />
          <InfoRow label="Type" value="Video Consultation" />
          <InfoRow label="Security" value="E2E Encrypted" valueClass="text-emerald-400" />
          <InfoRow label="Codec" value="VP8 / Opus" />
        </div>
      </div>

      <div className="consultation-info-card">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Vital Reminders</p>
        <ul className="space-y-2">
          {["Blood pressure reading", "Current medications list", "Symptom onset date"].map(
            (item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                <span className="text-xs text-slate-400">{item}</span>
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}

function NotesTab({ notes, onChange }: { notes: string; onChange: (v: string) => void }) {
  return (
    <div className="h-full flex flex-col gap-3">
      <p className="text-xs text-slate-500">
        Clinical notes are saved locally and encrypted. Do not include PHI beyond what is necessary.
      </p>
      <textarea
        id="clinical-notes-textarea"
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your session notes here…"
        className="consultation-notes-textarea flex-1"
        rows={12}
      />
      <p className="text-xs text-slate-700 text-right">{notes.length} characters</p>
    </div>
  );
}

function ChatTab() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "provider",
      text: "Hello! I can see and hear you clearly. How are you feeling today?",
      time: "2:31 PM",
    },
  ]);

  const send = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sender: "patient",
        text: message.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full gap-3" style={{ minHeight: 300 }}>
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === "patient" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs ${
                m.sender === "patient"
                  ? "bg-cyan-500/20 text-cyan-100 rounded-br-sm"
                  : "bg-slate-800 text-slate-200 rounded-bl-sm"
              }`}
            >
              <p>{m.text}</p>
              <p className="text-slate-500 mt-1 text-right">{m.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          id="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message…"
          className="consultation-chat-input flex-1"
        />
        <button
          onClick={send}
          id="chat-send-btn"
          className="consultation-btn-primary px-3 py-2 rounded-xl text-xs"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function SummaryTab({ callSessionId }: { callSessionId: string | null }) {
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSummary = async (generate = false) => {
    if (!callSessionId) return;
    setLoading(true);
    setError("");
    const baseApiUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000/api";
    const token = localStorage.getItem("token");

    try {
      const endpoint = `${baseApiUrl}/transcript/${callSessionId}/summary`;
      const res = await fetch(endpoint, {
        method: generate ? "POST" : "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data) setSummaryData(data);
      } else if (generate) {
        setError("Failed to generate summary.");
      }
    } catch {
      if (generate) setError("Failed to generate summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(false);
  }, [callSessionId]);

  if (!callSessionId) {
    return <div className="text-slate-500 text-xs text-center py-6">Connecting session...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Clinical Summary</h3>
        <button
          onClick={() => fetchSummary(true)}
          disabled={loading}
          className="consultation-btn-primary px-3 py-1.5 rounded-lg text-xs disable:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Generate"}
        </button>
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}

      {!summaryData && !loading && (
        <div className="text-center py-8">
          <p className="text-slate-500 text-xs">No summary generated yet.</p>
        </div>
      )}

      {summaryData && (
        <div className="space-y-4 text-xs text-slate-300">
          <div className="bg-slate-800/50 p-3 rounded-xl">
            <h4 className="text-slate-400 uppercase tracking-wider text-[10px] mb-2 font-semibold">SOAP Note</h4>
            <p className="leading-relaxed">{summaryData.summary}</p>
          </div>
          
          {summaryData.diagnoses?.length > 0 && (
            <div className="bg-slate-800/50 p-3 rounded-xl">
              <h4 className="text-slate-400 uppercase tracking-wider text-[10px] mb-2 font-semibold">Diagnoses</h4>
              <ul className="list-disc pl-4 space-y-1">
                {summaryData.diagnoses.map((d: string, i: number) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          )}

          {summaryData.medications?.length > 0 && (
            <div className="bg-slate-800/50 p-3 rounded-xl">
              <h4 className="text-slate-400 uppercase tracking-wider text-[10px] mb-2 font-semibold">Medications</h4>
              <ul className="list-disc pl-4 space-y-1">
                {summaryData.medications.map((m: string, i: number) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}

          {summaryData.followUp && (
            <div className="bg-slate-800/50 p-3 rounded-xl">
              <h4 className="text-slate-400 uppercase tracking-wider text-[10px] mb-2 font-semibold">Follow Up</h4>
              <p>{summaryData.followUp}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
