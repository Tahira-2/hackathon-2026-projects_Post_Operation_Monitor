// ─── Auth Types — derived from backend auth DTOs and buildAuthResponse ────────

export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';

/** POST /auth/patient/login | POST /auth/doctor/login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /auth/patient/signup */
export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
}

/** User shape returned inside AuthResponse */
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  createdAt: string;
}

/** Response shape from signup / login — { user, accessToken } */
export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

/** POST /auth/logout → { success: true } */
export interface LogoutResponse {
  success: boolean;
}
