"use client";

import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  tier: string;
  score: number;
  news2Score: number;
  size?: "sm" | "lg";
}

type Tier = "critical" | "urgent" | "routine";

const tierConfig: Record<Tier, {
  bg: string;
  border: string;
  color: string;
  dot: string;
  glow: string;
}> = {
  critical: {
    bg: "rgba(153, 27, 27, 0.18)",
    border: "rgba(239, 68, 68, 0.35)",
    color: "#f87171",
    dot: "#ef4444",
    glow: "0 0 14px rgba(239,68,68,0.3)",
  },
  urgent: {
    bg: "rgba(120, 53, 15, 0.2)",
    border: "rgba(245, 158, 11, 0.35)",
    color: "#fbbf24",
    dot: "#f59e0b",
    glow: "0 0 14px rgba(245,158,11,0.25)",
  },
  routine: {
    bg: "rgba(20, 83, 45, 0.18)",
    border: "rgba(34, 197, 94, 0.3)",
    color: "#4ade80",
    dot: "#22c55e",
    glow: "0 0 12px rgba(34,197,94,0.2)",
  },
};

const fallbackConfig = {
  bg: "rgba(30, 41, 59, 0.5)",
  border: "rgba(51, 65, 85, 0.6)",
  color: "rgba(148, 163, 184, 0.7)",
  dot: "#475569",
  glow: "none",
};

export function RiskBadge({ tier, score, news2Score, size = "sm" }: RiskBadgeProps) {
  const config = tierConfig[tier as Tier] ?? fallbackConfig;
  const isPending = score === 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        size === "lg" ? "px-4 py-2 text-sm gap-2" : "px-2.5 py-1 text-xs"
      )}
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        boxShadow: config.glow,
        fontFamily: "var(--font-inter)",
      }}
    >
      {/* Animated dot */}
      <span
        className="pulse-dot"
        style={{ background: config.dot, width: size === "lg" ? "9px" : "7px", height: size === "lg" ? "9px" : "7px" }}
      />

      {/* Tier label */}
      <span className="capitalize">{tier}</span>

      {!isPending && (
        <>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{score}/10</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>NEWS2: {news2Score}</span>
        </>
      )}
    </span>
  );
}
