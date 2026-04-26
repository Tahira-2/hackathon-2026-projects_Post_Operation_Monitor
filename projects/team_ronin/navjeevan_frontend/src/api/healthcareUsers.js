import apiClient from './client';

export const registerHealthcareUser = (data) =>
  apiClient.post('/api/auth/medical/register-user/', data);