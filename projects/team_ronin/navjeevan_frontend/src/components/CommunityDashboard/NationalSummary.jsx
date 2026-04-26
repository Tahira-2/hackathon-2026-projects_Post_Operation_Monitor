import styles from "./NationalSummary.module.css";

export default function NationalSummary({ data, year }) {
  if (!data || data.length === 0) return null;

  const avg = (key) => {
    const vals = data.map((d) => d[key] ?? 0).filter((v) => v > 0);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "—";
  };

  const countByImr = (level) =>
    data.filter((d) => d.imr === level).length;

  const totalPop = data.reduce((s, d) => s + (d.population ?? 0), 0);
  const totalBcg = data.reduce((s, d) => s + (d.bcg ?? 0), 0);

  return (
    <div className={styles.strip}>
      <Stat label="Avg DPT-3 coverage" value={avg("coverage_pct") + "%"} />
      <div className={styles.divider} />
      <Stat label="Districts" value={data.length} />
      <div className={styles.divider} />
      <Stat label="Total population" value={totalPop.toLocaleString()} />
      <div className={styles.divider} />
      <Stat label="Total BCG doses" value={totalBcg.toLocaleString()} />
      <div className={styles.divider} />
      <Stat label="High IMR districts" value={countByImr("HIGH")} accent="danger" />
      <div className={styles.divider} />
      <Stat label="Low IMR districts" value={countByImr("LOW")} accent="success" />
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span
        className={styles.statValue}
        data-accent={accent}
      >
        {value}
      </span>
    </div>
  );
}
