"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Stethoscope,
  Search,
  AlertCircle,
  Wifi,
  WifiOff,
  X,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";

import { RiskBadge } from "@/components/RiskBadge";
import { ActionCenter } from "@/components/ActionCenter";
import { VitalsTrend } from "@/components/VitalsTrend";
import { PatientCard } from "@/components/PatientCard";
import { VitalsForm } from "@/components/VitalsForm";
import { TriageScoreCard } from "@/components/TriageScoreCard";

import {
  searchPatients,
  runTriage,
  healthCheck,
  DEFAULT_VITALS,
  type Patient,
  type VitalsPayload,
  type TriageResult,
} from "@/lib/api";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<VitalsPayload>(DEFAULT_VITALS);
  const [triageResults, setTriageResults] = useState<Record<string, TriageResult>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [isTriaging, setIsTriaging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Health check ────────────────────────────────────────────────────────────
  useEffect(() => {
    healthCheck().then(setBackendOnline);
    const interval = setInterval(() => {
      healthCheck().then(setBackendOnline);
    }, 600_000);
    return () => clearInterval(interval);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setError(null);
    setHasSearched(true);
    try {
      const results = await searchPatients(searchQuery.trim());
      setPatients(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handlePatientSelect = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setError(null);
  }, []);

  const handleTriageSubmit = useCallback(async () => {
    if (!selectedPatient) return;
    setIsTriaging(true);
    setError(null);
    try {
      const result = await runTriage(selectedPatient.id, vitals);
      setTriageResults((prev) => ({ ...prev, [selectedPatient.id]: result }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Triage failed");
    } finally {
      setIsTriaging(false);
    }
  }, [selectedPatient, vitals]);

  const currentTriageResult = selectedPatient
    ? triageResults[selectedPatient.id] ?? null
    : null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative flex h-screen flex-col overflow-hidden"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="relative z-20 flex items-center justify-between px-6 py-3"
        style={{
          background: "rgba(2, 8, 23, 0.85)",
          borderBottom: "1px solid var(--border-subtle)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)",
              boxShadow: "0 0 20px rgba(59,130,246,0.35)",
            }}
          >
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1
              className="text-lg font-bold leading-tight tracking-tight"
              style={{
                fontFamily: "var(--font-outfit)",
                background: "linear-gradient(135deg, #f1f5f9, #94a3b8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              VitalsFlow
            </h1>
            <p className="text-[10px] tracking-widest uppercase"
               style={{ color: "var(--text-tertiary)" }}>
              AI Triage · NEWS2 Protocol
            </p>
          </div>
        </div>

        {/* Status + badge */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              background:
                backendOnline === null
                  ? "rgba(51, 65, 85, 0.4)"
                  : backendOnline
                  ? "rgba(34, 197, 94, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${
                backendOnline === null
                  ? "rgba(51,65,85,0.6)"
                  : backendOnline
                  ? "rgba(34,197,94,0.3)"
                  : "rgba(239,68,68,0.3)"
              }`,
              color:
                backendOnline === null
                  ? "var(--text-tertiary)"
                  : backendOnline
                  ? "#4ade80"
                  : "#f87171",
            }}
          >
            {backendOnline === null ? (
              <>
                <span
                  className="pulse-dot"
                  style={{ background: "var(--text-tertiary)" }}
                />
                Connecting…
              </>
            ) : backendOnline ? (
              <>
                <Wifi className="h-3.5 w-3.5" />
                FHIR Connected
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5" />
                Backend offline
              </>
            )}
          </div>

          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium"
            style={{
              background: "rgba(139, 92, 246, 0.1)",
              border: "1px solid rgba(139, 92, 246, 0.25)",
              color: "#c4b5fd",
            }}
          >
            <Sparkles className="h-3 w-3" />
            Gemini 1.5 Flash
          </div>
        </div>
      </header>

      {/* ── Error banner ────────────────────────────────────────────────────── */}
      {error && (
        <div
          className="relative z-20 flex items-center gap-3 px-6 py-3 text-sm animate-fade-in"
          style={{
            background: "rgba(153, 27, 27, 0.3)",
            borderBottom: "1px solid rgba(239,68,68,0.2)",
            color: "#fca5a5",
          }}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="rounded-md p-1 transition-colors hover:bg-red-900/40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 overflow-hidden">

        {/* ── Left sidebar ─────────────────────────────────────────────────── */}
        <aside
          className="flex w-72 flex-shrink-0 flex-col"
          style={{ borderRight: "1px solid var(--border-subtle)" }}
        >
          {/* Search box */}
          <div
            className="p-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <p
              className="mb-3 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--text-tertiary)" }}
            >
              Patient Search
            </p>
            <div className="flex gap-2">
              <input
                ref={searchInputRef}
                type="text"
                id="patient-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by name…"
                className="input-field flex-1"
                style={{ paddingRight: "0.75rem" }}
              />
              <button
                id="search-btn"
                onClick={handleSearch}
                disabled={isSearching}
                className="btn-primary flex-shrink-0 px-3"
                aria-label="Search patients"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button>
            </div>
            <p
              className="mt-2 text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              Try &ldquo;Smith&rdquo; or &ldquo;Johnson&rdquo; — HAPI FHIR R4 data
            </p>
          </div>

          {/* Patient list */}
          <div className="flex-1 overflow-y-auto">
            {isSearching ? (
              <div className="flex flex-col gap-0">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4"
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      animationDelay: `${i * 0.08}s`,
                    }}
                  >
                    <Skeleton className="mb-2 h-3.5 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                ))}
              </div>
            ) : patients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{
                    background: "rgba(30, 41, 59, 0.6)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <Stethoscope
                    className="h-7 w-7"
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {hasSearched ? "No patients found" : "Search for a patient"}
                </p>
                {!hasSearched && (
                  <p
                    className="mt-1 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Enter a name above to begin
                  </p>
                )}
              </div>
            ) : (
              <>
                <p
                  className="px-4 pt-3 pb-2 text-[10px] font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  {patients.length} patient{patients.length !== 1 ? "s" : ""} found
                </p>
                {patients.map((p, idx) => (
                  <div
                    key={p.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <PatientCard
                      patient={p}
                      isSelected={selectedPatient?.id === p.id}
                      onClick={() => handlePatientSelect(p)}
                      triageResult={triageResults[p.id] ?? null}
                    />
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div
            className="px-4 py-3"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <p
              className="text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              Synthetic data only · No real patient data stored
            </p>
          </div>
        </aside>

        {/* ── Right panel ──────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6">
          {!selectedPatient ? (
            /* ── Empty state ─── */
            <div className="flex h-full flex-col items-center justify-center text-center animate-fade-in">
              <div
                className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl"
                style={{
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid var(--border-default)",
                  boxShadow: "var(--shadow-glow-blue)",
                }}
              >
                <Stethoscope
                  className="h-11 w-11"
                  style={{ color: "rgba(59,130,246,0.5)" }}
                />
              </div>
              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-outfit)", color: "var(--text-secondary)" }}
              >
                Select a patient to begin
              </h2>
              <p
                className="mt-2 text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                Search by name on the left, then click a patient to load their profile
              </p>
              <div
                className="mt-8 flex items-center gap-2 text-xs rounded-full px-5 py-2.5"
                style={{
                  background: "rgba(59,130,246,0.06)",
                  border: "1px solid rgba(59,130,246,0.15)",
                  color: "rgba(148,163,184,0.7)",
                }}
              >
                <ChevronRight className="h-3.5 w-3.5" style={{ color: "#3b82f6" }} />
                Try searching for &ldquo;Smith&rdquo; to see a quick demo
              </div>
            </div>
          ) : (
            /* ── Patient workspace ─── */
            <div
              className="flex flex-col gap-5 max-w-5xl mx-auto animate-fade-in-up"
              style={{ opacity: 0 }}
            >
              {/* Patient header bar */}
              <div
                className="flex items-center justify-between rounded-xl px-5 py-4"
                style={{
                  background: "rgba(13, 21, 38, 0.8)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <div>
                  <h2
                    className="text-xl font-bold"
                    style={{ fontFamily: "var(--font-outfit)", color: "var(--text-primary)" }}
                  >
                    {selectedPatient.name}
                  </h2>
                  <p
                    className="mt-0.5 text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {selectedPatient.gender} &middot; DOB: {selectedPatient.dob} &middot;{" "}
                    <span
                      className="font-mono text-[10px]"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      ID: {selectedPatient.id}
                    </span>
                  </p>
                </div>
                {currentTriageResult ? (
                  <RiskBadge
                    tier={currentTriageResult.triage_tier}
                    score={currentTriageResult.risk_score}
                    news2Score={currentTriageResult.news2_score}
                    size="lg"
                  />
                ) : (
                  <span
                    className="text-xs rounded-full px-3 py-1.5"
                    style={{
                      background: "rgba(51,65,85,0.4)",
                      border: "1px solid rgba(51,65,85,0.6)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    Awaiting triage
                  </span>
                )}
              </div>

              {/* Vitals form */}
              <VitalsForm
                vitals={vitals}
                onChange={setVitals}
                onSubmit={handleTriageSubmit}
                isLoading={isTriaging}
                patientName={selectedPatient.name}
              />

              {/* Triage loading skeleton */}
              {isTriaging && (
                <div
                  className="grid grid-cols-3 gap-4 animate-fade-in"
                >
                  <div
                    className="col-span-1 h-48 rounded-xl skeleton"
                  />
                  <div
                    className="col-span-2 h-48 rounded-xl skeleton"
                  />
                </div>
              )}

              {/* Triage results */}
              {currentTriageResult && !isTriaging && (
                <div
                  className="flex flex-col gap-4 animate-fade-in-up"
                >
                  {/* Score card + Action center row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <TriageScoreCard result={currentTriageResult} />
                    </div>
                    <div className="col-span-2">
                      <ActionCenter
                        actions={currentTriageResult.suggested_actions}
                        justification={currentTriageResult.justification}
                        news2Score={currentTriageResult.news2_score}
                        riskScore={currentTriageResult.risk_score}
                        tier={currentTriageResult.triage_tier}
                      />
                    </div>
                  </div>

                  {/* Vitals trend — full width */}
                  <VitalsTrend
                    currentHR={vitals.heart_rate}
                    currentSpO2={vitals.spo2}
                    currentRR={vitals.respiratory_rate}
                    currentTemp={vitals.temperature}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
