import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ─── Request interceptor: attach Bearer token ─────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor: normalise errors ───────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message: string =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      'An unexpected error occurred';

    // Auto-clear stale token on 401
    if (status === 401) {
      localStorage.removeItem('careflow_token');
      localStorage.removeItem('careflow_user');
    }

    // Throw a plain Error so callers get a .message
    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
  },
);

export default apiClient;
