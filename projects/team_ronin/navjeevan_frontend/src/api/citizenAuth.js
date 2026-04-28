import apiClient from './client';

export const loginUser = (data) =>
  apiClient.post('/api/auth/user/login/', data);

export const registerUser = (data) =>
  apiClient.post('/api/auth/user/register/', data);

export const activateUser = (data) =>
  apiClient.post('/api/auth/activate/', data);
