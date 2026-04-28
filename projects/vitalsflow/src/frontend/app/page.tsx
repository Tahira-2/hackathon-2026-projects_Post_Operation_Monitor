"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Wifi, WifiOff, Database, Users } from "lucide-react";

import { healthCheck, searchPatients, type Patient } from "@/lib/api";

export default function DashboardPage() {
  const [query, setQuery] = useState("Smith");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const check = async () => {
      const ok = await healthCheck();
      if (active) setBackendOnline(ok);
    };
    void check();
    
    const interval = setInterval(check, 60000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const runSearch = async (name: string) => {
    setIsSearching(true);
    setError(null);
    try {
      const data = await searchPatients(name, 12);
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patients");
      setPatients([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    void runSearch(query);
  }, []);

  const subtitle = useMemo(() => {
    if (isSearching) return "Loading patients from backend and FHIR...";
    return `Showing ${patients.length} patient${patients.length === 1 ? "" : "s"} from live search`;
  }, [isSearching, patients.length]);

return (
    <>
      <div className="page-header">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="page-title">Clinician Dashboard</h1>
            <p className="page-subtitle">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium"
            style={{
              background: backendOnline ? "var(--color-routine-bg)" : "var(--color-critical-bg)",
              border: "1px solid " + (backendOnline ? "var(--color-routine-border)" : "var(--color-critical-border)"),
              color: backendOnline ? "var(--color-routine-text)" : "var(--color-critical-text)",
            }}
          >
            {backendOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span className="text-xs">{backendOnline === null ? "Checking..." : backendOnline ? "Backend online" : "Backend offline"}</span>
          </div>
        </div>
      </div>

      <section className="glass-card stagger-card p-5">
        <div className="flex items-center gap-2 mb-5">
          <Search className="h-4 w-4" style={{ color: "var(--accent-blue)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Patient Search</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void runSearch(query);
            }}
            placeholder="Search by patient name..."
            className="h-12 flex-1 rounded-lg px-4 text-sm transition-all duration-200"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-blue)";
              e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-blue-dim)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-default)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          <button onClick={() => void runSearch(query)} className="btn-primary h-12 px-6 text-sm">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>Search</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm" style={{ background: "var(--color-critical-bg)", color: "var(--color-critical-text)", border: "1px solid var(--color-critical-border)" }}>
            <WifiOff className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </section>

      <section className="glass-card mt-8 overflow-hidden stagger-card" style={{ animationDelay: "100ms" }}>
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" style={{ color: "var(--accent-blue)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Patient Registry
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              FHIR R4 • HAPI Server
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left" role="grid" aria-label="Patient search results">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {["Name", "Date of Birth", "Gender", "Patient ID", "Action"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--text-muted)", background: "var(--bg-elevated)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isSearching && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center" style={{ color: "var(--text-secondary)" }}>
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--accent-blue)" }} />
                      <span className="text-sm">Fetching patients from FHIR server...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isSearching && patients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center" style={{ color: "var(--text-secondary)" }}>
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8" style={{ color: "var(--text-muted)" }} />
                      <span className="text-sm">No patients found</span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>Try adjusting your search query</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isSearching &&
                patients.map((patient, idx) => (
                  <tr 
                    key={patient.id} 
                    className="table-row-hover stagger-card"
                    style={{ 
                      borderBottom: "1px solid var(--border-subtle)",
                      animationDelay: `${150 + idx * 30}ms`
                    }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "var(--accent-blue-dim)" }}>
                          <span className="text-xs font-semibold" style={{ color: "var(--accent-blue)" }}>{patient.name.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {patient.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm tabular-nums" style={{ color: "var(--text-secondary)" }}>
                      {patient.dob || "Unknown"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" 
                        style={{ 
                          background: patient.gender === "male" ? "rgba(59, 130, 246, 0.1)" : "rgba(236, 72, 153, 0.1)",
                          color: patient.gender === "male" ? "#3b82f6" : "#ec4899",
                          textTransform: "capitalize"
                        }}>
                        {patient.gender || "Unknown"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-mono tabular-nums" style={{ color: "var(--text-muted)" }}>
                      {patient.id}
                    </td>
                    <td className="px-5 py-4">
                      <Link 
                        href={`/patient/${patient.id}`} 
                        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 hover:scale-[1.02]"
                        style={{ 
                          background: "var(--accent-blue-dim)", 
                          color: "var(--accent-blue)",
                          border: "1px solid var(--accent-blue)/30"
                        }}
                      >
                        <span>Open Triage</span>
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}