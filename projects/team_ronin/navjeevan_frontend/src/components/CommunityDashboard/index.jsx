import { useState, useEffect } from "react";
import NepalMap from "./NepalMap";
import DistrictPanel from "./DistrictPanel";
import YearSelector from "./YearSelector";
import NationalSummary from "./NationalSummary";
import { useCoverageData } from "../Hooks/useCoverageData";
import styles from "./CommunityDashboard.module.css";
import { fetchCoverageYears } from "../../api/coverage";

export default function CommunityDashboard() {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [availableYears, setAvailableYears] = useState([2024]);

  const { coverageData, loading, error } = useCoverageData(selectedYear);

  // Fetch available years on mount
  useEffect(() => {
    fetchCoverageYears()
      .then((years) => {
        if (years.length) {
          setAvailableYears(years);
          setSelectedYear(years[years.length - 1]);
        }
      })
      .catch(() => {});
  }, []);

  const handleDistrictClick = (districtName) => {
    const record = coverageData.find(
      (d) => d.district_name?.toLowerCase() === districtName?.toLowerCase()
    );
    setSelectedDistrict(record || null);
  };

  return (
    <div className={styles.root}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>✦ Navjeevan</span>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>Population Health Intelligence</h1>
            <p className={styles.subtitle}>
              Vaccination coverage across Nepal's 77 districts
            </p>
          </div>
        </div>
        <YearSelector
          years={availableYears}
          selected={selectedYear}
          onChange={(y) => {
            setSelectedYear(y);
            setSelectedDistrict(null);
          }}
        />
      </header>

      {/* National summary strip */}
      <NationalSummary data={coverageData} year={selectedYear} />

      {/* Main content */}
      <main className={styles.main}>
        <div className={styles.mapCol}>
          {loading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner} />
              <span>Loading {selectedYear} coverage data…</span>
            </div>
          )}
          {error && (
            <div className={styles.errorBanner}>
              ⚠ Could not load data from backend. Please try again shortly.
            </div>
          )}
          <NepalMap
            coverageData={coverageData}
            onDistrictClick={handleDistrictClick}
            selectedDistrict={selectedDistrict?.district_name}
          />
          <Legend />
        </div>

        <aside className={styles.sideCol}>
          <DistrictPanel
            record={selectedDistrict}
            year={selectedYear}
          />
        </aside>
      </main>
    </div>
  );
}

function Legend() {
  const stops = [
    { color: "#f0eafb", label: "60%" },
    { color: "#c0aaf0", label: "" },
    { color: "#9f84e8", label: "" },
    { color: "#7f77dd", label: "80%" },
    { color: "#534ab7", label: "" },
    { color: "#3c3489", label: "100%" },
  ];
  return (
    <div className={styles.legend}>
      <span className={styles.legendLabel}>DPT-3 Coverage</span>
      <div className={styles.legendBar}>
        {stops.map((s, i) => (
          <div
            key={i}
            className={styles.legendStop}
            style={{ background: s.color }}
          >
            {s.label && (
              <span className={styles.legendTick}>{s.label}</span>
            )}
          </div>
        ))}
      </div>
      <div className={styles.legendImr}>
        <span className={styles.imrBadge} data-level="LOW">LOW IMR</span>
        <span className={styles.imrBadge} data-level="MEDIUM">MED IMR</span>
        <span className={styles.imrBadge} data-level="HIGH">HIGH IMR</span>
      </div>
    </div>
  );
}
