const BASE = "http://localhost:8000";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("careit_access_token");
}

// Standard JSON fetch with Authorization header
async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// Multipart form-data upload — do NOT set Content-Type; browser adds boundary
async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export function setStoredToken(token: string) {
  localStorage.setItem("careit_access_token", token);
}

export function clearStoredToken() {
  localStorage.removeItem("careit_access_token");
}

// ---- Types ----
export interface AuthResponse {
  access_token: string;
  role: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  review_count: number;
}

export interface AppointmentSlot {
  id: string;
  doctor_id: string;
  start_time: string;
  is_available: boolean;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  status: string;
}

export interface TriageResponse {
  recommended_specialty: string;
  department: string;
  rationale: string;
  extracted_symptom_cues: string[];
  confidence: number | null;
}

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface TranscriptChunkResponse {
  appointment_id: string;
  transcript_so_far: string;
  soap_draft: SOAPNote;
  is_updated: boolean;
}

export interface EHRExportResponse {
  export_id: string;
  status: string;
  fhir_bundle: Record<string, unknown>;
  submission_timestamp: string;
}

export interface EMRHandoffResponse {
  submission_id: string;
  target_emr: string;
  status: string;
  fhir_bundle_id: string;
  payload_hash: string;
  submitted_at: string;
  acknowledged_at: string | null;
  simulated_response: Record<string, unknown>;
}

export interface SOAPDraftMeta {
  derived_from_transcript: boolean;
  transcript_chars_processed: number;
  update_timestamp: string;
  chunk_index: number;
  quality_hint: "minimal" | "partial" | "sufficient";
  change_summary: string;
}

export interface SOAPDraftWithMeta {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  metadata: SOAPDraftMeta;
}

export interface SessionStartResponse {
  session_id: string;
  appointment_id: string;
  status: string;
  provider_mode: string;
  language: string;
  created_at: string;
}

export interface SessionChunkResponse {
  session_id: string;
  appointment_id: string;
  chunk_index: number;
  transcript_so_far: string;
  soap_draft: SOAPDraftWithMeta;
  provider_status: string;
  session_status: string;
}

export interface SessionStateResponse {
  session_id: string;
  appointment_id: string;
  status: string;
  transcript: string;
  last_chunk_index: number;
  soap_draft: SOAPDraftWithMeta | null;
  provider_mode: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface SessionFinalizeResponse {
  session_id: string;
  appointment_id: string;
  status: string;
  transcript: string;
  final_soap: SOAPDraftWithMeta;
  handoff_ready: boolean;
  message: string;
}

export interface TranscribeUploadResponse {
  appointment_id: string;
  transcript: string;
  soap_draft: SOAPDraftWithMeta;
  transcription_provider: string;
  language_detected: string;
  duration_seconds: number | null;
  file_info: { filename: string; size_mb: number; content_type: string };
  warning: string | null;
}

export interface IntakeForm {
  appointment_id: string;
  symptoms: string;
  medical_history?: string | null;
  medications?: string | null;
  allergies?: string | null;
  patient_id?: string;
}

// ---- API surface ----
export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<AuthResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, full_name: string, role: string) =>
      apiFetch("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, full_name, role }),
      }),
    me: () => apiFetch<{ user_id: string; role: string }>("/api/v1/auth/me"),
  },

  symptoms: {
    analyze: (symptoms: string, red_flag_context?: string) =>
      apiFetch<TriageResponse>("/api/v1/symptoms/analyze", {
        method: "POST",
        body: JSON.stringify({ symptoms, red_flag_context }),
      }),
  },

  doctors: {
    list: (specialty?: string) =>
      apiFetch<Doctor[]>(
        `/api/v1/doctors/${specialty ? `?specialty=${encodeURIComponent(specialty)}` : ""}`
      ),
    slots: (doctorId: string) =>
      apiFetch<AppointmentSlot[]>(`/api/v1/doctors/${doctorId}/slots`),
  },

  appointments: {
    book: (doctor_id: string, scheduled_at: string) =>
      apiFetch<{ appointment_id: string; status: string; booking: Appointment }>(
        "/api/v1/appointments/",
        {
          method: "POST",
          body: JSON.stringify({ doctor_id, scheduled_at }),
        }
      ),
    list: () => apiFetch<Appointment[]>("/api/v1/appointments/"),
  },

  intake: {
    get: (appointmentId: string) =>
      apiFetch<IntakeForm>(`/api/v1/intake/${appointmentId}`),
    submit: (form: IntakeForm) =>
      apiFetch("/api/v1/intake/", {
        method: "POST",
        body: JSON.stringify(form),
      }),
  },

  soap: {
    sendChunk: (appointment_id: string, chunk: string) =>
      apiFetch<TranscriptChunkResponse>("/api/v1/soap/transcript", {
        method: "POST",
        body: JSON.stringify({ appointment_id, chunk }),
      }),
    approve: (appointment_id: string, edited_note: SOAPNote) =>
      apiFetch<{ status: string; note_id: string; approved_at: string }>(
        "/api/v1/soap/approve",
        {
          method: "PATCH",
          body: JSON.stringify({ appointment_id, edited_note }),
        }
      ),
    transcribeUpload: (appointmentId: string, file: File, language = "en") => {
      const formData = new FormData();
      formData.append("appointment_id", appointmentId);
      formData.append("language", language);
      formData.append("file", file);
      return apiUpload<TranscribeUploadResponse>("/api/v1/soap/transcribe-upload", formData);
    },
  },

  fhir: {
    export: (appointmentId: string) =>
      apiFetch<EHRExportResponse>(`/api/v1/fhir/export/${appointmentId}`),
    submit: (appointmentId: string) =>
      apiFetch<EMRHandoffResponse>(`/api/v1/fhir/submit/${appointmentId}`, {
        method: "POST",
      }),
  },

  session: {
    start: (appointment_id: string, language = "en") =>
      apiFetch<SessionStartResponse>("/api/v1/soap/session/start", {
        method: "POST",
        body: JSON.stringify({ appointment_id, language, source_language: language, target_language: language }),
      }),
    sendChunk: (session_id: string, appointment_id: string, chunk_index: number, transcript_chunk: string) =>
      apiFetch<SessionChunkResponse>(`/api/v1/soap/session/${session_id}/chunk`, {
        method: "POST",
        body: JSON.stringify({ appointment_id, chunk_index, transcript_chunk }),
      }),
    getState: (session_id: string) =>
      apiFetch<SessionStateResponse>(`/api/v1/soap/session/${session_id}/state`),
    finalize: (session_id: string) =>
      apiFetch<SessionFinalizeResponse>(`/api/v1/soap/session/${session_id}/finalize`, {
        method: "POST",
      }),
  },
};
