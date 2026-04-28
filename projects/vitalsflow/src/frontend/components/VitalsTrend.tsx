"use client";

import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";

interface VitalsTrendProps {
  currentHR: number;
  currentSpO2: number;
  currentRR?: number;
  currentTemp?: number;
}

function generateTrend(
  currentHR: number,
  currentSpO2: number,
  currentRR: number,
  currentTemp: number
) {
  const labels = ["08:00", "10:00", "12:00", "14:00", "16:00", "Now"];
  const hrStart = Math.max(currentHR - 18, 40);
  const spo2Start = Math.min(currentSpO2 + 5, 100);
  const rrStart = Math.max(currentRR - 5, 8);
  const tempStart = currentTemp - 0.8;

  return labels.map((time, i) => {
    const pct = i / (labels.length - 1);
    const jitter = (Math.sin(i * 2.3) * 0.3 + Math.cos(i * 1.7) * 0.2);
    return {
      time,
      hr: Math.round(hrStart + (currentHR - hrStart) * pct + jitter * 3),
      spo2: parseFloat(
        (spo2Start - (spo2Start - currentSpO2) * pct + jitter * 0.3).toFixed(1)
      ),
      rr: Math.round(rrStart + (currentRR - rrStart) * pct + jitter),
      temp: parseFloat(
        (tempStart + (currentTemp - tempStart) * pct + jitter * 0.1).toFixed(1)
      ),
    };
  });
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg p-3 text-sm shadow-2xl tabular-nums"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        backdropFilter: "blur(12px)",
      }}
    >
      <p
        className="font-semibold mb-2"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </p>
      {payload.map((p) => {
        const unit =
          p.dataKey === "hr"
            ? "bpm"
            : p.dataKey === "spo2"
            ? "%"
            : p.dataKey === "rr"
            ? "/min"
            : "°C";
        return (
          <div
            key={p.name}
            className="flex items-center justify-between gap-4 py-0.5"
          >
            <span className="flex items-center gap-1.5" style={{ color: p.color }}>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: p.color }}
              />
              {p.name}
            </span>
            <span className="font-mono font-semibold" style={{ color: p.color }}>
              {p.value} {unit}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export function VitalsTrend({
  currentHR,
  currentSpO2,
  currentRR = 18,
  currentTemp = 37.0,
}: VitalsTrendProps) {
  const data = generateTrend(currentHR, currentSpO2, currentRR, currentTemp);

  return (
    <div className="glass-card overflow-hidden stagger-card" style={{ animationDelay: "300ms" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center"
            style={{ background: "var(--accent-blue-dim)" }}
            aria-hidden="true"
          >
            <TrendingUp className="h-4 w-4" style={{ color: "var(--accent-blue)" }} />
          </div>
          <h3
            className="text-sm font-semibold"
            style={{ fontFamily: "var(--font-outfit)", color: "var(--text-primary)" }}
          >
            Vitals Trend
          </h3>
        </div>
        <span
          className="text-[10px] px-2 py-1 tabular-nums font-medium"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-tertiary)",
          }}
        >
          8-hour window
        </span>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HR + SpO2 chart */}
        <section aria-label="Heart Rate and Oxygen Saturation Trends">
          <p
            className="mb-2 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Heart Rate &amp; SpO₂
          </p>
          <div role="img" aria-label={`Heart Rate trend ending at ${currentHR} bpm and Oxygen Saturation trend ending at ${currentSpO2}%`}>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="spo2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.1)" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={60} stroke="rgba(239,68,68,0.15)" strokeDasharray="4 3" />
                <ReferenceLine y={100} stroke="rgba(239,68,68,0.15)" strokeDasharray="4 3" />
                <Area
                  type="monotone"
                  dataKey="hr"
                  name="HR"
                  stroke="#ef4444"
                  fill="url(#hrGrad)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#ef4444" }}
                />
                <Area
                  type="monotone"
                  dataKey="spo2"
                  name="SpO₂"
                  stroke="#3b82f6"
                  fill="url(#spo2Grad)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#3b82f6" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
              Heart Rate (bpm)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
              SpO₂ (%)
            </span>
          </div>
        </section>

        {/* RR + Temp chart */}
        <section aria-label="Respiratory Rate and Temperature Trends">
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Resp. Rate &amp; Temperature
          </p>
          <div role="img" aria-label={`Respiratory Rate trend ending at ${currentRR} breaths per minute and Temperature trend ending at ${currentTemp} degrees Celsius`}>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.1)" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={20} stroke="rgba(20,184,166,0.15)" strokeDasharray="4 3" />
                <ReferenceLine y={38} stroke="rgba(245,158,11,0.15)" strokeDasharray="4 3" />
                <Line
                  type="monotone"
                  dataKey="rr"
                  name="Resp. Rate"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#14b8a6" }}
                />
                <Line
                  type="monotone"
                  dataKey="temp"
                  name="Temp"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#f59e0b" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: "#14b8a6" }} aria-hidden="true" />
              Resp. Rate (/min)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: "#f59e0b" }} aria-hidden="true" />
              Temp (°C)
            </span>
          </div>
        </section>
      </div>

      {/* Current snapshot row */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-0"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
        aria-label="Current vital signs snapshot"
      >
        {[
          { label: "Heart Rate", value: currentHR, unit: "bpm", color: "var(--color-critical-text)" },
          { label: "SpO₂", value: currentSpO2, unit: "%", color: "#3b82f6" },
          { label: "Resp. Rate", value: currentRR, unit: "/min", color: "#14b8a6" },
          { label: "Temperature", value: currentTemp, unit: "°C", color: "var(--color-urgent-text)" },
        ].map(({ label, value, unit, color }, i) => (
          <div
            key={label}
            className="flex flex-col items-center py-6 px-2"
            style={{
              borderRight: i % 4 !== 3 ? "1px solid var(--border-subtle)" : "none",
              borderBottom: i < 0 ? "1px solid var(--border-subtle)" : "none",
            }}
          >
            <span
              className="text-xl font-bold tabular-nums"
              style={{ color, fontFamily: "var(--font-outfit)" }}
            >
              {value}
            </span>
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              {unit}
            </span>
            <span className="mt-1 text-xs uppercase tracking-wider opacity-70" style={{ color: "var(--text-tertiary)" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
