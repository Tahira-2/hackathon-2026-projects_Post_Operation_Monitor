import apiClient from './client';

export const getVaccinations = () => apiClient.get('/api/vaccines/my-records/');
export const createVaccination = (data) => apiClient.post('/api/vaccines/my-records/', data);
export const updateVaccination = (id, data) => apiClient.put(`/api/vaccines/my-records/${id}/`, data);
export const deleteVaccination = (id) => apiClient.delete(`/api/vaccines/my-records/${id}/`);
export const getBasicVaccines = () => apiClient.get('/api/vaccines/vaccines/');
export const askCitizenVaccineAssistant = (question, language = 'en') =>
  apiClient.post('/api/my-vaccinations/assistant/', { question, language });
