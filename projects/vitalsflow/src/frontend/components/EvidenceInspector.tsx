"use client";

import { ChevronDown, ChevronUp, AlertCircle, Zap, Brain } from "lucide-react";
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

function assessVitalStatus(
  value: number,
  threshold: { low: number; high: number }
): "normal" | "warning" | "critical" {
  if (value < threshold.low) return "critical";
  if (value > threshold.high) return "critical";
  return "normal";
}

export function EvidenceInspector({ result, vitals }: EvidenceInspectorProps) {
  const [expanded, setExpanded] = useState(false);

  // Calculate NEWS2 scores for each component
  const componentScores = {
    respiratory_rate: NEWS2_THRESHOLDS.respiratory_rate.points(vitals.respiratory_rate),
    spo2: NEWS2_THRESHOLDS.oxygen_saturation.points(vitals.spo2),
    temperature: NEWS2_THRESHOLDS.temperature.points(vitals.temperature),
    systolic_bp: NEWS2_THRESHOLDS.systolic_bp.points(vitals.systolic_bp),
    heart_rate: NEWS2_THRESHOLDS.heart_rate.points(vitals.heart_rate),
  };

  const breachedVitals = [
    {
      name: "Respiratory Rate",
      value: vitals.respiratory_rate,
      unit: "/min",
      threshold: NEWS2_THRESHOLDS.respiratory_rate,
      score: componentScores.respiratory_rate,
    },
    {
      name: "SpO2",
      value: vitals.spo2,
      unit: "%",
      threshold: NEWS2_THRESHOLDS.oxygen_saturation,
      score: componentScores.spo2,
    },
    {
      name: "Temperature",
      value: vitals.temperature,
      unit: "°C",
      threshold: NEWS2_THRESHOLDS.temperature,
      score: componentScores.temperature,
    },
    {
      name: "Systolic BP",
      value: vitals.systolic_bp,
      unit: "mmHg",
      threshold: NEWS2_THRESHOLDS.systolic_bp,
      score: componentScores.systolic_bp,
    },
    {
      name: "Heart Rate",
      value: vitals.heart_rate,
      unit: "bpm",
      threshold: NEWS2_THRESHOLDS.heart_rate,
      score: componentScores.heart_rate,
    },
  ].filter((v) => v.score > 0);

  const tierColor =
    result.triage_tier === "critical"
      ? "#ef4444"
      : result.triage_tier === "urgent"
      ? "#f59e0b"
      : result.triage_tier === "routine"
      ? "#22c55e"
      : "#3b82f6";

  const tierBg =
    result.triage_tier === "critical"
      ? "rgba(239, 68, 68, 0.06)"
      : result.triage_tier === "urgent"
      ? "rgba(245, 158, 11, 0.06)"
      : result.triage_tier === "routine"
      ? "rgba(34, 197, 94, 0.06)"
      : "rgba(59, 130, 246, 0.06)";

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        background: tierBg,
        border: `1px solid ${tierColor}`,
        opacity: 0.95,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:opacity-90 transition-opacity"
        style={{ background: tierBg }}
      >
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5" style={{ color: tierColor }} />
          <span className="font-semibold text-sm" style={{ color: tierColor }}>
            Evidence & Scoring
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4" style={{ color: tierColor }} />
        ) : (
          <ChevronDown className="h-4 w-4" style={{ color: tierColor }} />
        )}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div
          className="border-t px-4 py-4 space-y-4"
          style={{
            borderColor: tierColor,
            opacity: 0.95,
          }}
        >
          {/* Why This Risk? */}
          <div>
            <h4 className="text-xs font-semibold uppercase mb-3" style={{ color: tierColor }}>
              Why This Risk?
            </h4>
            {breachedVitals.length > 0 ? (
              <div className="space-y-2">
                {breachedVitals.map((vital) => (
                  <div
                    key={vital.name}
                    className="flex items-start gap-2 rounded px-2.5 py-2 text-xs"
                    style={{
                      background: `${tierColor}08`,
                      borderLeft: `2px solid ${tierColor}`,
                    }}
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: tierColor }} />
                    <span style={{ color: "var(--text-secondary)" }}>
                      <strong style={{ color: "var(--text-primary)" }}>
                        {vital.name}: {vital.value.toFixed(1)}
                      </strong>{" "}
                      {vital.unit} (normal: {vital.threshold.low}–{vital.threshold.high}) — +
                      {vital.score} NEWS2 point{vital.score !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                All vitals within expected range. Risk driven by combination factors.
              </p>
            )}
          </div>

          {/* Scoring Breakdown */}
          <div>
            <h4 className="text-xs font-semibold uppercase mb-3" style={{ color: tierColor }}>
              NEWS2 Breakdown
            </h4>
            <div className="space-y-1">
              {Object.entries(componentScores).map(([key, points]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--text-secondary)" }}>
                    {key === "respiratory_rate"
                      ? "Respiratory Rate"
                      : key === "spo2"
                      ? "SpO2"
                      : key === "systolic_bp"
                      ? "Systolic BP"
                      : key === "heart_rate"
                      ? "Heart Rate"
                      : "Temperature"}
                  </span>
                  <span
                    className="font-semibold px-2 py-0.5 rounded"
                    style={{
                      background: points > 0 ? `${tierColor}20` : "rgba(34, 197, 94, 0.15)",
                      color: points > 0 ? tierColor : "#4ade80",
                    }}
                  >
                    {points} pt{points !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
              <div
                className="flex items-center justify-between text-xs border-t pt-2 mt-2"
                style={{ borderColor: "rgba(148, 163, 184, 0.1)" }}
              >
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  Total NEWS2
                </span>
                <span
                  className="font-bold px-2 py-0.5 rounded"
                  style={{
                    background: `${tierColor}25`,
                    color: tierColor,
                  }}
                >
                  {result.news2_score}
                </span>
              </div>
            </div>
          </div>

          {/* AI Confidence */}
          <div>
            <h4 className="text-xs font-semibold uppercase mb-3" style={{ color: tierColor }}>
              AI Analysis
            </h4>
            <div
              className="rounded px-3 py-2 text-xs"
              style={{
                background: "rgba(148, 163, 184, 0.05)",
                border: "1px solid rgba(148, 163, 184, 0.1)",
              }}
            >
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--text-primary)" }}>Triage Tier:</strong> {result.triage_tier.toUpperCase()} · Risk Score: {result.risk_score}/10
              </p>
              <p style={{ color: "var(--text-tertiary)", fontSize: "10px", marginTop: "6px" }}>
                ⚠️ Model output; human clinical review is mandatory. Use as decision support only.
              </p>
            </div>
          </div>

          {/* Justification */}
          <div>
            <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: tierColor }}>
              Clinical Rationale
            </h4>
            <p
              className="text-xs rounded px-3 py-2"
              style={{
                color: "var(--text-secondary)",
                background: "rgba(148, 163, 184, 0.05)",
                border: "1px solid rgba(148, 163, 184, 0.1)",
                lineHeight: 1.6,
              }}
            >
              {result.justification}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
