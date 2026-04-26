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
