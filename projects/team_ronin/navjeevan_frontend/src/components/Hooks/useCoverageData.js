import { useState, useEffect } from "react";
import { fetchCoverageByYear } from '../../api/coverage';
import { extractApiErrorMessage } from '../../utils/apiErrors';

export function useCoverageData(year) {
  const [coverageData, setCoverageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!year) return;

    setLoading(true);
    setError(null);

    fetchCoverageByYear(year)
      .then((results) => {
        setCoverageData(results);
      })
      .catch((e) => {
        setError(
          extractApiErrorMessage(e, {
            fallbackMessage: 'Failed to fetch coverage data.',
          }),
        );
      })
      .finally(() => setLoading(false));
  }, [year]);

  return { coverageData, loading, error };
}
