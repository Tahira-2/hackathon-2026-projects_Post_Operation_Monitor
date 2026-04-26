"use client";

import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  tier: string;
  score: number;
  news2Score: number;
  size?: "sm" | "lg";
}

type Tier = "critical" | "urgent" | "routine" | "unknown";

// Uses semantic CSS tokens from globals.css — no raw hex
const tierConfig: Record<Tier, {
  bg: string;
  border: string;
  color: string;
  dot: string;
  glow: string;
  label: string;
}> = {
  critical: {
    bg: "var(--color-critical-bg)",
    border: "var(--color-critical-border)",
    color: "var(--color-critical-text)",
    dot: "var(--color-critical)",
    glow: "0 0 8px rgba(239,68,68,0.2)",
    label: "Critical",
  },
  urgent: {
    bg: "var(--color-urgent-bg)",
    border: "var(--color-urgent-border)",
    color: "var(--color-urgent-text)",
    dot: "var(--color-urgent)",
    glow: "0 0 8px rgba(245,158,11,0.2)",
    label: "Urgent",
  },
  routine: {
    bg: "var(--color-routine-bg)",
    border: "var(--color-routine-border)",
    color: "var(--color-routine-text)",
    dot: "var(--color-routine)",
    glow: "0 0 8px rgba(34,197,94,0.15)",
    label: "Routine",
  },
  unknown: {
    bg: "var(--bg-elevated)",
    border: "var(--border-default)",
    color: "var(--text-secondary)",
    dot: "var(--text-tertiary)",
    glow: "none",
    label: "Unknown",
  },
};

export function RiskBadge({ tier, score, news2Score, size = "sm" }: RiskBadgeProps) {
  const normalizedTier = (tier as Tier) in tierConfig ? (tier as Tier) : "unknown";
  const config = tierConfig[normalizedTier];
  const isPending = score === 0;
  const dotSize = size === "lg" ? "9px" : "7px";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold tabular-nums",
        size === "lg" ? "px-4 py-2 text-sm gap-2" : "px-2.5 py-1 text-xs"
      )}
      style={{
        background: config.bg,
        border: "1px solid " + config.border,
        color: config.color,
        boxShadow: config.glow,
        fontFamily: "var(--font-inter)",
      }}
      // Accessible text for screen readers (SKILL.md: voiceover-sr)
      aria-label={
        isPending
          ? `${config.label} — pending analysis`
          : `${config.label} — risk score ${score} out of 10, NEWS2 score ${news2Score}`
      }
    >
      {/* Animated dot — aria-hidden since aria-label covers the meaning */}
      <span
        className="pulse-dot"
        style={{ background: config.dot, width: dotSize, height: dotSize }}
        aria-hidden="true"
      />

      {/* Tier label */}
      <span aria-hidden="true">{config.label}</span>

      {isPending ? (
        <>
          <span style={{ opacity: 0.4 }} aria-hidden="true">·</span>
          <span aria-hidden="true">Pending</span>
        </>
      ) : (
        <>
          <span style={{ opacity: 0.4 }} aria-hidden="true">·</span>
          <span aria-hidden="true">{score}/10</span>
          <span style={{ opacity: 0.4 }} aria-hidden="true">·</span>
          <span aria-hidden="true">NEWS2: {news2Score}</span>
        </>
      )}
    </span>
  );
}
