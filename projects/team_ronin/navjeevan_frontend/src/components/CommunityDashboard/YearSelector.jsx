import styles from "./YearSelector.module.css";

export default function YearSelector({ years, selected, onChange }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.label}>Year</span>
      <div className={styles.pills}>
        {years.map((y) => (
          <button
            key={y}
            className={`${styles.pill} ${y === selected ? styles.active : ""}`}
            onClick={() => onChange(y)}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}
