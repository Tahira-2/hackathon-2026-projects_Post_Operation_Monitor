"use client";

import { useEffect, useState } from "react";
import { Activity, Cpu, Database, Gauge, RefreshCcw, Timer } from "lucide-react";

import { getSystemHealth, type SystemHealthResponse } from "@/lib/api";

const escalationConfig = [
  { id: "news2-alert", label: "NEWS2 high-risk alert banner", defaultChecked: true },
  { id: "auto-escalate", label: "Auto-escalate when score > 7", defaultChecked: true },
  { id: "gemini-prefill", label: "Gemini pre-fills summary notes", defaultChecked: true },
];

export default function SystemHealthPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(escalationConfig.map(c => [c.id, c.defaultChecked]))
  );
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHealth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSystemHealth();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load system health");
      setHealth(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadHealth();
    const timer = window.setInterval(() => {
      void loadHealth();
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const statusCards = [
    {
      icon: Activity,
      title: "Backend API",
      status: health?.backend.status === "ok" ? "Operational" : "Unknown",
      detail: "Route: /health",
      tone: health?.backend.status === "ok" ? "good" as const : "info" as const,
    },
    {
      icon: Database,
      title: "FHIR Connectivity",
      status: health?.fhir.status === "ok" ? "Operational" : "Down",
      detail: health ? `Latency: ${health.fhir.latency_ms}ms` : "Checking...",
      tone: health?.fhir.status === "ok" ? "good" as const : "info" as const,
    },
    {
      icon: Cpu,
      title: "LLM Providers",
      status: health?.llm.status === "ok" ? "Ready" : "Degraded",
      detail: health
        ? `Gemini: ${health.llm.gemini_ready ? "yes" : "no"} · Groq: ${health.llm.groq_ready ? "yes" : "no"}`
        : "Checking...",
      tone: health?.llm.status === "ok" ? "good" as const : "info" as const,
    },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Health & Monitoring</h1>
          <p className="page-subtitle">
            Live telemetry and escalation configuration for the clinical AI triage engine
          </p>
        </div>
        <button type="button" className="btn-secondary rounded-full" onClick={() => void loadHealth()}>
          <RefreshCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "#ef4444", color: "#ef4444" }}>
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {statusCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="glass-card glass-card-hover p-4 stagger-card" style={{ animationDelay: `${i * 55}ms` }}>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                <Icon className="h-4 w-4" />
                {card.title}
              </div>
              <p className="mt-2 text-xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-outfit)" }}>
                {card.status}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>{card.detail}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="status-chip" data-tone={card.tone}>
                  <span className="breathe-dot" style={{ background: card.tone === "good" ? "#22c55e" : "var(--accent-blue)" }} aria-hidden="true" />
                  Live
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="glass-card glass-card-hover p-4 stagger-card" style={{ animationDelay: "165ms" }}>
          <p className="section-kicker">Performance</p>
          <h2 className="text-lg font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-outfit)" }}>
            Throughput & AI Efficiency
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            {[
              { icon: Activity, label: "Triages Processed / Hr", value: "142 pts (+12%)" },
              { icon: Timer, label: "Avg AI Analysis Time", value: "1.2 sec" },
              { icon: Gauge, label: "AI Suggestion Approval", value: "94%" },
            ].map(({ icon: MetricIcon, label, value }) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 transition-colors hover:border-[var(--accent-blue)]/30">
                <span className="inline-flex items-center gap-2 text-[var(--text-secondary)]"><MetricIcon className="h-4 w-4" />{label}</span>
                <strong className="tabular-nums text-[var(--text-primary)]">{value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card glass-card-hover p-4 stagger-card" style={{ animationDelay: "220ms" }}>
          <p className="section-kicker">Safety Controls</p>
          <h2 className="text-base font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-outfit)" }}>
            Escalation Config
          </h2>
          <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
            {escalationConfig.map((cfg) => (
              <label
                key={cfg.id}
                className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 cursor-pointer transition-colors hover:border-[var(--accent-blue)]/30"
                style={{ minHeight: "48px" }}
              >
                <span>{cfg.label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={toggles[cfg.id]}
                  aria-label={cfg.label}
                  className="toggle-switch"
                  data-active={String(toggles[cfg.id])}
                  onClick={() => setToggles(prev => ({ ...prev, [cfg.id]: !prev[cfg.id] }))}
                />
              </label>
            ))}
          </div>
        </article>
      </section>

      <section className="glass-card mt-10 p-5 stagger-card" style={{ animationDelay: "275ms" }}>
        <p className="section-kicker">Audit Trail</p>
        <h2 className="text-base font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-outfit)" }}>
          Live Runtime Details
        </h2>
        <ul className="mt-3 space-y-2">
          <li className="border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-xs">
            <span style={{ color: "var(--text-secondary)" }}>
              FHIR status: {health?.fhir.status ?? "unknown"}{health?.fhir.error ? ` · ${health.fhir.error}` : ""}
            </span>
          </li>
          <li className="border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-xs">
            <span style={{ color: "var(--text-secondary)" }}>
              LLM readiness: Gemini {health?.llm.gemini_ready ? "ready" : "not ready"}, Groq {health?.llm.groq_ready ? "ready" : "not ready"}
            </span>
          </li>
          <li className="border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-xs">
            <span style={{ color: "var(--text-secondary)" }}>
              Auto-refresh interval: 30s
            </span>
          </li>
        </ul>
      </section>
    </>
  );
}
