"use client";

import { ChevronDown, ChevronUp, AlertCircle, Brain, TriangleAlert } from "lucide-react";
import { useState } from "react";
import type { TriageResult, VitalsPayload } from "@/lib/api";

interface EvidenceInspectorProps {
  result: TriageResult;
  vitals: VitalsPayload;
}

// NEWS2 scoring reference (for display)
const NEWS2_THRESHOLDS = {
  respiratory_rate: { low: 12, high: 20, points: (rr: number) => {
    if (rr < 9) return 3;
    if (rr < 12) return 1;
    if (rr <= 20) return 0;
    if (rr <= 24) return 2;
    return 3;
  }},
  oxygen_saturation: { low: 96, high: 100, points: (spo2: number) => {
    if (spo2 < 92) return 3;
    if (spo2 < 94) return 2;
    if (spo2 < 96) return 1;
    return 0;
  }},
  temperature: { low: 36.1, high: 38.0, points: (temp: number) => {
    if (temp < 35.1) return 3;
    if (temp < 36.1) return 1;
    if (temp <= 38.0) return 0;
    if (temp <= 39.0) return 1;
    return 2;
  }},
  systolic_bp: { low: 90, high: 140, points: (sbp: number) => {
    if (sbp < 91) return 3;
    if (sbp < 101) return 1;
    if (sbp <= 140) return 0;
    if (sbp <= 180) return 1;
    return 2;
  }},
  heart_rate: { low: 60, high: 100, points: (hr: number) => {
    if (hr < 41) return 3;
    if (hr < 51) return 1;
    if (hr <= 90) return 0;
    if (hr <= 110) return 1;
    if (hr <= 130) return 2;
    return 3;
  }},
};

// Tier → resolved hex (CSS vars don't work in inline SVG contexts reliably)
const tierHex: Record<string, { color: string; bg: string; border: string }> = {
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.25)" },
  urgent:   { color: "#f59e0b", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.25)" },
  routine:  { color: "#22c55e", bg: "rgba(34,197,94,0.06)",  border: "rgba(34,197,94,0.22)" },
};

export function EvidenceInspector({ result, vitals }: EvidenceInspectorProps) {
  const [expanded, setExpanded] = useState(false);

  const componentScores = {
    respiratory_rate: NEWS2_THRESHOLDS.respiratory_rate.points(vitals.respiratory_rate),
    spo2: NEWS2_THRESHOLDS.oxygen_saturation.points(vitals.spo2),
    temperature: NEWS2_THRESHOLDS.temperature.points(vitals.temperature),
    systolic_bp: NEWS2_THRESHOLDS.systolic_bp.points(vitals.systolic_bp),
    heart_rate: NEWS2_THRESHOLDS.heart_rate.points(vitals.heart_rate),
  };

  const breachedVitals = [
    { name: "Respiratory Rate", value: vitals.respiratory_rate, unit: "/min",  threshold: NEWS2_THRESHOLDS.respiratory_rate,  score: componentScores.respiratory_rate },
    { name: "SpO₂",            value: vitals.spo2,              unit: "%",     threshold: NEWS2_THRESHOLDS.oxygen_saturation,  score: componentScores.spo2 },
    { name: "Temperature",     value: vitals.temperature,       unit: "°C",    threshold: NEWS2_THRESHOLDS.temperature,        score: componentScores.temperature },
    { name: "Systolic BP",     value: vitals.systolic_bp,       unit: "mmHg",  threshold: NEWS2_THRESHOLDS.systolic_bp,        score: componentScores.systolic_bp },
    { name: "Heart Rate",      value: vitals.heart_rate,        unit: "bpm",   threshold: NEWS2_THRESHOLDS.heart_rate,         score: componentScores.heart_rate },
  ].filter((v) => v.score > 0);

  const tier = result.triage_tier in tierHex ? result.triage_tier : "routine";
  const { color: tierColor, bg: tierBg, border: tierBorder } = tierHex[tier];

  const panelId = "evidence-panel";

  return (
    <div
      className="rounded-lg overflow-hidden stagger-card"
      style={{ animationDelay: "250ms", background: tierBg, border: "1px solid " + tierBorder }}
    >
      {/* Toggle button — SKILL.md: aria-expanded, state-transition */}
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="w-full flex items-center justify-between px-4 py-3 transition-opacity hover:opacity-90 clickable"
        style={{ background: tierBg, minHeight: "44px" }}
      >
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5" style={{ color: tierColor }} aria-hidden="true" />
          <span className="font-semibold text-sm" style={{ color: tierColor, fontFamily: "var(--font-outfit)" }}>
            Evidence &amp; Scoring
          </span>
        </div>
        {expanded
          ? <ChevronUp className="h-4 w-4" style={{ color: tierColor }} aria-hidden="true" />
          : <ChevronDown className="h-4 w-4" style={{ color: tierColor }} aria-hidden="true" />
        }
      </button>

      {/* Expanded content — smooth entrance animation (SKILL.md: expand-down) */}
      {expanded && (
        <div
          id={panelId}
          role="region"
          aria-label="Clinical evidence and scoring"
          className="border-t px-4 py-4 space-y-4 expand-down"
          style={{ borderColor: tierColor + "40" }}
        >
          {/* Why This Risk? */}
          <section aria-labelledby="why-risk-heading">
            <h4
              id="why-risk-heading"
              className="text-xs font-semibold uppercase mb-3"
              style={{ color: tierColor }}
            >
              Why This Risk?
            </h4>
            {breachedVitals.length > 0 ? (
              <ul className="space-y-2" aria-label="Breached vital signs">
                {breachedVitals.map((vital) => (
                  <li
                    key={vital.name}
                    className="flex items-start gap-2 rounded px-2.5 py-2 text-xs"
                    style={{
                      background: `${tierColor}08`,
                      borderLeft: `2px solid ${tierColor}`,
                    }}
                  >
                    <AlertCircle
                      className="h-3.5 w-3.5 shrink-0 mt-0.5"
                      style={{ color: tierColor }}
                      aria-hidden="true"
                    />
                    <span style={{ color: "var(--text-secondary)" }}>
                      <strong className="tabular-nums" style={{ color: "var(--text-primary)" }}>
                        {vital.name}: {vital.value.toFixed(1)}
                      </strong>{" "}
                      {vital.unit} (normal: {vital.threshold.low}–{vital.threshold.high}) — +{vital.score} NEWS2 pt{vital.score !== 1 ? "s" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                All vitals within expected range. Risk driven by combination factors.
              </p>
            )}
          </section>

          {/* NEWS2 Breakdown */}
          <section aria-labelledby="news2-breakdown-heading">
            <h4
              id="news2-breakdown-heading"
              className="text-xs font-semibold uppercase mb-3"
              style={{ color: tierColor }}
            >
              NEWS2 Breakdown
            </h4>
            <table className="w-full" aria-label="NEWS2 component scores">
              <tbody className="space-y-1">
                {Object.entries(componentScores).map(([key, points]) => (
                  <tr key={key} className="flex items-center justify-between text-xs py-0.5">
                    <td style={{ color: "var(--text-secondary)" }}>
                      {key === "respiratory_rate" ? "Respiratory Rate"
                        : key === "spo2"          ? "SpO₂"
                        : key === "systolic_bp"   ? "Systolic BP"
                        : key === "heart_rate"    ? "Heart Rate"
                        : "Temperature"}
                    </td>
                    <td>
                      <span
                        className="font-semibold tabular-nums px-2 py-0.5 rounded"
                        style={{
                          background: points > 0 ? `${tierColor}20` : "rgba(34,197,94,0.15)",
                          color: points > 0 ? tierColor : "#16a34a",
                        }}
                      >
                        {points} pt{points !== 1 ? "s" : ""}
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr
                  className="flex items-center justify-between text-xs border-t pt-2 mt-2"
                  style={{ borderColor: "rgba(148,163,184,0.15)" }}
                >
                  <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>Total NEWS2</td>
                  <td>
                    <span
                      className="font-bold tabular-nums px-2 py-0.5 rounded"
                      style={{ background: tierColor + "25", color: tierColor }}
                    >
                      {result.news2_score}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* AI Analysis */}
          <section aria-labelledby="ai-analysis-heading">
            <h4
              id="ai-analysis-heading"
              className="text-xs font-semibold uppercase mb-3"
              style={{ color: tierColor }}
            >
              AI Analysis
            </h4>
            <div
              className="rounded px-3 py-2 text-xs"
              style={{
                background: "rgba(148,163,184,0.06)",
                border: "1px solid rgba(148,163,184,0.12)",
              }}
            >
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--text-primary)" }}>Triage Tier:</strong>{" "}
                <span className="tabular-nums">{result.triage_tier.toUpperCase()}</span>{" "}
                · Risk Score:{" "}
                <span className="tabular-nums">{result.risk_score}/10</span>
              </p>
              {/* Replaced emoji ⚠️ with SVG icon (SKILL.md: no-emoji-icons) */}
              <p
                className="flex items-center gap-1.5 mt-2"
                style={{ color: "var(--text-tertiary)", fontSize: "10px" }}
              >
                <TriangleAlert className="h-3 w-3 shrink-0" aria-hidden="true" />
                Model output; human clinical review is mandatory. Use as decision support only.
              </p>
            </div>
          </section>

          {/* Clinical Rationale */}
          <section aria-labelledby="rationale-heading">
            <h4
              id="rationale-heading"
              className="text-xs font-semibold uppercase mb-2"
              style={{ color: tierColor }}
            >
              Clinical Rationale
            </h4>
            <p
              className="text-xs rounded px-3 py-2"
              style={{
                color: "var(--text-secondary)",
                background: "rgba(148,163,184,0.06)",
                border: "1px solid rgba(148,163,184,0.12)",
                lineHeight: 1.65,
              }}
            >
              {result.justification}
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
