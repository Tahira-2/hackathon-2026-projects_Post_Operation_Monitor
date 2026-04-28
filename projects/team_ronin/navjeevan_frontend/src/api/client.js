import axios from 'axios';
import { clearAuthStorage, isTokenExpired } from '../utils/authStorage';

const baseURL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000';

const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vaxnepal_token');
  // Don't send token for login, register, or activate endpoints to avoid 401 if token is expired
  const isAuthRoute =
    config.url?.includes('/login/') ||
    config.url?.includes('/register/') ||
    config.url?.includes('/activate/');

  if (token && !isAuthRoute && !isTokenExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token && isTokenExpired(token)) {
    clearAuthStorage();
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || '';
    const isAuthRoute =
      requestUrl.includes('/login/') ||
      requestUrl.includes('/register/') ||
      requestUrl.includes('/activate/');

    if (status === 401 && !isAuthRoute) {
      clearAuthStorage();
      if (!window.location.pathname.includes('/login')) {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
