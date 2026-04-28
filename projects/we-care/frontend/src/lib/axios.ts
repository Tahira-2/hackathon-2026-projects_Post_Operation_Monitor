import axios from "axios";
import { useAuthStore } from "../stores/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url ?? "");
    const shouldBypassRedirect = [
      "/api/v1/auth/signin",
      "/api/v1/auth/signup",
      "/api/v1/auth/forgot-password",
      "/api/v1/auth/reset-password",
    ].some((path) => requestUrl.includes(path));

    if (error.response?.status === 401 && !shouldBypassRedirect) {
      useAuthStore.getState().clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
