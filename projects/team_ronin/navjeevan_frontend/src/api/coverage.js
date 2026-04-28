import apiClient from './client';

export const fetchCoverageByYear = async (year) => {
  const response = await apiClient.get('/api/coverage/', {
    params: { year },
  });
  const payload = response?.data;
  return Array.isArray(payload) ? payload : payload?.results ?? [];
};

export const fetchCoverageYears = async () => {
  const response = await apiClient.get('/api/coverage/years/');
  return Array.isArray(response?.data) ? response.data : [];
};

export const fetchDistrictCoverageHistory = async (district) => {
  if (!district) {
    return [];
  }

  const response = await apiClient.get(`/api/coverage/${district}/history/`);
  return Array.isArray(response?.data) ? response.data : [];
};

export const fetchDistrictInsight = async ({ districtId, year, question }) => {
  if (!districtId) {
    throw new Error("District is required for AI insight.");
  }

  const response = await apiClient.post(`/api/coverage/${districtId}/insight/`, {
    year,
    question,
    language: localStorage.getItem('navjeevan_language') === 'ne' ? 'ne' : 'en',
  });
  return response?.data?.insight ?? "";
};
