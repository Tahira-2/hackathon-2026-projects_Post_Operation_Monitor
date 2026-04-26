"use client";

import { useState } from "react";
import {
  CheckCircle2, XCircle, Brain, ChevronDown, ChevronUp,
  Zap, TriangleAlert, ClipboardList,
} from "lucide-react";
import { approveAction } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ActionCenterProps {
  patientId: string;
  actions: string[];
  justification: string;
  news2Score: number;
  riskScore: number;
  tier: string;
  onError?: (message: string) => void;
}

export function ActionCenter({ patientId, actions, justification, news2Score, riskScore, tier, onError }: ActionCenterProps) {
  const [approved, setApproved] = useState<Set<number>>(new Set());
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [approving, setApproving] = useState<Set<number>>(new Set());
  const [justExpanded, setJustExpanded] = useState(true);

  const approve = (i: number) => {
    setApproved((prev) => new Set([...prev, i]));
    setDismissed((prev) => { const n = new Set(prev); n.delete(i); return n; });
  };
  const dismiss = (i: number) => {
    setDismissed((prev) => new Set([...prev, i]));
    setApproved((prev) => { const n = new Set(prev); n.delete(i); return n; });
  };

  const handleApprove = async (i: number) => {
    if (approving.has(i)) return;
    const action = actions[i];
    if (!action) return;
    setApproving((prev) => new Set(prev).add(i));
    try {
      await approveAction(patientId, { action, justification, risk_score: riskScore, news2_score: news2Score, triage_tier: tier });
      approve(i);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Failed to draft ServiceRequest");
    } finally {
      setApproving((prev) => { const next = new Set(prev); next.delete(i); return next; });
    }
  };

  const approvedCount = approved.size;
  const totalCount = actions.length;
  const justPanelId = "action-just-panel";

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden stagger-card" style={{ animationDelay: "200ms" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center" style={{ background: "var(--accent-blue-dim)" }} aria-hidden="true">
            <Zap className="h-4 w-4" style={{ color: "var(--accent-blue)" }} />
          </div>
          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)", fontFamily: "var(--font-outfit)" }}>
            AI Suggested Actions
          </span>
        </div>
        <span className="px-2 py-1 font-mono text-xs tabular-nums" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
          NEWS2: {news2Score} · Risk: {riskScore}/10
        </span>
      </div>

      {/* Progress */}
      {totalCount > 0 && (
        <div className="px-4 py-2 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}
          role="status" aria-live="polite" aria-label={`${approvedCount} of ${totalCount} actions approved`}>
          <div className="flex-1 rounded-full overflow-hidden" style={{ height: "6px", background: "var(--bg-elevated)" }} aria-hidden="true">
            <div className="h-full rounded-full transition-all duration-700 progress-fill"
              style={{ background: "linear-gradient(90deg, #16a34a, #22c55e)" }} />
          </div>
          <span className="shrink-0 text-xs font-medium tabular-nums" style={{ color: "var(--text-tertiary)" }} aria-hidden="true">
            {approvedCount}/{totalCount} approved
          </span>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-col gap-3 p-4 flex-1 overflow-y-auto">
        {/* AI Justification */}
        {justification && (
          <div className="p-2" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <button className="flex items-center justify-between w-full text-left clickable"
              onClick={() => setJustExpanded((v) => !v)}
              aria-expanded={justExpanded} aria-controls={justPanelId} style={{ minHeight: "44px" }}>
              <div className="flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5" style={{ color: "var(--accent-blue)" }} aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent-blue)" }}>
                  AI Clinical Reasoning
                </span>
              </div>
              {justExpanded
                ? <ChevronUp className="h-3.5 w-3.5" style={{ color: "var(--accent-blue)" }} aria-hidden="true" />
                : <ChevronDown className="h-3.5 w-3.5" style={{ color: "var(--accent-blue)" }} aria-hidden="true" />}
            </button>
            {justExpanded && (
              <p id={justPanelId} className="mt-2 text-xs leading-relaxed italic expand-down" style={{ color: "var(--text-secondary)" }}>
                {justification}
              </p>
            )}
          </div>
        )}

        {/* Action list or empty state */}
        {actions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--bg-elevated)" }} aria-hidden="true">
              <ClipboardList className="h-6 w-6" style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>No actions suggested</p>
            <p className="text-xs max-w-[220px]" style={{ color: "var(--text-muted)" }}>
              Run triage analysis to generate AI-suggested clinical actions for this patient.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2" aria-label="Suggested clinical actions">
            {actions.map((action, i) => {
              const isApproved = approved.has(i);
              const isDismissed = dismissed.has(i);
              const isCriticalPending = tier === "critical" && !isApproved && !isDismissed;
              return (
                <li key={i}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300", isDismissed ? "opacity-40" : "")}
                  style={{
                    minHeight: "44px",
                    background: isApproved ? "rgba(34,197,94,0.08)" : isDismissed ? "var(--bg-elevated)" : isCriticalPending ? "rgba(239,68,68,0.05)" : "var(--bg-surface)",
                    border: "1px solid " + (isApproved ? "rgba(34,197,94,0.25)" : isDismissed ? "var(--border-default)" : isCriticalPending ? "rgba(239,68,68,0.25)" : "var(--border-subtle)"),
                  }}
                  aria-label={`Action: ${action}${isApproved ? " — approved" : isDismissed ? " — dismissed" : ""}`}
                >
                  <div className="w-5 shrink-0 flex items-center justify-center" aria-hidden="true">
                    {isApproved ? <CheckCircle2 className="h-4 w-4 check-animate" style={{ color: "#4ade80" }} />
                      : isDismissed ? <XCircle className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                      : <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: isCriticalPending ? "#ef4444" : "var(--text-muted)" }} />}
                  </div>
                  <span className="flex-1 text-sm" style={{ color: isApproved ? "#15803d" : isDismissed ? "var(--text-muted)" : "var(--text-secondary)" }}>
                    {action}
                  </span>
                  {!isApproved && !isDismissed && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button id={`approve-action-${i}`} onClick={() => void handleApprove(i)} disabled={approving.has(i)}
                        aria-label={`Draft action: ${action}`}
                        title="Creates a FHIR ServiceRequest in draft status pending clinician review"
                        className="clickable press-scale rounded-md px-3 py-2 text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
                        style={{ minHeight: "44px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#16a34a" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.2)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.1)"; }}>
                        {approving.has(i) ? "Saving…" : "Draft"}
                      </button>
                      <button id={`dismiss-action-${i}`} onClick={() => dismiss(i)} aria-label={`Dismiss action: ${action}`}
                        className="clickable rounded-md px-2.5 py-2 text-xs transition-colors"
                        style={{ minHeight: "44px", color: "var(--text-tertiary)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"; }}>
                        Skip
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* Disclaimer — SVG icon instead of emoji */}
        <p className="mt-1 flex items-start gap-1.5 pt-3 text-[11px]"
          style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-muted)" }} role="note">
          <TriangleAlert className="h-3 w-3 shrink-0 mt-0.5" aria-hidden="true" />
          AI suggestions are clinical decision support only. All actions require clinician review and approval before implementation.
        </p>
      </div>
    </div>
  );
}
