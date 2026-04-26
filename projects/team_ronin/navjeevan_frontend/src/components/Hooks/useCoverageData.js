import { useState, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export function useCoverageData(year) {
  const [coverageData, setCoverageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!year) return;

    setLoading(true);
    setError(null);

    fetch(`${BASE_URL}/api/coverage/?year=${year}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        // DRF returns paginated or plain list — handle both
        const results = Array.isArray(data) ? data : data.results ?? [];
        setCoverageData(results);
      })
      .catch((e) => {
        console.error("Failed to fetch coverage data:", e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [year]);

  return { coverageData, loading, error };
}
