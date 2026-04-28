import apiClient from './client';

export const fetchUserNotifications = () => apiClient.get('/events/my-notifications/');
