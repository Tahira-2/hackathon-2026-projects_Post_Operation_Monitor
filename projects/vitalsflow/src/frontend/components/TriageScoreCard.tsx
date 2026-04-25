"use client";

import type { TriageResult } from "@/lib/api";

interface TriageScoreCardProps {
  result: TriageResult;
}

type Tier = "critical" | "urgent" | "routine";

const tierMeta: Record<Tier, { color: string; bg: string; label: string; stroke: string }> = {
  critical: {
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.1)",
    label: "CRITICAL",
    stroke: "#ef4444",
  },
  urgent: {
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.1)",
    label: "URGENT",
    stroke: "#f59e0b",
  },
  routine: {
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.1)",
    label: "ROUTINE",
    stroke: "#22c55e",
  },
};

const CIRCUMFERENCE = 2 * Math.PI * 45; // r=45

function ScoreRing({
  score,
  max,
  color,
  strokeColor,
  size = 110,
  label,
  sublabel,
}: {
  score: number;
  max: number;
  color: string;
  strokeColor: string;
  size?: number;
  label: string;
  sublabel: string;
}) {
  const pct = Math.min(score / max, 1);
  const r = 45;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size}
        viewBox="0 0 110 110"
        style={{ overflow: "visible" }}
      >
        {/* Glow filter */}
        <defs>
          <filter id={`glow-${label}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke="rgba(30, 41, 59, 0.8)"
          strokeWidth="8"
        />

        {/* Progress */}
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 55 55)"
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          filter={`url(#glow-${label})`}
        />

        {/* Center label */}
        <text
          x="55"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize="22"
          fontWeight="700"
          fontFamily="'Outfit', sans-serif"
        >
          {score}
        </text>
        <text
          x="55"
          y="67"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(148,163,184,0.6)"
          fontSize="8"
          fontFamily="'Inter', sans-serif"
          fontWeight="500"
        >
          /{max}
        </text>
      </svg>
      <p
        className="text-[10px] font-semibold uppercase tracking-wider text-center"
        style={{ color: "rgba(148,163,184,0.7)" }}
      >
        {sublabel}
      </p>
    </div>
  );
}

export function TriageScoreCard({ result }: TriageScoreCardProps) {
  const tier = (result.triage_tier as Tier) in tierMeta
    ? (result.triage_tier as Tier)
    : "routine";
  const meta = tierMeta[tier];
  const glowClass =
    tier === "critical"
      ? "glow-critical"
      : tier === "urgent"
      ? "glow-urgent"
      : "glow-routine";

  return (
    <div
      className={`glass-card flex flex-col items-center gap-5 p-5 h-full ${glowClass}`}
      style={{
        background: `linear-gradient(160deg, ${meta.bg}, rgba(13,21,38,0.9))`,
        borderColor: `${meta.color}33`,
      }}
    >
      {/* Tier badge */}
      <div
        className="w-full text-center rounded-lg py-2 font-bold text-sm tracking-widest uppercase"
        style={{
          fontFamily: "var(--font-outfit)",
          background: `${meta.color}18`,
          border: `1px solid ${meta.color}40`,
          color: meta.color,
        }}
      >
        {meta.label}
      </div>

      {/* Score rings */}
      <div className="flex flex-col items-center gap-4 w-full">
        <ScoreRing
          score={result.risk_score}
          max={10}
          color={meta.color}
          strokeColor={meta.stroke}
          size={120}
          label="risk"
          sublabel="AI Risk Score"
        />

        <div className="divider w-full" />

        <ScoreRing
          score={result.news2_score}
          max={20}
          color={meta.color}
          strokeColor={`${meta.stroke}99`}
          size={90}
          label="news2"
          sublabel="NEWS2 Score"
        />
      </div>

      {/* Threshold guide */}
      <div
        className="w-full rounded-lg p-3 text-[10px]"
        style={{
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px solid rgba(51, 65, 85, 0.4)",
        }}
      >
        <p
          className="font-semibold mb-2 text-[9px] uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          NEWS2 Thresholds
        </p>
        {[
          { range: "0–4", label: "Routine", color: "#22c55e" },
          { range: "5–6", label: "Urgent", color: "#f59e0b" },
          { range: "7+", label: "Critical", color: "#ef4444" },
        ].map(({ range, label, color }) => (
          <div
            key={label}
            className="flex items-center justify-between py-0.5"
          >
            <span className="font-mono" style={{ color }}>
              {range}
            </span>
            <span style={{ color: "var(--text-tertiary)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
