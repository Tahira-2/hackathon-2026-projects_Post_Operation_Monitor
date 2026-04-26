import apiClient from './axios';
import type { AuthResponse, LoginRequest, LogoutResponse, SignupRequest } from '../../types/auth.types';

/** POST /auth/patient/signup */
export const patientSignup = (data: SignupRequest): Promise<AuthResponse> =>
  apiClient.post<AuthResponse>('/auth/patient/signup', data).then((r) => r.data);

/** POST /auth/patient/login */
export const patientLogin = (data: LoginRequest): Promise<AuthResponse> =>
  apiClient.post<AuthResponse>('/auth/patient/login', data).then((r) => r.data);

/** POST /auth/doctor/login */
export const doctorLogin = (data: LoginRequest): Promise<AuthResponse> =>
  apiClient.post<AuthResponse>('/auth/doctor/login', data).then((r) => r.data);

/** POST /auth/logout — requires JWT (interceptor attaches it) */
export const logout = (): Promise<LogoutResponse> =>
  apiClient.post<LogoutResponse>('/auth/logout').then((r) => r.data);
