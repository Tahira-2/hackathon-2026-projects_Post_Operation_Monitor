import apiClient from './client';

export const fetchHealthcareUsers = (params = {}) =>
  apiClient.get('/api/auth/medical/users/', { params });

export const registerHealthcareUser = (data) =>
  apiClient.post('/api/auth/medical/register-user/', data);