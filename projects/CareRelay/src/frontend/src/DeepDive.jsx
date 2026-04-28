import React, { useState, useMemo, useCallback, useRef } from "react";
import "./deepDiveStyles.css";

/* ═══════════════════════════════════════════════════════════
   Constants & Config
   ═══════════════════════════════════════════════════════════ */

const SPEC_COLORS = {
  cardio: "#3d8ef0",
  endo: "#22c48a",
  nephro: "#d85a30",
  default: "#6b7a90",
};

const CONDITION_SPEC_RE = {
  cardio: /hypertension|heart|cardiac|coronary|ischemic|angina|atrial|aortic|myocardial/i,
  endo: /diabetes|prediabetes|metabolic|obesity|hyperglycemia|neuropathy/i,
  nephro: /kidney|renal|proteinuria|microalbuminuria|nephro|transplant|end.stage/i,
};

const MED_SPEC_RE = {
  cardio: /amlodipine|lisinopril|atenolol|carvedilol|losartan|valsartan|aspirin|clopidogrel|warfarin|nitroglycerin|simvastatin|atorvastatin|rosuvastatin|hydrochlorothiazide|metoprolol|captopril|enalapril|diltiazem|nifedipine/i,
  endo: /metformin|insulin|glipizide|sitagliptin|empagliflozin|semaglutide|pioglitazone|glyburide|liraglutide|canagliflozin|dapagliflozin|saxagliptin|exenatide/i,
  nephro: /tacrolimus|cyclosporine|mycophenolate/i,
};

const LAB_CONFIG = {
  hba1c:          { name: "HbA1c %",       color: "#22c48a", specs: ["endo",   "all"] },
  ldl:            { name: "LDL mg/dL",     color: "#9b7de8", specs: ["cardio", "all"] },
  egfr:           { name: "eGFR",          color: "#d85a30", specs: ["nephro", "all"] },
  blood_pressure: { name: "Systolic BP",   color: "#e26c9a", specs: ["cardio", "all"] },
  weight:         { name: "Weight",        color: "#6b7a90", specs: ["endo",   "all"] },
  glucose:        { name: "Glucose mg/dL", color: "#f0922a", specs: ["endo",   "all"] },
  triglycerides:  { name: "Triglycerides", color: "#9b7de8", specs: ["cardio", "all"] },
};

const SPEC_LAB_PRESETS = {
  all:    ["hba1c"],
  cardio: ["ldl", "blood_pressure"],
  endo:   ["hba1c", "weight"],
  nephro: ["egfr", "blood_pressure"],
};

const SPEC_HEADINGS = {
  all:    "Patient timeline",
  cardio: "Cardiology view · lipids, BP, cardiac medications",
  endo:   "Endocrinology view · diabetes control & weight",
  nephro: "Nephrology view · renal function & BP",
};

const SPECS = [
  { id: "all",    label: "All specialties" },
  { id: "cardio", label: "Cardiology" },
  { id: "endo",   label: "Endocrinology" },
  { id: "nephro", label: "Nephrology" },
];

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */

function dateToYear(s) {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d)) return null;
  return d.getFullYear() + d.getMonth() / 12 + d.getDate() / 365;
}

function yearToLabel(y) {
  const yr = Math.floor(y);
  const mo = Math.round((y - yr) * 12);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[Math.min(11, Math.max(0, mo))]} ${yr}`;
}

function formatDate(s) {
  if (!s) return "";
  const d = new Date(s);
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

function initials(name) {
  return (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();
}

function inferSpecs(name) {
  const s = [];
  for (const [spec, re] of Object.entries(CONDITION_SPEC_RE)) {
    if (re.test(name || "")) s.push(spec);
  }
  return s;
}

function inferMedSpecs(name) {
  const s = [];
  for (const [spec, re] of Object.entries(MED_SPEC_RE)) {
    if (re.test(name || "")) s.push(spec);
  }
  return s;
}

function specColor(specs) {
  for (const s of specs) {
    if (SPEC_COLORS[s]) return SPEC_COLORS[s];
  }
  return SPEC_COLORS.default;
}

function compactName(name) {
  return (name || "")
    .replace(/ \(finding\)/gi, "")
    .replace(/ \(disorder\)/gi, "")
    .replace(/ \(situation\)/gi, "")
    .replace(/24 HR /gi, "")
    .replace(/Extended Release /gi, "")
    .replace(/ Oral Tablet/gi, "")
    .replace(/ Injectable Suspension/gi, "")
    .replace(/\s*\[.*?\]/g, "")
    .replace(/\s*\{.*?\}/g, "")
    .replace(/\s+\d+(\.\d+)?\s*(MG|MCG|UNT|ML|%)\s*/gi, " ")
    .trim();
}

function inferEncounterSpec(type) {
  const t = (type || "").toLowerCase();
  if (/cardio|heart|chest pain|hypertension/.test(t)) return "cardio";
  if (/diabetes|endocrin|metabolic|glucose/.test(t)) return "endo";
  if (/kidney|renal|nephro|dialysis/.test(t)) return "nephro";
  return "pcp";
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* ═══════════════════════════════════════════════════════════
   Data Transformation
   ═══════════════════════════════════════════════════════════ */

function useTimelineData(data) {
  return useMemo(() => {
    if (!data) return null;

    const nowYear = new Date().getFullYear() + new Date().getMonth() / 12;

    // ── Diagnoses ──
    const diagnoses = (data.conditions || [])
      .filter(c => c.onsetDate)
      .map(c => {
        const sp = inferSpecs(c.name);
        return {
          name: compactName(c.name),
          startYear: dateToYear(c.onsetDate),
          endYear: c.status === "resolved" ? dateToYear(c.onsetDate) + 2 : nowYear + 0.5,
          color: specColor(sp),
          specs: sp,
          priority: c.clinicalPriority,
        };
      })
      .sort((a, b) => (b.priority ? 1 : 0) - (a.priority ? 1 : 0) || a.startYear - b.startYear)
      .slice(0, 10);

    // ── Medications ──
    const medications = (data.medications || [])
      .filter(m => m.authoredOn)
      .map(m => {
        const sp = inferMedSpecs(m.name);
        const disc = m.status === "stopped" || m.status === "completed";
        return {
          name: compactName(m.name),
          startYear: dateToYear(m.authoredOn),
          endYear: disc ? dateToYear(m.authoredOn) + 2 : nowYear + 0.5,
          color: specColor(sp),
          specs: sp,
          discontinued: disc,
        };
      })
      .sort((a, b) => a.startYear - b.startYear)
      .slice(0, 14);

    // ── Labs ──
    const labData = {};
    for (const [key, cfg] of Object.entries(LAB_CONFIG)) {
      const trend = data.trends?.[key];
      if (!trend || trend.length < 2) continue;
      const points = trend
        .map(p => {
          const yr = dateToYear(p.date);
          let val = p.value;
          if (typeof val === "object" && val !== null) val = val.systolic ?? val.diastolic;
          if (yr == null || val == null) return null;
          return [yr, typeof val === "number" ? Math.round(val * 100) / 100 : val];
        })
        .filter(Boolean);
      if (points.length < 2) continue;
      const vals = points.map(p => p[1]);
      const lo = Math.floor(Math.min(...vals) * 0.85);
      const hi = Math.ceil(Math.max(...vals) * 1.15);
      labData[key] = { ...cfg, data: points, range: [lo, hi] };
    }

    // ── Events (significant encounters) ──
    const eventKeywords = /emergency|hospitalization|urgentcare|hospital|admission|inpatient|surgery/i;
    const events = (data.encounters || [])
      .filter(e => eventKeywords.test(e.type || "") || eventKeywords.test(e.provider || ""))
      .map(e => ({
        year: dateToYear(e.date),
        label: compactName(e.type).slice(0, 18),
        color: "#e05656",
        detail: `${e.type || "Encounter"} · ${e.provider || ""}`,
      }))
      .filter(e => e.year)
      .slice(0, 6);

    // ── Encounters ──
    const encounters = (data.encounters || [])
      .filter(e => e.date)
      .map(e => ({
        date: formatDate(e.date),
        year: dateToYear(e.date),
        spec: inferEncounterSpec(e.type),
        specLabel: inferEncounterSpec(e.type).toUpperCase() === "PCP" ? "PCP" :
                   inferEncounterSpec(e.type).charAt(0).toUpperCase() + inferEncounterSpec(e.type).slice(1),
        text: `${compactName(e.type)} · ${e.provider || "Provider not listed"}`,
      }))
      .sort((a, b) => (b.year || 0) - (a.year || 0))
      .slice(0, 30);

    // ── Year range ──
    const yearMin = 2013;
    const yearMax = 2022;

    return { diagnoses, medications, labData, events, encounters, yearMin, yearMax };
  }, [data]);
}

function useInsights(data, tld) {
  return useMemo(() => {
    if (!data || !tld) return [];
    const insights = [];
    const trends = data.trends || {};

    // Analyze each numeric trend
    const trendAnalysis = [
      { key: "hba1c", label: "HbA1c", unit: "%", goodDir: "down", specs: ["endo", "all"] },
      { key: "ldl", label: "LDL", unit: "mg/dL", goodDir: "down", specs: ["cardio", "all"] },
      { key: "egfr", label: "eGFR", unit: "", goodDir: "up", specs: ["nephro", "all"] },
      { key: "weight", label: "Weight", unit: "", goodDir: "down", specs: ["endo", "all"] },
    ];

    for (const ta of trendAnalysis) {
      const labDat = tld.labData[ta.key];
      if (!labDat || labDat.data.length < 3) continue;
      const pts = labDat.data;
      const first = pts[0][1];
      const last = pts[pts.length - 1][1];
      const years = Math.round(pts[pts.length - 1][0] - pts[0][0]);
      const change = last - first;
      const pct = Math.abs(change / first * 100).toFixed(0);

      if (ta.goodDir === "down" && change < 0 && pct > 5) {
        insights.push({
          tag: "outcome", kind: "good",
          text: `${ta.label} improved from ${first}${ta.unit} → ${last}${ta.unit} over ${years} years (↓${pct}%).`,
          specs: ta.specs,
        });
      } else if (ta.goodDir === "down" && change > 0 && pct > 10) {
        insights.push({
          tag: "caution", kind: "warn",
          text: `${ta.label} increased from ${first}${ta.unit} → ${last}${ta.unit} — review management.`,
          specs: ta.specs,
        });
      } else if (ta.goodDir === "up" && change > 0 && pct > 5) {
        insights.push({
          tag: "outcome", kind: "good",
          text: `${ta.label} improved from ${first} → ${last} over ${years} years (↑${pct}%).`,
          specs: ta.specs,
        });
      } else if (ta.goodDir === "up" && change < 0 && pct > 10) {
        insights.push({
          tag: "caution", kind: "warn",
          text: `${ta.label} declined from ${first} → ${last} — monitor closely.`,
          specs: ta.specs,
        });
      }
    }

    // Blood pressure trend
    const bpTrend = trends.blood_pressure;
    if (bpTrend && bpTrend.length >= 3) {
      const firstBP = bpTrend[0].value;
      const lastBP = bpTrend[bpTrend.length - 1].value;
      if (firstBP?.systolic && lastBP?.systolic) {
        const sysDiff = lastBP.systolic - firstBP.systolic;
        if (sysDiff < -10) {
          insights.push({
            tag: "outcome", kind: "good",
            text: `Systolic BP improved from ${firstBP.systolic}/${firstBP.diastolic} → ${lastBP.systolic}/${lastBP.diastolic} mmHg.`,
            specs: ["cardio", "all"],
          });
        } else if (sysDiff > 15) {
          insights.push({
            tag: "caution", kind: "warn",
            text: `Systolic BP trending up: ${firstBP.systolic} → ${lastBP.systolic} mmHg — review antihypertensive regimen.`,
            specs: ["cardio", "all"],
          });
        }
      }
    }

    // Polypharmacy
    const medCount = (data.medications || []).length;
    if (medCount > 10) {
      insights.push({
        tag: "safety", kind: "warn",
        text: `Patient is on ${medCount} medications — consider polypharmacy review.`,
        specs: ["all"],
      });
    }

    // Allergy note
    const allergies = data.snapshot?.allergies || [];
    if (allergies.length > 0) {
      insights.push({
        tag: "safety", kind: "warn",
        text: `${allergies.length} allerg${allergies.length > 1 ? "ies" : "y"} on file: ${allergies.map(a => compactName(a.name)).join(", ")}. Verify before prescribing.`,
        specs: ["all"],
      });
    }

    // Care duration
    const encounters = data.encounters || [];
    if (encounters.length > 2) {
      const dates = encounters.map(e => dateToYear(e.date)).filter(Boolean);
      const span = Math.round(Math.max(...dates) - Math.min(...dates));
      if (span > 0) {
        insights.push({
          tag: "maintenance", kind: "normal",
          text: `${span} years of longitudinal care documented · ${encounters.length} encounters on record · ${(data.conditions || []).length} conditions tracked.`,
          specs: ["all"],
        });
      }
    }

    return insights;
  }, [data, tld]);
}

/* ═══════════════════════════════════════════════════════════
   SVG Timeline geometry
   ═══════════════════════════════════════════════════════════ */

const VB_W = 700;
const TL_X0 = 58;
const TL_X1 = 688;
const EVENTS_Y = 30;
const DX_START = 65;
const DX_ROW = 10;
const MED_GAP = 15;
const MED_ROW = 8;
const LAB_GAP = 15;
const LAB_H = 80;

function buildLayout(dxCount, medCount) {
  const dxEnd = DX_START + dxCount * DX_ROW;
  const medStart = dxEnd + MED_GAP;
  const medEnd = medStart + medCount * MED_ROW;
  const labStart = medEnd + LAB_GAP;
  const labEnd = labStart + LAB_H;
  const totalH = labEnd + 30;
  return { dxEnd, medStart, medEnd, labStart, labEnd, totalH };
}

/* ═══════════════════════════════════════════════════════════
   Components
   ═══════════════════════════════════════════════════════════ */

function DeepDiveHeader({ data }) {
  const p = data.patient || {};
  const m = data.snapshot?.latestMetrics || {};
  const allergies = data.snapshot?.allergies || [];
  const conditions = data.snapshot?.activeConditions || [];
  const statusLine = data.snapshot?.aiStatusLine || "";

  // Compute care duration
  const encounters = data.encounters || [];
  const years = encounters.map(e => dateToYear(e.date)).filter(Boolean);
  const careDuration = years.length > 1 ? Math.round(Math.max(...years) - Math.min(...years)) : 0;

  const vitals = [
    { key: "hba1c",          label: "HbA1c" },
    { key: "blood_pressure", label: "BP" },
    { key: "ldl",            label: "LDL mg/dL" },
    { key: "egfr",           label: "eGFR" },
    { key: "weight",         label: "Weight" },
  ];

  return (
    <div className="dd-header">
      <div className="dd-id-row">
        <div className="dd-patient-identity">
          <div className="dd-avatar">{initials(p.name)}</div>
          <div>
            <div className="dd-name">
              {p.name} <span className="dd-demo">· {p.gender?.[0]?.toUpperCase()} · {p.age} · MRN {p.mrn}</span>
            </div>
            <div className="dd-meta">
              {p.address && <span className="dd-meta-item">{p.address}</span>}
              {careDuration > 0 && <span className="dd-meta-item">{careDuration} yr care</span>}
            </div>
          </div>
        </div>
        {allergies.length > 0 && (
          <div className="dd-allergy-block">
            <span className="dd-allergy-label">⚠ Allergies</span>
            {allergies.map(a => (
              <span className="dd-allergy-pill" key={a.name}>{compactName(a.name)}</span>
            ))}
          </div>
        )}
      </div>

      <div className="dd-vitals-strip">
        {vitals.map(v => {
          const metric = m[v.key];
          if (!metric) return null;
          return (
            <div className="dd-vital-item" key={v.key}>
              <div className="dd-vital-value good">{metric.displayValue}</div>
              <div className="dd-vital-label">{v.label}</div>
            </div>
          );
        })}
        {careDuration > 0 && (
          <div className="dd-vital-item">
            <div className="dd-vital-value">{careDuration} yr</div>
            <div className="dd-vital-label">Care duration</div>
          </div>
        )}
      </div>

      <div className="dd-summary">
        <div className="dd-summary-header">
          <div className="dd-summary-label">Clinical state at a glance</div>
          <span className="dd-status-badge">✓ Snapshot</span>
        </div>
        {statusLine}
        <div className="dd-problem-chips">
          {conditions.slice(0, 6).map(c => (
            <span className={`dd-chip ${c.clinicalPriority ? "dd-chip-active" : "dd-chip-stable"}`} key={c.name}>
              {compactName(c.name)}
            </span>
          ))}
          {conditions.length > 6 && (
            <span className="dd-chip dd-chip-stable">+{conditions.length - 6} more</span>
          )}
        </div>
      </div>
    </div>
  );
}

function SpecialtyBar({ active, onChange }) {
  return (
    <div className="dd-specialty-bar">
      {SPECS.map(s => (
        <button
          key={s.id}
          className={`dd-spec-btn ${active === s.id ? "active" : ""}`}
          onClick={() => onChange(s.id)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function InteractiveTimeline({ tld, activeSpec, visibleLabs, onLabToggle, hoverYear, onHoverChange }) {
  const svgRef = useRef(null);

  const { diagnoses, medications, labData, events, yearMin, yearMax } = tld;

  // Filter by specialty
  const visDx = activeSpec === "all" ? diagnoses : diagnoses.filter(d => d.specs.includes(activeSpec));
  const visMed = activeSpec === "all" ? medications : medications.filter(m => m.specs.includes(activeSpec));
  const showDx = visDx.length ? visDx : diagnoses.slice(0, 5);
  const showMed = visMed.length ? visMed : medications.slice(0, 8);

  const layout = buildLayout(showDx.length, showMed.length);
  const vbH = layout.totalH;

  function dx(yr) { return TL_X0 + (yr - yearMin) / (yearMax - yearMin) * (TL_X1 - TL_X0); }

  // Generate year ticks
  const yearTicks = [];
  const step = yearMax - yearMin > 15 ? 4 : yearMax - yearMin > 8 ? 2 : 1;
  for (let y = Math.ceil(yearMin / step) * step; y <= yearMax; y += step) yearTicks.push(y);

  // Lab rendering helper
  function labNorm(key, v) {
    const lab = labData[key];
    if (!lab) return layout.labEnd;
    const [lo, hi] = lab.range;
    return layout.labEnd - (v - lo) / (hi - lo) * LAB_H;
  }

  // Mouse handling
  const handleMouseMove = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (VB_W / rect.width);
    if (px < TL_X0 || px > TL_X1) return;
    const yr = yearMin + (px - TL_X0) / (TL_X1 - TL_X0) * (yearMax - yearMin);
    onHoverChange(yr, e.clientX - rect.left);
  }, [yearMin, yearMax, onHoverChange]);

  const handleMouseLeave = useCallback(() => {
    onHoverChange(null, 0);
  }, [onHoverChange]);

  // Scrub X position
  const scrubX = hoverYear != null ? dx(hoverYear) : 0;

  return (
    <div className="dd-timeline-card">
      <div className="dd-tl-header">
        <div className="dd-tl-title">{SPEC_HEADINGS[activeSpec]} · {yearMin} – {Math.floor(yearMax)}</div>
        <span className="dd-tl-hint">Hover to scrub · panels below sync to cursor</span>
      </div>
      <div className="dd-tl-svg-wrap">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${vbH}`}
          width="100%"
          style={{ display: "block" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Grid — zebra bands */}
          {yearTicks.filter((_, i) => i % 2 === 0).map(y => {
            const x1 = dx(y);
            const x2 = dx(y + step);
            return <rect key={`z-${y}`} x={x1} y={18} width={Math.max(0, x2 - x1)} height={layout.labEnd - 18} fill="rgba(255,255,255,0.012)" />;
          })}

          {/* Grid — year lines + labels */}
          {yearTicks.map(y => (
            <g key={`yl-${y}`}>
              <line x1={dx(y)} y1={18} x2={dx(y)} y2={layout.labEnd} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={dx(y)} y={layout.labEnd + 16} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.3)" fontFamily="IBM Plex Mono, monospace">{y}</text>
            </g>
          ))}

          {/* Lane labels */}
          <text x={4} y={EVENTS_Y} fontSize="9.5" fill="rgba(255,255,255,0.25)" fontFamily="Syne, sans-serif" fontWeight="600">Events</text>
          <text x={4} y={DX_START + 13} fontSize="9.5" fill="rgba(255,255,255,0.25)" fontFamily="Syne, sans-serif" fontWeight="600">Diagnoses</text>
          <line x1={TL_X0} y1={DX_START - 8} x2={TL_X1} y2={DX_START - 8} stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" strokeDasharray="3 4" />
          <text x={4} y={layout.medStart + 12} fontSize="9.5" fill="rgba(255,255,255,0.25)" fontFamily="Syne, sans-serif" fontWeight="600">Medications</text>
          <line x1={TL_X0} y1={layout.medStart - 8} x2={TL_X1} y2={layout.medStart - 8} stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" strokeDasharray="3 4" />
          <text x={4} y={layout.labStart + 5} fontSize="9.5" fill="rgba(255,255,255,0.25)" fontFamily="Syne, sans-serif" fontWeight="600">Labs</text>
          <line x1={TL_X0} y1={layout.labStart - 8} x2={TL_X1} y2={layout.labStart - 8} stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" strokeDasharray="3 4" />

          {/* Events */}
          {events.map((e, i) => (
            <g key={`ev-${i}`}>
              <circle cx={dx(e.year)} cy={EVENTS_Y} r={8} fill={e.color} opacity={0.12} />
              <circle cx={dx(e.year)} cy={EVENTS_Y} r={5} fill={e.color} />
              <text x={dx(e.year)} y={EVENTS_Y + 18} textAnchor="middle" fontSize="8.5" fill={e.color} fontFamily="DM Sans, sans-serif" fontWeight="500" opacity="0.9">{e.label}</text>
            </g>
          ))}

          {/* Diagnoses */}
          {showDx.map((d, i) => {
            const x = dx(Math.max(d.startYear, yearMin));
            const w = dx(Math.min(d.endYear, yearMax)) - x;
            const y = DX_START + i * DX_ROW;
            return (
              <g key={`dx-${i}`}>
                <rect x={TL_X0} y={y} width={TL_X1 - TL_X0} height={7} fill="rgba(255,255,255,0.02)" rx={3} />
                <rect x={x} y={y} width={Math.max(0, w)} height={7} fill={d.color} opacity={0.8} rx={3} />
                <text x={x + 5} y={y + 5.5} fontSize="7.5" fill="rgba(255,255,255,0.92)" fontFamily="DM Sans, sans-serif" fontWeight="500">{d.name}</text>
              </g>
            );
          })}

          {/* Medications */}
          {showMed.map((m, i) => {
            const x = dx(Math.max(m.startYear, yearMin));
            const w = dx(Math.min(m.endYear, yearMax)) - x;
            const y = layout.medStart + i * MED_ROW;
            return (
              <g key={`med-${i}`}>
                <rect x={x} y={y} width={Math.max(0, w)} height={6} fill={m.color} opacity={m.discontinued ? 0.28 : 0.75} rx={2} />
                <text x={x + 4} y={y + 4.5} fontSize="7" fill="rgba(255,255,255,0.88)" fontFamily="DM Sans, sans-serif" fontWeight="500">
                  {m.name}{m.discontinued ? " (d/c)" : ""}
                </text>
              </g>
            );
          })}

          {/* Labs */}
          <rect x={TL_X0} y={layout.labStart - 4} width={TL_X1 - TL_X0} height={LAB_H + 8} fill="rgba(255,255,255,0.015)" rx={3} />
          {visibleLabs.map(key => {
            const lab = labData[key];
            if (!lab) return null;
            const pts = lab.data.map(([yr, v]) => [dx(yr), labNorm(key, v)]);
            const linePoints = pts.map(p => `${p[0]},${p[1]}`).join(" ");
            const first = pts[0];
            const last = pts[pts.length - 1];
            const areaPoints = `${first[0]},${layout.labEnd} ${linePoints} ${last[0]},${layout.labEnd}`;
            return (
              <g key={`lab-${key}`}>
                <polygon points={areaPoints} fill={lab.color} opacity={0.06} />
                <polyline points={linePoints} fill="none" stroke={lab.color} strokeWidth={1.8} opacity={0.95} strokeLinejoin="round" strokeLinecap="round" />
                {pts.map(([cx, cy], j) => (
                  <circle key={j} cx={cx} cy={cy} r={2.2} fill={lab.color} />
                ))}
                <text x={last[0] + 5} y={last[1] + 3.5} fontSize="9" fill={lab.color} fontFamily="IBM Plex Mono, monospace" fontWeight="500">
                  {lab.name} {lab.data[lab.data.length - 1][1]}
                </text>
              </g>
            );
          })}

          {/* Scrub line */}
          {hoverYear != null && (
            <line x1={scrubX} y1={18} x2={scrubX} y2={layout.labEnd} stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3 3" />
          )}
        </svg>

        {/* Tooltip */}
        <TimelineTooltip
          hoverYear={hoverYear}
          tld={tld}
          visibleLabs={visibleLabs}
          labData={labData}
        />
      </div>

      {/* Lab toggles */}
      <div className="dd-lab-toggles">
        <span className="dd-lab-toggles-label">Labs</span>
        {Object.entries(labData).map(([key, lab]) => {
          const on = visibleLabs.includes(key);
          return (
            <button
              key={key}
              className={`dd-lab-toggle ${on ? "on" : ""}`}
              style={on ? { backgroundColor: lab.color, boxShadow: `0 0 10px ${lab.color}40` } : {}}
              onClick={() => onLabToggle(key)}
            >
              {lab.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimelineTooltip({ hoverYear, tld, visibleLabs, labData }) {
  if (hoverYear == null) return null;

  const activeDx = tld.diagnoses.filter(d => hoverYear >= d.startYear && hoverYear <= d.endYear).map(d => d.name);
  const activeMeds = tld.medications.filter(m => hoverYear >= m.startYear && hoverYear <= m.endYear).map(m => m.name);

  // Find nearest lab values
  const labValues = visibleLabs.map(key => {
    const lab = labData[key];
    if (!lab) return null;
    let best = null, bestDiff = Infinity;
    lab.data.forEach(([yr, v]) => {
      const diff = Math.abs(yr - hoverYear);
      if (diff < bestDiff) { bestDiff = diff; best = { yr, v }; }
    });
    return best ? { name: lab.name, color: lab.color, value: best.v, year: best.yr } : null;
  }).filter(Boolean);

  return (
    <div className="dd-tooltip visible" style={{ left: "50%", top: "8px", transform: "translateX(-50%)" }}>
      <span className="dd-tooltip-date">{yearToLabel(hoverYear)}</span>
      {labValues.length > 0 && (
        <div className="dd-tooltip-section">
          {labValues.map(l => (
            <div className="dd-tooltip-lab-row" key={l.name}>
              <span style={{ color: l.color, fontSize: "10px" }}>●</span>
              <strong>{l.name}</strong>
              <span className="lval">{l.value}</span>
              <span className="ldate">({yearToLabel(l.year)})</span>
            </div>
          ))}
        </div>
      )}
      <div className="dd-tooltip-section">
        <strong>Active Dx:</strong><br />
        <span style={{ color: "var(--dd-text-secondary)" }}>{activeDx.join(", ") || "—"}</span>
      </div>
      <div className="dd-tooltip-section">
        <strong>On meds:</strong><br />
        <span style={{ color: "var(--dd-text-secondary)" }}>{activeMeds.join(", ") || "—"}</span>
      </div>
    </div>
  );
}

function PatternDetection({ insights, activeSpec }) {
  const filtered = activeSpec === "all"
    ? insights
    : insights.filter(i => i.specs.includes(activeSpec) || i.specs.includes("all"));

  return (
    <div className="dd-panel">
      <div className="dd-panel-header">
        <h3>Pattern detection</h3>
        <span className="dd-panel-count">{filtered.length} notes</span>
      </div>
      {filtered.map((ins, i) => (
        <div key={i} className={`dd-insight ${ins.kind}`}>
          <span className="dd-insight-tag">{ins.tag}</span>
          <div className="dd-insight-text">{ins.text}</div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div style={{ color: "var(--dd-text-tertiary)", fontSize: "12px" }}>No insights available for this view.</div>
      )}
    </div>
  );
}

function EncountersPanel({ encounters, hoverYear }) {
  let list = encounters;
  let label = "Showing all encounters · hover timeline to filter";

  if (hoverYear != null) {
    list = encounters.filter(e => e.year && Math.abs(e.year - hoverYear) <= 0.6);
    label = list.length
      ? `Within ±7 mo of ${yearToLabel(hoverYear)}`
      : `No encounters within ±7 mo of ${yearToLabel(hoverYear)}`;
  }

  return (
    <div className="dd-panel">
      <div className="dd-panel-header">
        <h3>Encounters at cursor</h3>
        <span className="dd-panel-count">{list.length} records</span>
      </div>
      <div className="dd-enc-window-label">{label}</div>
      <div className="dd-encounters-list">
        {list.map((e, i) => (
          <div className="dd-encounter-row" key={i}>
            <span className="dd-enc-date">{e.date}</span>
            <span className={`dd-enc-spec-badge ${e.spec}`}>{e.specLabel}</span>
            <span className="dd-enc-text">{e.text}</span>
          </div>
        ))}
        {list.length === 0 && (
          <div style={{ color: "var(--dd-text-tertiary)", fontSize: "12px", padding: "8px 0" }}>
            No encounters in this window.
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Deep Dive Component
   ═══════════════════════════════════════════════════════════ */

export default function DeepDive({ data }) {
  const [activeSpec, setActiveSpec] = useState("all");
  const [visibleLabs, setVisibleLabs] = useState(["hba1c"]);
  const [hoverYear, setHoverYear] = useState(null);

  const tld = useTimelineData(data);
  const insights = useInsights(data, tld);

  const handleSpecChange = useCallback((spec) => {
    setActiveSpec(spec);
    setVisibleLabs((SPEC_LAB_PRESETS[spec] || ["hba1c"]).slice());
  }, []);

  const handleLabToggle = useCallback((key) => {
    setVisibleLabs(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }, []);

  const handleHoverChange = useCallback((year) => {
    setHoverYear(year);
  }, []);

  if (!tld) return null;

  return (
    <div className="deep-dive-root">
      <DeepDiveHeader data={data} />
      <SpecialtyBar active={activeSpec} onChange={handleSpecChange} />
      <InteractiveTimeline
        tld={tld}
        activeSpec={activeSpec}
        visibleLabs={visibleLabs}
        onLabToggle={handleLabToggle}
        hoverYear={hoverYear}
        onHoverChange={handleHoverChange}
      />
      <div className="dd-panels">
        <PatternDetection insights={insights} activeSpec={activeSpec} />
        <EncountersPanel encounters={tld.encounters} hoverYear={hoverYear} />
      </div>
    </div>
  );
}
