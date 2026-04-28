"use client";

import { Thermometer, Zap, Loader2, Activity } from "lucide-react";
import type { VitalsPayload } from "@/lib/api";

interface VitalsFormProps {
  vitals: VitalsPayload;
  onChange: (vitals: VitalsPayload) => void;
  onSubmit: () => void;
  isLoading: boolean;
  patientName: string;
}

interface NumericField {
  key: keyof VitalsPayload;
  label: string;
  unit: string;
  hint: string;
  step?: number;
  min?: number;
  max?: number;
  warnLow?: number;
  warnHigh?: number;
}

const numericFields: NumericField[] = [
  {
    key: "heart_rate",
    label: "Heart Rate",
    unit: "bpm",
    hint: "60–100",
    step: 1,
    min: 20,
    max: 250,
    warnLow: 60,
    warnHigh: 100,
  },
  {
    key: "systolic_bp",
    label: "Systolic BP",
    unit: "mmHg",
    hint: "90–140",
    step: 1,
    min: 50,
    max: 250,
    warnLow: 90,
    warnHigh: 140,
  },
  {
    key: "diastolic_bp",
    label: "Diastolic BP",
    unit: "mmHg",
    hint: "60–90",
    step: 1,
    min: 30,
    max: 150,
    warnLow: 60,
    warnHigh: 90,
  },
  {
    key: "spo2",
    label: "SpO₂",
    unit: "%",
    hint: "≥ 96%",
    step: 0.1,
    min: 50,
    max: 100,
    warnLow: 96,
    warnHigh: 100,
  },
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    hint: "36.1–38.0",
    step: 0.1,
    min: 32,
    max: 42,
    warnLow: 36.1,
    warnHigh: 38.0,
  },
  {
    key: "respiratory_rate",
    label: "Resp. Rate",
    unit: "/min",
    hint: "12–20",
    step: 1,
    min: 4,
    max: 60,
    warnLow: 12,
    warnHigh: 20,
  },
];

function getFieldStatus(
  value: number,
  warnLow?: number,
  warnHigh?: number
): "normal" | "warn" | "critical" {
  if (warnLow === undefined || warnHigh === undefined) return "normal";
  if (value < warnLow * 0.85 || value > warnHigh * 1.15) return "critical";
  if (value < warnLow || value > warnHigh) return "warn";
  return "normal";
}

const statusColors = {
  normal: {
    border: "var(--border-default)",
    focus: "rgba(59,130,246,0.35)",
    text: "var(--text-tertiary)",
    label: "var(--text-secondary)",
  },
  warn: {
    border: "rgba(245, 158, 11, 0.4)",
    focus: "rgba(245,158,11,0.3)",
    text: "#f59e0b",
    label: "#fbbf24",
  },
  critical: {
    border: "rgba(239, 68, 68, 0.4)",
    focus: "rgba(239,68,68,0.25)",
    text: "#ef4444",
    label: "#f87171",
  },
};

export function VitalsForm({
  vitals,
  onChange,
  onSubmit,
  isLoading,
  patientName,
}: VitalsFormProps) {
  const update = <K extends keyof VitalsPayload>(
    key: K,
    value: VitalsPayload[K]
  ) => onChange({ ...vitals, [key]: value });

  const updateNumeric = <K extends keyof VitalsPayload>(key: K, rawValue: string) => {
    const parsed = Number.parseFloat(rawValue);
    if (Number.isNaN(parsed)) return;
    update(key, parsed as VitalsPayload[K]);
  };

  return (
    <div className="glass-card overflow-hidden stagger-card" style={{ animationDelay: "100ms" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center"
            style={{ background: "var(--accent-blue-dim)" }}
          >
            <Thermometer className="h-4 w-4" style={{ color: "var(--accent-blue)" }} />
          </div>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ fontFamily: "var(--font-outfit)", color: "var(--text-primary)" }}
            >
              Current Vitals
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {patientName}
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
          style={{
            background: "var(--accent-blue-dim)",
            border: "1px solid var(--accent-blue)/30",
            color: "var(--accent-blue)",
          }}
        >
          <Activity className="h-3 w-3" />
          NEWS2 Protocol
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* 6-column numeric grid - responsive */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {numericFields.map(({ key, label, unit, hint, step, min, max, warnLow, warnHigh }) => {
            const val = vitals[key] as number;
            const status = getFieldStatus(val, warnLow, warnHigh);
            const colors = statusColors[status];

            const hintId = `vital-${key}-hint`;
            const isInvalid = status === "critical" || status === "warn";
            return (
              <div key={key} className="flex flex-col gap-1">
                <label
                  className="text-xs font-medium"
                  style={{ color: colors.label }}
                  htmlFor={`vital-${key}`}
                >
                  {label}
                </label>
                <div className="relative">
                  <input
                    id={`vital-${key}`}
                    type="number"
                    inputMode="decimal"
                    step={step}
                    min={min}
                    max={max}
                    value={val}
                    aria-invalid={isInvalid ? true : undefined}
                    aria-describedby={hintId}
                    onChange={(e) => updateNumeric(key, e.target.value)}
                    className="w-full px-3 py-2 text-sm font-medium tabular-nums transition-all duration-200"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid " + colors.border,
                      color: "var(--text-primary)",
                      outline: "none",
                      fontFamily: "var(--font-inter)",
                      minHeight: "44px",
                      touchAction: "manipulation",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = "0 0 0 3px " + colors.focus;
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
                <p
                  id={hintId}
                  className="text-[11px]"
                  style={{ color: colors.text }}
                >
                  {unit} · {hint}
                  {isInvalid ? (status === "critical" ? " · Out of range" : " · Check value") : ""}
                </p>
              </div>
            );
          })}
        </div>

        {/* Consciousness + O2 row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-medium"
              style={{ color: "var(--text-secondary)" }}
              htmlFor="vital-consciousness"
            >
              Consciousness (ACVPU)
            </label>
            <select
              id="vital-consciousness"
              value={vitals.consciousness}
              onChange={(e) => update("consciousness", e.target.value)}
              aria-describedby="vital-consciousness-hint"
              className="px-3 py-2 text-sm transition-all duration-200"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
                outline: "none",
                fontFamily: "var(--font-inter)",
                minHeight: "44px",
                touchAction: "manipulation",
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.2)";
                e.currentTarget.style.borderColor = "var(--accent-blue)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "var(--border-default)";
              }}
            >
              {["alert", "voice", "pain", "unresponsive"].map((opt) => (
                <option key={opt} value={opt} style={{ background: "var(--bg-surface)" }}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  {opt === "alert" ? " (A)" : opt === "voice" ? " (V)" : opt === "pain" ? " (P)" : " (U)"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Supplemental O₂
            </span>
            <label
              className="clickable flex items-center gap-3 rounded-lg px-2.5 py-2"
              style={{
                background: vitals.on_supplemental_o2
                  ? "var(--accent-blue-dim)"
                  : "var(--bg-surface)",
                border: "1px solid " + (vitals.on_supplemental_o2 ? "var(--accent-blue)" : "var(--border-default)"),
                transition: "all 0.2s",
                minHeight: "44px",
              }}
            >
              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  id="vital-supplemental-o2"
                  checked={vitals.on_supplemental_o2}
                  onChange={(e) => update("on_supplemental_o2", e.target.checked)}
                  className="sr-only"
                />
                <div
                  className="h-5 w-9 rounded-full transition-colors duration-200"
                  style={{
                    background: vitals.on_supplemental_o2
                      ? "var(--accent-blue)"
                      : "var(--border-strong)",
                  }}
                />
                <div
                  className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
                  style={{
                    transform: vitals.on_supplemental_o2
                      ? "translateX(16px)"
                      : "translateX(0)",
                  }}
                />
              </div>
              <span
                className="select-none text-sm"
                style={{ color: vitals.on_supplemental_o2 ? "var(--accent-blue)" : "var(--text-secondary)" }}
              >
                {vitals.on_supplemental_o2 ? "Patient on O₂" : "Room air (off)"}
              </span>
            </label>
          </div>
        </div>

        {/* Submit button */}
        <button
          id="run-triage-btn"
          onClick={onSubmit}
          disabled={isLoading}
          className="btn-primary w-full py-3 text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running AI Triage…
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Run Triage
            </>
          )}
        </button>
      </div>
    </div>
  );
}
