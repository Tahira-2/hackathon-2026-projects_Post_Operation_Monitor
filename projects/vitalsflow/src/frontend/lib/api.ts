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
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
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
  return apiFetch<TriageResult>(`${BASE_URL}/triage/${patientId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vitals),
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
