"use client";

import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Brain,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionCenterProps {
  actions: string[];
  justification: string;
  news2Score: number;
  riskScore: number;
  tier: string;
}

type Tier = "critical" | "urgent" | "routine";

const tierStyle: Record<Tier, { accent: string; bg: string; border: string }> = {
  critical: {
    accent: "#ef4444",
    bg: "rgba(239, 68, 68, 0.06)",
    border: "rgba(239, 68, 68, 0.2)",
  },
  urgent: {
    accent: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.06)",
    border: "rgba(245, 158, 11, 0.2)",
  },
  routine: {
    accent: "#22c55e",
    bg: "rgba(34, 197, 94, 0.06)",
    border: "rgba(34, 197, 94, 0.15)",
  },
};

export function ActionCenter({
  actions,
  justification,
  news2Score,
  riskScore,
  tier,
}: ActionCenterProps) {
  const [approved, setApproved] = useState<Set<number>>(new Set());
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [justExpanded, setJustExpanded] = useState(true);

  const approve = (i: number) => {
    setApproved((prev) => new Set([...prev, i]));
    setDismissed((prev) => { const n = new Set(prev); n.delete(i); return n; });
  };
  const dismiss = (i: number) => {
    setDismissed((prev) => new Set([...prev, i]));
    setApproved((prev) => { const n = new Set(prev); n.delete(i); return n; });
  };

  const style = tierStyle[tier as Tier] ?? tierStyle.routine;
  const approvedCount = approved.size;
  const totalCount = actions.length;

  return (
    <div
      className="glass-card flex flex-col h-full overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4" style={{ color: style.accent }} />
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-outfit)" }}
          >
            Action Center
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-mono rounded-full px-2.5 py-0.5"
            style={{
              background: "rgba(30,41,59,0.7)",
              border: "1px solid rgba(51,65,85,0.5)",
              color: "var(--text-secondary)",
            }}
          >
            NEWS2: {news2Score} &nbsp;·&nbsp; Risk: {riskScore}/10
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div
          className="px-5 py-2 flex items-center gap-3"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div
            className="flex-1 rounded-full overflow-hidden"
            style={{ height: "4px", background: "rgba(30,41,59,0.8)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(approvedCount / totalCount) * 100}%`,
                background: "linear-gradient(90deg, #16a34a, #22c55e)",
              }}
            />
          </div>
          <span
            className="text-[10px] flex-shrink-0"
            style={{ color: "var(--text-tertiary)" }}
          >
            {approvedCount}/{totalCount} approved
          </span>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-col gap-3 p-5 flex-1 overflow-y-auto">
        {/* AI Justification */}
        {justification && (
          <div
            className="rounded-lg p-3"
            style={{
              background: "rgba(139, 92, 246, 0.06)",
              border: "1px solid rgba(139, 92, 246, 0.15)",
            }}
          >
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => setJustExpanded((v) => !v)}
            >
              <div className="flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5" style={{ color: "#a78bfa" }} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "#a78bfa" }}
                >
                  AI Clinical Reasoning
                </span>
              </div>
              {justExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" style={{ color: "#a78bfa" }} />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" style={{ color: "#a78bfa" }} />
              )}
            </button>
            {justExpanded && (
              <p
                className="mt-2 text-xs leading-relaxed italic animate-fade-in"
                style={{ color: "rgba(196, 181, 253, 0.75)" }}
              >
                {justification}
              </p>
            )}
          </div>
        )}

        {/* Action list */}
        {actions.length === 0 ? (
          <p
            className="text-center text-sm py-6"
            style={{ color: "var(--text-tertiary)" }}
          >
            No actions suggested for this patient
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {actions.map((action, i) => {
              const isApproved = approved.has(i);
              const isDismissed = dismissed.has(i);
              const isCriticalPending =
                tier === "critical" && !isApproved && !isDismissed;

              return (
                <li
                  key={i}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300",
                    isDismissed ? "opacity-30" : ""
                  )}
                  style={{
                    background: isApproved
                      ? "rgba(34, 197, 94, 0.08)"
                      : isDismissed
                      ? "rgba(30, 41, 59, 0.3)"
                      : isCriticalPending
                      ? "rgba(239, 68, 68, 0.05)"
                      : "rgba(15, 23, 42, 0.5)",
                    border: `1px solid ${
                      isApproved
                        ? "rgba(34, 197, 94, 0.25)"
                        : isDismissed
                        ? "rgba(51, 65, 85, 0.3)"
                        : isCriticalPending
                        ? "rgba(239, 68, 68, 0.25)"
                        : "var(--border-subtle)"
                    }`,
                  }}
                >
                  {/* Status icon */}
                  <div className="flex-shrink-0 w-5 flex items-center justify-center">
                    {isApproved ? (
                      <CheckCircle2
                        className="h-4 w-4 check-animate"
                        style={{ color: "#4ade80" }}
                      />
                    ) : isDismissed ? (
                      <XCircle
                        className="h-4 w-4"
                        style={{ color: "var(--text-muted)" }}
                      />
                    ) : (
                      <span
                        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                        style={{
                          background: isCriticalPending
                            ? "#ef4444"
                            : "var(--text-muted)",
                        }}
                      />
                    )}
                  </div>

                  {/* Action text */}
                  <span
                    className="flex-1 text-xs"
                    style={{
                      color: isApproved
                        ? "#86efac"
                        : isDismissed
                        ? "var(--text-muted)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {action}
                  </span>

                  {/* Buttons */}
                  {!isApproved && !isDismissed && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        id={`approve-action-${i}`}
                        onClick={() => approve(i)}
                        className="px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all duration-150 hover:-translate-y-0.5"
                        style={{
                          background: "rgba(34, 197, 94, 0.1)",
                          border: "1px solid rgba(34, 197, 94, 0.3)",
                          color: "#4ade80",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.2)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.1)";
                        }}
                      >
                        Approve
                      </button>
                      <button
                        id={`dismiss-action-${i}`}
                        onClick={() => dismiss(i)}
                        className="px-2 py-1 text-[10px] rounded-md transition-colors"
                        style={{
                          color: "var(--text-tertiary)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* Disclaimer */}
        <p
          className="text-[9px] mt-1 pt-3"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            color: "var(--text-muted)",
          }}
        >
          ⚠ AI suggestions are clinical decision support only. All actions
          require clinician review and approval before implementation.
        </p>
      </div>
    </div>
  );
}
