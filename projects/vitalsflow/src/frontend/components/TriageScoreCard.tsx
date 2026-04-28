"use client";

import type { TriageResult } from "@/lib/api";

interface TriageScoreCardProps {
  result: TriageResult;
}

type Tier = "critical" | "urgent" | "routine";

// Uses semantic CSS tokens — no raw hex
const tierMeta: Record<Tier, { color: string; bg: string; label: string; stroke: string }> = {
  critical: {
    color: "var(--color-critical)",
    bg: "var(--color-critical-bg)",
    label: "CRITICAL",
    stroke: "var(--color-critical)",
  },
  urgent: {
    color: "var(--color-urgent)",
    bg: "var(--color-urgent-bg)",
    label: "URGENT",
    stroke: "var(--color-urgent)",
  },
  routine: {
    color: "var(--color-routine)",
    bg: "var(--color-routine-bg)",
    label: "ROUTINE",
    stroke: "var(--color-routine)",
  },
};

// Map tier label → resolved hex for SVG (SVG doesn't read CSS custom properties)
const tierHex: Record<Tier, { color: string; stroke: string; strokeDim: string }> = {
  critical: { color: "#ef4444", stroke: "#ef4444", strokeDim: "#ef444499" },
  urgent:   { color: "#f59e0b", stroke: "#f59e0b", strokeDim: "#f59e0b99" },
  routine:  { color: "#22c55e", stroke: "#22c55e", strokeDim: "#22c55e99" },
};

function ScoreRing({
  score,
  max,
  hexColor,
  hexStroke,
  size = 110,
  sublabel,
  ringId,
}: {
  score: number;
  max: number;
  hexColor: string;
  hexStroke: string;
  size?: number;
  sublabel: string;
  ringId: string;
}) {
  const r = 45;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(score / max, 1);
  const dashOffset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Accessible SVG: role + title for screen readers */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 110 110"
        style={{ overflow: "visible" }}
        role="img"
        aria-label={`${sublabel}: ${score} out of ${max}`}
      >
        <defs>
          <filter id={`glow-${ringId}`} x="-50%" y="-50%" width="200%" height="200%">
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
          stroke="rgba(27,56,84,0.15)"
          strokeWidth="8"
        />

        {/* Progress ring */}
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke={hexStroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 55 55)"
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            willChange: "stroke-dashoffset",
          }}
          filter={`url(#glow-${ringId})`}
        />

        {/* Center score — tabular-nums via font-feature-settings */}
        <text
          x="55"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={hexColor}
          fontSize="22"
          fontWeight="700"
          fontFamily="'Outfit', sans-serif"
          style={{ fontVariantNumeric: "tabular-nums" }}
          aria-hidden="true"
        >
          {score}
        </text>
        <text
          x="55"
          y="67"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--text-tertiary)"
          fontSize="8"
          fontFamily="'Inter', sans-serif"
          fontWeight="500"
          aria-hidden="true"
        >
          /{max}
        </text>
      </svg>

      <p
        className="mt-2 text-center text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-secondary)" }}
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
  const hex = tierHex[tier];

  return (
    <div
      className="glass-card flex h-full flex-col items-center gap-5 p-5"
      style={{
        background: meta.bg,
        borderColor: hex.color + "33",
      }}
      // Announce the triage tier to screen readers as a status region
      aria-live="polite"
      aria-label={`Triage result: ${meta.label}. Risk score ${result.risk_score} out of 10. NEWS2 score ${result.news2_score}.`}
    >
      {/* Tier badge */}
      <div
        className="w-full rounded-lg py-2 text-center text-sm font-bold uppercase tracking-widest"
        style={{
          fontFamily: "var(--font-outfit)",
          background: hex.color + "18",
          border: "1px solid " + hex.color + "40",
          color: hex.color,
        }}
        aria-hidden="true"
      >
        {meta.label}
      </div>

      {/* Score rings */}
      <div className="flex flex-col items-center gap-4 w-full">
        <ScoreRing
          score={result.risk_score}
          max={10}
          hexColor={hex.color}
          hexStroke={hex.stroke}
          size={120}
          sublabel="AI Risk Score"
          ringId="risk"
        />

        <div className="divider w-full" />

        <ScoreRing
          score={result.news2_score}
          max={20}
          hexColor={hex.color}
          hexStroke={hex.strokeDim}
          size={90}
          sublabel="NEWS2 Score"
          ringId="news2"
        />
      </div>

      {/* Threshold guide — data table accessible alternative (SKILL.md: data-table) */}
      <div
        className="w-full rounded-lg p-3 text-xs"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <p
          className="mb-2 text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          NEWS2 Thresholds
        </p>
        <table className="w-full" aria-label="NEWS2 score thresholds">
          <tbody>
            {[
              { range: "0–4", label: "Routine", color: "#22c55e" },
              { range: "5–6", label: "Urgent",  color: "#f59e0b" },
              { range: "7+",  label: "Critical", color: "#ef4444" },
            ].map(({ range, label, color }) => (
              <tr key={label}>
                <td
                  className="font-mono tabular-nums py-0.5 pr-3"
                  style={{ color }}
                >
                  {range}
                </td>
                <td style={{ color: "var(--text-tertiary)" }}>{label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
