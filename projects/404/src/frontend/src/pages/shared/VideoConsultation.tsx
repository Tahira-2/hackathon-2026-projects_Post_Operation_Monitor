import { useNavigate, useParams } from "react-router-dom";
import { useVideoConsultation } from "@/hooks/useVideoConsultation";
import { PermissionGate } from "@/components/consultation/PermissionGate";
import { DeviceSetup } from "@/components/consultation/DeviceSetup";
import { WaitingRoom } from "@/components/consultation/WaitingRoom";
import { ConsultationRoom } from "@/components/consultation/ConsultationRoom";
import { CallEndedScreen } from "@/components/consultation/CallEndedScreen";

/**
 * VideoConsultationPage
 * ---------------------
 * Orchestrates the full telehealth video consultation flow:
 *   checking-permissions → permission-denied → device-setup
 *   → waiting-room → connecting → in-call ↔ reconnecting
 *   → call-ended
 *
 * Reads :appointmentId from the URL to wire real WebRTC signaling.
 */
export function VideoConsultationPage() {
  const navigate = useNavigate();
  const { appointmentId } = useParams<{ appointmentId?: string }>();
  const {
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
  } = useVideoConsultation(appointmentId);

  const handleGoBack = () => {
    navigate(-1);
  };

  // Permission checking / denied
  if (state.phase === "checking-permissions" || state.phase === "permission-denied") {
    return (
      <PermissionGate
        phase={state.phase}
        cameraPermission={state.cameraPermission}
        micPermission={state.micPermission}
        onRetry={requestPermissions}
      />
    );
  }

  // Device setup
  if (state.phase === "device-setup") {
    return (
      <DeviceSetup
        localVideoRef={localVideoRef}
        localStream={state.localStream}
        isCameraOff={state.isCameraOff}
        isMuted={state.isMuted}
        cameras={state.cameras}
        microphones={state.microphones}
        speakers={state.speakers}
        selectedCamera={state.selectedCamera}
        selectedMic={state.selectedMic}
        selectedSpeaker={state.selectedSpeaker}
        onSwitchDevice={switchDevice}
        onToggleCamera={toggleCamera}
        onToggleMic={toggleMute}
        onProceed={proceedToWaitingRoom}
      />
    );
  }

  // Waiting room / connecting
  if (state.phase === "waiting-room" || state.phase === "connecting") {
    return (
      <WaitingRoom
        localVideoRef={localVideoRef}
        localStream={state.localStream}
        isMuted={state.isMuted}
        isCameraOff={state.isCameraOff}
        phase={state.phase}
        selectedCamera={state.selectedCamera}
        selectedMic={state.selectedMic}
        cameras={state.cameras}
        microphones={state.microphones}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onJoin={joinCall}
      />
    );
  }

  // In-call or reconnecting
  if (state.phase === "in-call" || state.phase === "reconnecting") {
    return (
      <ConsultationRoom
        state={state}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onEndCall={endCall}
        onReconnect={reconnect}
        onToggleFullscreen={toggleFullscreen}
        onToggleSidePanel={toggleSidePanel}
        onSetActiveTab={setActiveTab}
        onSetNotes={setNotes}
        formatDuration={formatDuration}
      />
    );
  }

  // Call ended
  if (state.phase === "call-ended") {
    return (
      <CallEndedScreen
        callDuration={state.callDuration}
        formatDuration={formatDuration}
        callSessionId={state.callSessionId}
        onGoBack={handleGoBack}
      />
    );
  }

  return null;
}
