"use client";

import { User, Heart } from "lucide-react";
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
      ? "#ef4444"
      : tier === "urgent"
      ? "#f59e0b"
      : tier === "routine"
      ? "#22c55e"
      : "#3b82f6";

  return (
    <div
      id={`patient-card-${patient.id}`}
      onClick={onClick}
      className={cn(
        "relative cursor-pointer transition-all duration-200",
        "group"
      )}
      style={{
        borderBottom: "1px solid var(--border-subtle)",
        borderLeft: `3px solid ${isSelected ? accentColor : "transparent"}`,
        background: isSelected
          ? "rgba(59, 130, 246, 0.05)"
          : "transparent",
        padding: "14px 16px",
      }}
    >
      {/* Hover overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: "rgba(255,255,255,0.02)", pointerEvents: "none" }}
      />

      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm"
            style={{
              background: isSelected
                ? "linear-gradient(135deg, rgba(96,165,250,0.3), rgba(59,130,246,0.2))"
                : "linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.6))",
              border: `2px solid ${isSelected ? "rgba(96,165,250,0.4)" : "rgba(51,65,85,0.4)"}`,
              boxShadow: isSelected ? "0 0 12px rgba(59,130,246,0.15)" : "none",
            }}
            title="Patient (human)"
          >
            <User
              className="h-4 w-4"
              style={{ color: isSelected ? "#60a5fa" : "var(--text-tertiary)", strokeWidth: 2.5 }}
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
                background: "rgba(30,41,59,0.5)",
                border: "1px solid rgba(51,65,85,0.4)",
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
