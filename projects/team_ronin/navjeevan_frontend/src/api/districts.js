import apiClient from './client';

export const getDistricts = () => apiClient.get('/api/districts/');
