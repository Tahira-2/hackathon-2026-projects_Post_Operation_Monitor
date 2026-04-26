import apiClient from './client';

export const fetchPrograms = () => apiClient.get('/events/');

export const createProgram = (data) => apiClient.post('/events/', data);
export const registerForProgram = (programId) => apiClient.post(`/events/${programId}/register/`);

export const fetchProgramVaccines = () => apiClient.get('/vaccinations/');

export const createProgramVaccine = (data) => apiClient.post('/vaccinations/', data);
