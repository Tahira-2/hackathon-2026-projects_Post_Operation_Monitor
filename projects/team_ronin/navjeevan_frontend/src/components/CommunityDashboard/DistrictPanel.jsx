import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import styles from "./DistrictPanel.module.css";
import { fetchDistrictCoverageHistory, fetchDistrictInsight } from "../../api/coverage";

const VAX_KEYS = ["DPT-3", "Penta-3", "OPV-3", "HepB-3", "Measles-1", "MMR"];
const VAX_COLORS = ["#9f84e8", "#1D9E75", "#D85A30", "#378ADD", "#BA7517", "#D4537E"];
const DISEASE_MAP = {
  "DPT-3": "Diphtheria / Pertussis",
  "Penta-3": "5-in-1 diseases",
  "OPV-3": "Polio",
  "HepB-3": "Hepatitis B",
  "Measles-1": "Measles",
  "MMR": "Measles / Mumps / Rubella",
};

function riskLevel(pct) {
  if (pct >= 90) return "low";
  if (pct >= 80) return "med";
  return "high";
}

function riskLabel(pct) {
  if (pct >= 90) return "Low risk";
  if (pct >= 80) return "Moderate";
  return "High risk";
}

const CustomBar = (props) => {
  const { x, y, width, height, fill } = props;
  const radius = 3;
  return (
    <path
      d={`M${x},${y + height} L${x},${y + radius} Q${x},${y} ${x + radius},${y} L${x + width - radius},${y} Q${x + width},${y} ${x + width},${y + radius} L${x + width},${y + height} Z`}
      fill={fill}
    />
  );
};

export default function DistrictPanel({ record, year }) {
  const [history, setHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState("");

  useEffect(() => {
    if (!record?.district) return;
    fetchDistrictCoverageHistory(record.district)
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [record?.district]);

  useEffect(() => {
    setQuestion("");
    setInsight("");
    setInsightError("");
  }, [record?.district, year]);

  if (!record) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🗺️</div>
        <p>Click any district on the map to explore its vaccination data</p>
      </div>
    );
  }

  const currentDetail = history.find((h) => h.year === year) || record;
  const vax = currentDetail.vaccine_breakdown || {};
  const chartData = VAX_KEYS.map((k, i) => ({
    name: k,
    value: vax[k] ?? 0,
    fill: VAX_COLORS[i],
  }));

  const trendData = history.map((h) => ({
    year: h.year,
    coverage: h.coverage_pct,
  }));

  const askDefaultQuestion = async () => {
    if (!record?.district) return;
    const defaultQuestion = `Summarize ${record.district_name}'s vaccination status for ${year} and suggest practical interventions.`;
    await submitQuestion(defaultQuestion);
  };

  const submitQuestion = async (text) => {
    if (!record?.district) return;
    const trimmed = (text || "").trim();
    if (!trimmed) return;

    setInsightLoading(true);
    setInsightError("");
    try {
      const aiResponse = await fetchDistrictInsight({
        districtId: record.district,
        year,
        question: trimmed,
      });
      setInsight(aiResponse);
    } catch (error) {
      setInsightError(
        error?.response?.data?.detail ||
        "Could not generate district insight right now. Please try again."
      );
    } finally {
      setInsightLoading(false);
    }
  };

  const handleAsk = async () => {
    await submitQuestion(question);
  };

  return (
    <div className={styles.panel}>
      {/* District title */}
      <div className={styles.titleRow}>
        <div>
          <h2 className={styles.districtName}>{record.district_name}</h2>
          <p className={styles.province}>{record.province} · {year}</p>
        </div>
        <span className={styles.imrBadge} data-level={record.imr}>
          {record.imr} IMR
        </span>
      </div>

      {/* Key metrics */}
      <div className={styles.metricsGrid}>
        <Metric label="Population" value={record.population?.toLocaleString()} />
        <Metric label="BCG doses" value={record.bcg?.toLocaleString()} />
        <Metric
          label="DPT-3 coverage"
          value={record.coverage_pct + "%"}
          highlight
        />
        <Metric
          label="DPT-3 doses"
          value={record.dpt_3?.toLocaleString()}
        />
      </div>

      {/* Vaccine breakdown bars */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Vaccine coverage</h3>
        <div className={styles.bars}>
          {VAX_KEYS.map((k, i) => {
            const pct = vax[k] ?? 0;
            return (
              <div key={k} className={styles.barRow}>
                <span className={styles.barLabel}>{k}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      background: VAX_COLORS[i],
                    }}
                  />
                </div>
                <span className={styles.barPct}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Disease risk */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Disease risk</h3>
        <div className={styles.chips}>
          {VAX_KEYS.map((k) => {
            const pct = vax[k] ?? 0;
            const lvl = riskLevel(pct);
            return (
              <span key={k} className={styles.chip} data-risk={lvl}>
                {DISEASE_MAP[k].split("/")[0].trim()}: {riskLabel(pct)}
              </span>
            );
          })}
        </div>
      </section>

      {/* Per-vaccine comparison bar chart */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Coverage breakdown</h3>
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: "rgba(232,228,240,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[50, 105]}
                tick={{ fill: "rgba(232,228,240,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v + "%"}
              />
              <RTooltip
                contentStyle={{
                  background: "#16162a",
                  border: "1px solid rgba(159,132,232,0.25)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#e8e4f0",
                }}
                formatter={(v) => [v + "%", "Coverage"]}
              />
              <ReferenceLine y={90} stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
              <Bar dataKey="value" shape={<CustomBar />} radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Year-over-year trend */}
      {trendData.length > 1 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Year-over-year trend</h3>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={trendData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <XAxis
                  dataKey="year"
                  tick={{ fill: "rgba(232,228,240,0.45)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[50, 105]}
                  tick={{ fill: "rgba(232,228,240,0.45)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v + "%"}
                />
                <RTooltip
                  contentStyle={{
                    background: "#16162a",
                    border: "1px solid rgba(159,132,232,0.25)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#e8e4f0",
                  }}
                  formatter={(v) => [v + "%", "DPT-3 Coverage"]}
                />
                <Bar dataKey="coverage" fill="#9f84e8" shape={<CustomBar />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>AI district insight</h3>
        <p className={styles.aiHint}>
          Grounded on district records, national averages, and Nepal NIP schedule.
        </p>
        <div className={styles.aiActions}>
          <button
            type="button"
            className={styles.aiButton}
            onClick={askDefaultQuestion}
            disabled={insightLoading}
          >
            {insightLoading ? "Analyzing..." : "Generate overview"}
          </button>
        </div>
        <textarea
          className={styles.aiInput}
          placeholder="Ask a specific question (e.g., Why is MMR low and what should be done?)"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
        />
        <button
          type="button"
          className={styles.aiButton}
          onClick={handleAsk}
          disabled={insightLoading || !question.trim()}
        >
          {insightLoading ? "Thinking..." : "Ask AI"}
        </button>
        {insightError ? <p className={styles.aiError}>{insightError}</p> : null}
        {insight ? <div className={styles.aiOutput}>{insight}</div> : null}
      </section>
    </div>
  );
}

function Metric({ label, value, highlight }) {
  return (
    <div className={`${styles.metric} ${highlight ? styles.metricHighlight : ""}`}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue}>{value ?? "—"}</span>
    </div>
  );
}
