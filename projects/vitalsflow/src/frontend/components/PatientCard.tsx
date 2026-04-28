"use client";

import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { RiskBadge } from "./RiskBadge";
import type { Patient, TriageResult } from "@/lib/api";

interface PatientCardProps {
  patient: Patient;
  isSelected: boolean;
  onClick: () => void;
  triageResult: TriageResult | null;
}

export function PatientCard({
  patient,
  isSelected,
  onClick,
  triageResult,
}: PatientCardProps) {
  const tier = triageResult?.triage_tier;
  const accentColor =
    tier === "critical"
      ? "var(--color-critical)"
      : tier === "urgent"
      ? "var(--color-urgent)"
      : tier === "routine"
      ? "var(--color-routine)"
      : "var(--accent-blue)";

  return (
    <div
      id={`patient-card-${patient.id}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-pressed={isSelected}
      aria-label={`Patient: ${patient.name}${triageResult ? `, ${triageResult.triage_tier} triage tier, NEWS2 score ${triageResult.news2_score}` : ", not assessed"}`}
      className={cn(
        "relative clickable transition-all",
        "group focus-visible:outline-2 focus-visible:outline-[var(--accent-blue)]"
      )}
      style={{
        borderBottom: "1px solid var(--border-subtle)",
        borderLeft: `3px solid ${isSelected ? accentColor : "transparent"}`,
        background: isSelected
          ? "rgba(59, 130, 246, 0.05)"
          : "transparent",
        padding: "14px 16px",
        /* Scale hover (SKILL.md: scale-feedback) */
        transition: "background 180ms ease-out, border-color 180ms ease-out, transform 150ms ease-out",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.background = "rgba(13,77,138,0.04)";
      }}
      onMouseLeave={(e) => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm transition-all"
            style={{
              background: isSelected
                ? "var(--accent-blue-dim)"
                : "var(--bg-elevated)",
              border: `2px solid ${isSelected ? "var(--accent-blue)" : "var(--border-default)"}`,
              boxShadow: isSelected ? "0 0 12px rgba(59,130,246,0.15)" : "none",
            }}
            aria-hidden="true"
          >
            <User
              className="h-4 w-4"
              style={{ color: isSelected ? "var(--accent-blue)" : "var(--text-tertiary)", strokeWidth: 2.5 }}
            />
          </div>
          <span
            className="truncate text-sm font-medium"
            style={{ color: isSelected ? "var(--text-primary)" : "var(--text-secondary)" }}
          >
            {patient.name}
          </span>
        </div>

        <div className="shrink-0">
          {triageResult ? (
            <RiskBadge
              tier={triageResult.triage_tier}
              score={triageResult.risk_score}
              news2Score={triageResult.news2_score}
              size="sm"
            />
          ) : (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
              }}
            >
              Not assessed
            </span>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <p
        className="mt-1.5 truncate text-[10px] pl-9"
        style={{ color: "var(--text-muted)" }}
      >
        DOB: {patient.dob} &middot; {patient.gender} &middot; ID: {patient.id}
      </p>
    </div>
  );
}
