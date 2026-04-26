"use client";

import { useState, useCallback, useEffect } from "react";
import { TrendingUp, ShieldCheck, ChevronDown, FileText, Database, Layers } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Sector, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { MONTHS, Month, monthlyData, yearData, Category, Activity } from "@/lib/data";

const COLORS = ["#0d9488", "#14b8a6", "#5eead4", "#99f6e4", "#0891b2", "#22d3ee"];
const FILTERS = ["All", "Medical", "Wellness", "Mental Health"] as const;
type Filter = (typeof FILTERS)[number];
type View = "year" | "month";

type PolicyDoc = {
  id: string;
  document_name: string;
  policy_id: string;
  extraction_summary?: {
    entities_extracted?: number;
    nodes_created?: number;
    relationships_created?: number;
  };
  graph_preview?: {
    coverage_types?: string[];
    key_entities?: string[];
  };
  upload_date: string;
};

const CATEGORY_ICONS: Record<string, string> = {
  Physiotherapy: "🦴",
  Acupuncture: "🪡",
  Nutrition: "🥗",
  "Mental Health": "🧠",
  Dental: "🦷",
  Vision: "👁️",
};

// Renders the expanded active slice with a label
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      {/* Center label */}
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#1f2937" className="text-base font-bold" style={{ fontSize: 18, fontWeight: 700 }}>
        ${value.toLocaleString()}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#6b7280" style={{ fontSize: 12 }}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle" fill="#0d9488" style={{ fontSize: 12, fontWeight: 600 }}>
        {(percent * 100).toFixed(1)}%
      </text>
      {/* Expanded outer slice */}
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 10} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      {/* Ring highlight */}
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 14} outerRadius={outerRadius + 18} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

export default function SavingsDashboard() {
  const [view, setView] = useState<View>("year");
  const [selectedMonth, setSelectedMonth] = useState<Month>("April");
  const [filter, setFilter] = useState<Filter>("All");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeSlice, setActiveSlice] = useState<number>(0);
  const onPieEnter = useCallback((_: unknown, index: number) => setActiveSlice(index), []);
  const [extensionVisits, setExtensionVisits] = useState<Activity[]>([]);
  const [policyDocs, setPolicyDocs] = useState<PolicyDoc[]>([]);

  // Fetch policy documents for the insights panel
  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then(setPolicyDocs)
      .catch(() => {});
  }, []);

  // Compute coverage-type frequency across all uploaded policies
  const coverageFreq: Record<string, number> = {};
  policyDocs.forEach((doc) => {
    (doc.graph_preview?.coverage_types ?? []).forEach((ct) => {
      coverageFreq[ct] = (coverageFreq[ct] ?? 0) + 1;
    });
  });
  const coverageChartData = Object.entries(coverageFreq)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  const totalEntities = policyDocs.reduce(
    (s, d) => s + (d.extraction_summary?.entities_extracted ?? 0),
    0
  );

  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem("perfectpuls_visits");
        if (raw) setExtensionVisits(JSON.parse(raw));
      } catch { /* extension not installed or no visits yet */ }
    }
    load();
    window.addEventListener("perfectpuls_visits_updated", load);
    return () => window.removeEventListener("perfectpuls_visits_updated", load);
  }, []);

  const dataset = view === "year" ? yearData : monthlyData[selectedMonth];
  const filtered: Category[] =
    filter === "All" ? dataset.categories : dataset.categories.filter((c) => c.type === filter);

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-teal-500 to-teal-700 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-1 opacity-80">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">
              {view === "year" ? "Total Saved This Year" : `Total Saved in ${selectedMonth}`}
            </span>
          </div>
          <p className="text-4xl font-bold">${dataset.totalSaved.toLocaleString()}</p>
          <p className="text-teal-100 text-xs mt-1">in insurance benefits</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-700 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-1 opacity-80">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm">
              {view === "year" ? "Out-of-Pocket Avoided This Year" : `Out-of-Pocket Avoided in ${selectedMonth}`}
            </span>
          </div>
          <p className="text-4xl font-bold">${dataset.outOfPocketAvoided.toLocaleString()}</p>
          <p className="text-green-100 text-xs mt-1">direct costs covered</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Filter buttons */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-teal-600 text-white shadow"
                  : "bg-white text-gray-600 shadow hover:bg-teal-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* View toggle + month picker */}
        <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
          <div className="flex bg-white rounded-lg shadow overflow-hidden">
            {(["month", "year"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  view === v ? "bg-teal-600 text-white" : "text-gray-600 hover:bg-teal-50"
                }`}
              >
                {v === "month" ? "This Month" : "This Year"}
              </button>
            ))}
          </div>

          {view === "month" && (
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value as Month)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m} 2026</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* Category Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
          No categories found for &quot;{filter}&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((cat) => {
            const sessionPct = Math.round((cat.sessionsUsed / cat.sessionsTotal) * 100);
            const allowancePct = Math.round((cat.allowanceUsed / cat.allowanceTotal) * 100);
            const remaining = cat.allowanceTotal - cat.allowanceUsed;
            const sessionsLeft = cat.sessionsTotal - cat.sessionsUsed;
            const isHovered = hoveredCard === cat.name;

            return (
              <div
                key={cat.name}
                className="relative bg-white p-5 rounded-2xl shadow hover:shadow-xl transition-all duration-200 cursor-default"
                onMouseEnter={() => setHoveredCard(cat.name)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 z-20 w-52 shadow-xl pointer-events-none">
                    <p className="font-semibold mb-1">{cat.name}</p>
                    <p>{sessionsLeft} session{sessionsLeft !== 1 ? "s" : ""} remaining</p>
                    <p>${remaining.toLocaleString()} allowance left</p>
                    <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{CATEGORY_ICONS[cat.name] ?? "💊"}</span>
                    <h2 className="font-semibold text-gray-800">{cat.name}</h2>
                  </div>
                  <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                    {cat.type}
                  </span>
                </div>

                {/* Sessions progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Sessions used</span>
                    <span>{cat.sessionsUsed} / {cat.sessionsTotal}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full">
                    <div
                      className="bg-teal-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${sessionPct}%` }}
                    />
                  </div>
                </div>

                {/* Allowance progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Allowance used</span>
                    <span>${cat.allowanceUsed.toLocaleString()} / ${cat.allowanceTotal.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full">
                    <div
                      className="bg-green-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${allowancePct}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">{allowancePct}% used</span>
                  <span className="text-teal-600 font-semibold">
                    ${cat.saved.toLocaleString()} saved
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Donut + Activity side-by-side on large screens */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Chart */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="font-semibold text-gray-800 mb-1">Savings Distribution</h2>
            <p className="text-xs text-gray-400 mb-4">Hover a slice to explore</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={filtered}
                  dataKey="saved"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={3}
                  activeIndex={activeSlice}
                  activeShape={renderActiveShape}
                  onMouseEnter={onPieEnter}
                >
                  {filtered.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Saved"]}
                  contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom legend with amounts + percentages */}
            {(() => {
              const total = filtered.reduce((s, c) => s + c.saved, 0);
              return (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                  {filtered.map((cat, i) => {
                    const pct = total > 0 ? ((cat.saved / total) * 100).toFixed(1) : "0.0";
                    return (
                      <button
                        key={cat.name}
                        onClick={() => setActiveSlice(i)}
                        className={`flex items-center gap-2 text-left rounded-lg px-2 py-1 transition-colors ${activeSlice === i ? "bg-gray-50" : "hover:bg-gray-50"}`}
                      >
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-xs text-gray-600 truncate flex-1">{cat.name}</span>
                        <span className="text-xs font-semibold text-gray-800">{pct}%</span>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-semibold text-gray-800">Recent Activity</h2>
              {extensionVisits.length > 0 && (
                <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full border border-teal-200">
                  {extensionVisits.length} live from extension
                </span>
              )}
            </div>
            <div className="divide-y divide-gray-100">
              {[...extensionVisits, ...dataset.recentActivity].slice(0, 10).map((item, i) => (
                <div key={i} className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{CATEGORY_ICONS[item.service] ?? "💊"}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{item.service}</p>
                      <p className="text-xs text-gray-400">{item.provider} · {item.date}</p>
                    </div>
                  </div>
                  <span className="text-teal-600 font-semibold text-sm">+${item.saved}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity when no categories filtered (show standalone) */}
      {filtered.length === 0 && (
        <div className="bg-white p-6 rounded-2xl shadow">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold text-gray-800">Recent Activity</h2>
            {extensionVisits.length > 0 && (
              <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full border border-teal-200">
                {extensionVisits.length} live from extension
              </span>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {[...extensionVisits, ...dataset.recentActivity].slice(0, 10).map((item, i) => (
              <div key={i} className="flex justify-between items-center py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{CATEGORY_ICONS[item.service] ?? "💊"}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{item.service}</p>
                    <p className="text-xs text-gray-400">{item.provider} · {item.date}</p>
                  </div>
                </div>
                <span className="text-teal-600 font-semibold text-sm">+${item.saved}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policy Intelligence — only shown when documents exist */}
      {policyDocs.length > 0 && (
        <div className="space-y-4">
          {/* Section header */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Policy Intelligence
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Aggregate stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
              <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{policyDocs.length}</p>
                <p className="text-xs text-gray-500">Policies Analyzed</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
              <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                <Database className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{totalEntities}</p>
                <p className="text-xs text-gray-500">Total Entities Extracted</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
              <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {Object.keys(coverageFreq).length}
                </p>
                <p className="text-xs text-gray-500">Unique Coverage Types</p>
              </div>
            </div>
          </div>

          {/* Coverage frequency chart + policy cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Horizontal bar chart */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-semibold text-gray-800 mb-1">Coverage Type Frequency</h3>
              <p className="text-xs text-gray-400 mb-4">How many of your policies include each type</p>
              <ResponsiveContainer width="100%" height={coverageChartData.length * 42 + 20}>
                <BarChart
                  data={coverageChartData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, policyDocs.length]}
                    ticks={Array.from({ length: policyDocs.length + 1 }, (_, i) => i)}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={190}
                    tick={{ fontSize: 11, fill: "#374151" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(v) => [`${v} of ${policyDocs.length} ${policyDocs.length === 1 ? "policy" : "policies"}`, "Coverage"]}
                    contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: 12 }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={18}>
                    {coverageChartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i % 2 === 0 ? "#0d9488" : "#14b8a6"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Per-policy summary cards */}
            <div className="space-y-3">
              {policyDocs.map((doc, i) => {
                const coverage = doc.graph_preview?.coverage_types ?? [];
                const entities = doc.extraction_summary?.entities_extracted ?? 0;
                const nodes = doc.extraction_summary?.nodes_created;
                return (
                  <div key={doc.id} className="bg-white rounded-2xl shadow p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 truncate max-w-50">
                            {doc.document_name}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">{doc.upload_date}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-teal-600">{entities}</p>
                        <p className="text-xs text-gray-400">entities</p>
                      </div>
                    </div>

                    {nodes !== undefined && nodes > 0 && (
                      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                        <span>{nodes} graph nodes</span>
                        {doc.extraction_summary?.relationships_created && (
                          <span>{doc.extraction_summary.relationships_created} relationships</span>
                        )}
                      </div>
                    )}

                    {/* Coverage chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {coverage.map((ct) => (
                        <span
                          key={ct}
                          className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full border border-teal-100"
                        >
                          {ct}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cross-policy coverage overlap notice */}
          {(() => {
            const sharedTypes = Object.entries(coverageFreq)
              .filter(([, count]) => count > 1)
              .map(([name]) => name);
            if (sharedTypes.length === 0) return null;
            return (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-sm font-semibold text-amber-800 mb-1">Coverage Overlap Detected</p>
                <p className="text-xs text-amber-700 mb-2">
                  These {sharedTypes.length} coverage type{sharedTypes.length !== 1 ? "s" : ""} appear in multiple
                  policies — you may be paying for duplicate coverage:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {sharedTypes.map((ct) => (
                    <span
                      key={ct}
                      className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full border border-amber-200"
                    >
                      {ct} ×{coverageFreq[ct]}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}