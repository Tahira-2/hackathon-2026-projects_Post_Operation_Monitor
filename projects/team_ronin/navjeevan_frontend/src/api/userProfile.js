import apiClient from './client';

export const fetchUserProfile = () => apiClient.get('/api/auth/user/profile/');
export const updateUserProfile = (data) => apiClient.patch('/api/auth/user/update-profile/', data);
