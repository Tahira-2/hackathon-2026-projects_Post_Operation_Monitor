import apiClient from './client';

export const loginHealthcare = (data) =>
  apiClient.post('/api/auth/user/login/', data);
