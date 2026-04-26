import { useEffect, useRef } from 'react';

export function useAudioTranscript(
  callSessionId: string | null,
  localStream: MediaStream | null,
  remoteStream: MediaStream | null,
  speakerLabel: string // "Doctor" | "Patient"
) {
  const localRecorderRef = useRef<MediaRecorder | null>(null);
  const remoteRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (!callSessionId || !localStream || !remoteStream) return;

    const baseApiUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000/api";
    const token = localStorage.getItem("token");

    const sendChunk = async (blob: Blob, speaker: string) => {
      if (blob.size === 0) return;
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        if (!base64data) return;

        try {
          await fetch(`${baseApiUrl}/transcript/${callSessionId}/chunk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              speaker,
              audioBase64: base64data,
            }),
          });
        } catch (error) {
          console.error("Failed to upload audio chunk", error);
        }
      };
      reader.readAsDataURL(blob);
    };

    // Helper to setup a MediaRecorder
    const setupRecorder = (stream: MediaStream, speaker: string) => {
      // Create a new stream with only audio tracks to prevent recording video
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return null;
      
      const audioStream = new MediaStream(audioTracks);
      // Determine what MIME types are supported
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm'; // fallback
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = ''; // Let browser auto-select
        }
      }

      const recorder = new MediaRecorder(audioStream, {
        mimeType: mimeType ? mimeType : undefined,
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          sendChunk(e.data, speaker);
        }
      };

      // Record in 5-second chunks
      recorder.start(5000);
      return recorder;
    };

    try {
      if (!localRecorderRef.current && localStream) {
        localRecorderRef.current = setupRecorder(localStream, speakerLabel);
      }
    } catch (e) {
      console.warn("Could not start local STT recorder", e);
    }
    
    try {
      if (!remoteRecorderRef.current && remoteStream) {
        // remote is the opposite of the local speaker
        const remoteSpeaker = speakerLabel === "Doctor" ? "Patient" : "Doctor";
        remoteRecorderRef.current = setupRecorder(remoteStream, remoteSpeaker);
      }
    } catch (e) {
      console.warn("Could not start remote STT recorder", e);
    }

    return () => {
      if (localRecorderRef.current?.state !== "inactive") {
        localRecorderRef.current?.stop();
        localRecorderRef.current = null;
      }
      if (remoteRecorderRef.current?.state !== "inactive") {
        remoteRecorderRef.current?.stop();
        remoteRecorderRef.current = null;
      }
    };
  }, [callSessionId, localStream, remoteStream, speakerLabel]);
}
