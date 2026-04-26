/**
 * VitalsFlow API client — all backend calls go through here.
 * BASE_URL is read from NEXT_PUBLIC_API_URL at build time.
 * No "use client" — this is a pure utility module (works server + client side).
 */

// ── Base URL ────────────────────────────────────────────────────────────────
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── TypeScript Interfaces (mirrors API_CONTRACT.md exactly) ─────────────────

export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: string;
}

export interface VitalsPayload {
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  spo2: number;
  temperature: number;
  respiratory_rate: number;
  consciousness: string;
  on_supplemental_o2: boolean;
}

export interface TriageResult {
  risk_score: number;
  news2_score: number;
  triage_tier: string;
  justification: string;
  suggested_actions: string[];
}

export interface ApproveActionPayload {
  action: string;
  justification: string;
  risk_score: number;
  news2_score: number;
  triage_tier: string;
}

export interface ServiceRequestDraft {
  resourceType: "ServiceRequest";
  id: string;
  status: "draft";
  intent: "proposal";
  priority: "routine" | "urgent" | "asap" | "stat" | null;
  subject: { reference: string };
  code: { text: string };
  authoredOn: string;
  note: Array<{ text: string }>;
}

export interface FhirMeta {
  versionId?: string;
  lastUpdated?: string;
  [key: string]: unknown;
}

export interface ServiceRequestCreated {
  resourceType?: string;
  id?: string;
  meta?: FhirMeta;
  [key: string]: unknown;
}

export interface ApproveActionResult {
  message: string;
  patient_id: string;
  service_request: ServiceRequestDraft;
  fhir_service_request_id: string;
  created_fhir_resource: ServiceRequestCreated;
}

export interface ApprovalItem {
  id: string;
  patient_id: string;
  headline: string;
  status: string;
  intent: string;
  priority: string;
  authored_on: string;
  note: string;
}

export interface ApprovalsResponse {
  items: ApprovalItem[];
  count: number;
}

export interface SystemHealthResponse {
  backend: { status: string };
  fhir: { status: string; latency_ms: number; error: string };
  llm: { gemini_ready: boolean; groq_ready: boolean; status: string };
}

export interface PatientSummary {
  patient_id: string;
  name: string;
  dob: string;
  gender: string;
  clinical_summary: string;
}

// ── Default demo vitals (high-risk, per API_CONTRACT.md) ────────────────────
/** Pre-filled demo values that should yield NEWS2 ~11, triage_tier "critical". */
export const DEFAULT_VITALS: VitalsPayload = {
  heart_rate: 118,
  systolic_bp: 88,
  diastolic_bp: 58,
  spo2: 90.0,
  temperature: 39.2,
  respiratory_rate: 26,
  consciousness: "voice",
  on_supplemental_o2: false,
};

// ── Internal fetch wrapper ──────────────────────────────────────────────────
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const method = options?.method ?? "GET";
  console.debug("[VitalsFlow API] request", { method, url });
  const res = await fetch(url, options);
  console.debug("[VitalsFlow API] response", { method, url, status: res.status, ok: res.ok });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    if (res.status !== 404) {
      console.error("[VitalsFlow API] error response", { method, url, error: err });
    }
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Public API functions ────────────────────────────────────────────────────

/**
 * Search patients by name on the HAPI FHIR server via the VitalsFlow backend.
 * Returns [] when no results — never throws on empty.
 */
export async function searchPatients(
  name: string,
  count = 10
): Promise<Patient[]> {
  const params = new URLSearchParams({ name, count: String(count) });
  return apiFetch<Patient[]>(`${BASE_URL}/patients/search?${params}`);
}

/**
 * Fetch and normalise a single patient's FHIR data.
 * Throws if patient not found (404) or server error (500).
 */
export async function getPatientSummary(
  patientId: string
): Promise<PatientSummary> {
  return apiFetch<PatientSummary>(`${BASE_URL}/patients/${patientId}/summary`);
}

/**
 * Run AI triage for a patient with the supplied vitals.
 * Always returns a TriageResult — backend never 500s on LLM failure (graceful fallback).
 */
export async function runTriage(
  patientId: string,
  vitals: VitalsPayload
): Promise<TriageResult> {
  console.log("[VitalsFlow API] runTriage called", { patientId, vitals });
  return apiFetch<TriageResult>(`${BASE_URL}/triage/${patientId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vitals),
  });
}

/**
 * Create a FHIR ServiceRequest for an approved action.
 */
export async function approveAction(
  patientId: string,
  payload: ApproveActionPayload
): Promise<ApproveActionResult> {
  return apiFetch<ApproveActionResult>(`${BASE_URL}/triage/${patientId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/**
 * Health-check ping — used for backend status indicator and Render keepalive.
 * Returns true if backend is reachable, false otherwise. Never throws.
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await apiFetch<unknown>(`${BASE_URL}/health`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch recent draft/proposal ServiceRequests for the approvals queue.
 */
export async function getApprovals(count = 20): Promise<ApprovalsResponse> {
  return apiFetch<ApprovalsResponse>(`${BASE_URL}/triage/approvals?count=${count}`);
}

/**
 * Fetch backend, FHIR, and LLM readiness status for system-health UI.
 */
export async function getSystemHealth(): Promise<SystemHealthResponse> {
  return apiFetch<SystemHealthResponse>(`${BASE_URL}/system/health`);
}
