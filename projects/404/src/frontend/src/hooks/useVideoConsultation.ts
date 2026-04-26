import { useState, useRef, useCallback, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";
import { useAudioTranscript } from "./useAudioTranscript";

const SOCKET_URL = (
  (import.meta.env.VITE_API_URL as string) || "http://localhost:3000/api"
).replace(/\/api$/, "");

export type ConsultationPhase =
  | "checking-permissions"
  | "permission-denied"
  | "device-setup"
  | "waiting-room"
  | "connecting"
  | "in-call"
  | "reconnecting"
  | "call-ended";

export type PermissionState = "pending" | "granted" | "denied" | "unavailable";

export interface DeviceInfo {
  deviceId: string;
  label: string;
}

export interface ConsultationState {
  phase: ConsultationPhase;
  cameraPermission: PermissionState;
  micPermission: PermissionState;
  localStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isRemoteMuted: boolean;
  isFullscreen: boolean;
  callDuration: number;
  cameras: DeviceInfo[];
  microphones: DeviceInfo[];
  speakers: DeviceInfo[];
  selectedCamera: string;
  selectedMic: string;
  selectedSpeaker: string;
  isSidePanelOpen: boolean;
  activeTab: "notes" | "info" | "chat" | "summary";
  notes: string;
  connectionQuality: "excellent" | "good" | "poor" | "unknown";
  callSessionId: string | null;
  liveCaption: { speaker: string; text: string; timestamp: number } | null;
}

export function useVideoConsultation(appointmentId?: string) {
  const { user } = useAuth();
  const [state, setState] = useState<ConsultationState>({
    phase: "checking-permissions",
    cameraPermission: "pending",
    micPermission: "pending",
    localStream: null,
    isMuted: false,
    isCameraOff: false,
    isRemoteMuted: false,
    isFullscreen: false,
    callDuration: 0,
    cameras: [],
    microphones: [],
    speakers: [],
    selectedCamera: "",
    selectedMic: "",
    selectedSpeaker: "",
    isSidePanelOpen: true,
    activeTab: "info",
    notes: "",
    connectionQuality: "unknown",
    callSessionId: null,
    liveCaption: null,
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  /** Stores the remote MediaStream as soon as ontrack fires (even before ConsultationRoom mounts) */
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const callSessionIdRef = useRef<string | null>(null);
  const isAloneRef = useRef(false);

  // Hook STT transcript stream to the current call session
  useAudioTranscript(
    state.phase === "in-call" ? callSessionIdRef.current : null,
    state.localStream,
    remoteStreamRef.current,
    user?.role === "DOCTOR" ? "Doctor" : "Patient",
  );

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setState((prev) => ({ ...prev, callDuration: prev.callDuration + 1 }));
    }, 1000);
  }, []);

  // ─── RTCPeerConnection ───────────────────────────────────────────────────

  const createPeerConnection = useCallback(
    (iceServers: RTCIceServer[]): RTCPeerConnection => {
      if (peerRef.current) {
        peerRef.current.close();
      }
      const pc = new RTCPeerConnection({ iceServers });
      peerRef.current = pc;

      // Add local tracks
      streamRef.current
        ?.getTracks()
        .forEach((t) => pc.addTrack(t, streamRef.current!));

      // ICE candidates → relay to peer via socket
      pc.onicecandidate = (e) => {
        if (e.candidate && socketRef.current && callSessionIdRef.current) {
          socketRef.current.emit("webrtc:ice", {
            callSessionId: callSessionIdRef.current,
            payload: e.candidate,
          });
        }
      };

      // Remote tracks → save to ref AND attach if the element is already mounted
      pc.ontrack = (e) => {
        if (e.streams[0]) {
          remoteStreamRef.current = e.streams[0];
          // Attach immediately if ConsultationRoom is already rendered
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = e.streams[0];
          }
        }
      };

      // Connection state changes
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setState((prev) => ({
            ...prev,
            phase: "in-call",
            connectionQuality: "excellent",
          }));
          startTimer();
        } else if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed"
        ) {
          setState((prev) => ({ ...prev, phase: "reconnecting" }));
        }
      };

      return pc;
    },
    [startTimer],
  );

  // ─── ICE Servers ──────────────────────────────────────────────────────────

  const fetchIceServers = useCallback(async (): Promise<RTCIceServer[]> => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl =
        (import.meta.env.VITE_API_URL as string) || "http://localhost:3000/api";
      const res = await fetch(`${baseUrl}/calls/ice-servers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) return await res.json();
    } catch {
      // fall through to default
    }
    return [
      {
        urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
      },
    ];
  }, []);

  // ─── Device Enumeration ──────────────────────────────────────────────────

  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices
        .filter((d) => d.kind === "videoinput")
        .map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${i + 1}`,
        }));
      const microphones = devices
        .filter((d) => d.kind === "audioinput")
        .map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${i + 1}`,
        }));
      const speakers = devices
        .filter((d) => d.kind === "audiooutput")
        .map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `Speaker ${i + 1}`,
        }));
      setState((prev) => ({
        ...prev,
        cameras,
        microphones,
        speakers,
        selectedCamera: cameras[0]?.deviceId ?? "",
        selectedMic: microphones[0]?.deviceId ?? "",
        selectedSpeaker: speakers[0]?.deviceId ?? "",
      }));
    } catch {
      // ignore
    }
  }, []);

  // ─── Permissions ─────────────────────────────────────────────────────────

  const requestPermissions = useCallback(async () => {
    setState((prev) => ({ ...prev, phase: "checking-permissions" }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      await enumerateDevices();
      setState((prev) => ({
        ...prev,
        localStream: stream,
        cameraPermission: "granted",
        micPermission: "granted",
        phase: "device-setup",
      }));
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err: unknown) {
      const error = err as DOMException;
      const isDenied =
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError";
      setState((prev) => ({
        ...prev,
        cameraPermission: isDenied ? "denied" : "unavailable",
        micPermission: isDenied ? "denied" : "unavailable",
        phase: "permission-denied",
      }));
    }
  }, [enumerateDevices]);

  // ─── Device Switch ───────────────────────────────────────────────────────

  const switchDevice = useCallback(
    async (type: "camera" | "mic" | "speaker", deviceId: string) => {
      setState((prev) => ({
        ...prev,
        selectedCamera: type === "camera" ? deviceId : prev.selectedCamera,
        selectedMic: type === "mic" ? deviceId : prev.selectedMic,
        selectedSpeaker: type === "speaker" ? deviceId : prev.selectedSpeaker,
      }));
      if (type === "speaker") return;
      try {
        const constraints = {
          video:
            type === "camera"
              ? { deviceId: { exact: deviceId } }
              : !!streamRef.current?.getVideoTracks().length,
          audio:
            type === "mic"
              ? { deviceId: { exact: deviceId } }
              : !!streamRef.current?.getAudioTracks().length,
        };
        const newStream =
          await navigator.mediaDevices.getUserMedia(constraints);
        if (streamRef.current) {
          const oldTracks =
            type === "camera"
              ? streamRef.current.getVideoTracks()
              : streamRef.current.getAudioTracks();
          oldTracks.forEach((t) => t.stop());
        }
        streamRef.current = newStream;
        setState((prev) => ({ ...prev, localStream: newStream }));
        if (localVideoRef.current) localVideoRef.current.srcObject = newStream;
      } catch {
        // ignore
      }
    },
    [],
  );

  const proceedToWaitingRoom = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "waiting-room" }));
  }, []);

  // ─── Join Call ────────────────────────────────────────────────────────────

  const joinCall = useCallback(() => {
    if (!appointmentId) {
      setState((prev) => ({ ...prev, phase: "connecting" }));
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          phase: "in-call",
          connectionQuality: "excellent",
        }));
        startTimer();
      }, 2000);
      return;
    }

    setState((prev) => ({ ...prev, phase: "connecting" }));

    const token = localStorage.getItem("token");
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
      // Pass token as a query param too — Vite's WS proxy may strip auth during handshake
      query: { token: token ?? "" },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[socket] connected:", socket.id);
      socket.emit(
        "call:initiate",
        { appointmentId },
        (response: { session?: { id: string }; error?: string }) => {
          if (response?.error || !response?.session?.id) {
            console.error("[call:initiate] error:", response?.error);
            return;
          }
          callSessionIdRef.current = response.session.id;
          setState((prev) => ({ ...prev, callSessionId: response.session.id }));
          console.log("[call:initiate] session:", response.session.id);
        },
      );
    });

    socket.on("transcript:caption", ({ speaker, text }: { speaker: string; text: string }) => {
      setState((prev) => ({
        ...prev,
        liveCaption: { speaker, text, timestamp: Date.now() },
      }));
    });

    /**
     * call:ready — emitted by the backend per-socket with a shouldOffer flag.
     * shouldOffer=true  → this peer was first; create and send WebRTC offer.
     * shouldOffer=false → this peer was second; wait to receive the offer.
     */
    socket.on(
      "call:ready",
      async ({
        session,
        shouldOffer,
      }: {
        session: { id: string };
        shouldOffer: boolean;
      }) => {
        callSessionIdRef.current = session.id;
        setState((prev) => ({ ...prev, callSessionId: session.id }));
        console.log("[call:ready] shouldOffer:", shouldOffer);

        if (shouldOffer) {
          const iceServers = await fetchIceServers();
          const pc = createPeerConnection(iceServers);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("webrtc:offer", {
            callSessionId: session.id,
            payload: offer,
          });
          console.log("[webrtc] offer sent");
        }
        // If !shouldOffer: wait — the other peer will send the offer via webrtc:offer
      },
    );

    /** Received by the peer with shouldOffer=false → answer */
    socket.on(
      "webrtc:offer",
      async ({
        payload,
      }: {
        from: string;
        payload: RTCSessionDescriptionInit;
      }) => {
        console.log("[webrtc] offer received");
        const iceServers = await fetchIceServers();
        const pc = createPeerConnection(iceServers);
        await pc.setRemoteDescription(new RTCSessionDescription(payload));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc:answer", {
          callSessionId: callSessionIdRef.current,
          payload: answer,
        });
        console.log("[webrtc] answer sent");
      },
    );

    /** Received by the peer with shouldOffer=true → set remote description */
    socket.on(
      "webrtc:answer",
      async ({
        payload,
      }: {
        from: string;
        payload: RTCSessionDescriptionInit;
      }) => {
        console.log("[webrtc] answer received");
        await peerRef.current?.setRemoteDescription(
          new RTCSessionDescription(payload),
        );
      },
    );

    /** Both sides: trickle ICE candidates */
    socket.on(
      "webrtc:ice",
      async ({ payload }: { from: string; payload: RTCIceCandidateInit }) => {
        try {
          await peerRef.current?.addIceCandidate(new RTCIceCandidate(payload));
        } catch {
          // stale candidate — ignore
        }
      },
    );

    /** Peer ended the call */
    socket.on("call:ended", () => {
      cleanupCall();
      setState((prev) => ({ ...prev, phase: "call-ended" }));
    });

    socket.on("connect_error", (err) => {
      console.error("[socket] connect error:", err.message);
    });
  }, [appointmentId, createPeerConnection, fetchIceServers, startTimer]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Controls ────────────────────────────────────────────────────────────

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
    }
    setState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const toggleCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
    }
    setState((prev) => ({ ...prev, isCameraOff: !prev.isCameraOff }));
  }, []);

  const cleanupCall = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    callSessionIdRef.current = null;
    isAloneRef.current = false;
  }, []);

  const endCall = useCallback(() => {
    if (socketRef.current && callSessionIdRef.current) {
      socketRef.current.emit("call:end", {
        callSessionId: callSessionIdRef.current,
      });
    }
    cleanupCall();
    setState((prev) => ({ ...prev, phase: "call-ended", localStream: null }));
  }, [cleanupCall]);

  const reconnect = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "reconnecting" }));
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        phase: "in-call",
        connectionQuality: "good",
      }));
    }, 3000);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setState((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  const toggleSidePanel = useCallback(() => {
    setState((prev) => ({ ...prev, isSidePanelOpen: !prev.isSidePanelOpen }));
  }, []);

  const setActiveTab = useCallback((tab: "notes" | "info" | "chat") => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setState((prev) => ({ ...prev, notes }));
  }, []);

  // ─── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (localVideoRef.current && state.localStream) {
      localVideoRef.current.srcObject = state.localStream;
    }
  }, [state.localStream]);

  /**
   * When the phase switches to "in-call", ConsultationRoom mounts and
   * remoteVideoRef gets attached to the DOM.  Attach the saved remote
   * stream (which may have arrived via ontrack while WaitingRoom was showing).
   */
  useEffect(() => {
    if (
      state.phase === "in-call" &&
      remoteVideoRef.current &&
      remoteStreamRef.current
    ) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [state.phase]);

  useEffect(() => {
    return () => {
      cleanupCall();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    requestPermissions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return {
    state,
    localVideoRef,
    remoteVideoRef,
    requestPermissions,
    switchDevice,
    proceedToWaitingRoom,
    joinCall,
    toggleMute,
    toggleCamera,
    endCall,
    reconnect,
    toggleFullscreen,
    toggleSidePanel,
    setActiveTab,
    setNotes,
    formatDuration,
  };
}
