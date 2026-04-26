// src/types/auth.ts

export interface AuthUser {
  id: string;
  email: string;
  role: string | 'admin' | 'physician' | 'patient';
  fullName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
  role?: string;
}

export interface SignupRequest {
  email: string;
  password?: string;
  fullName?: string;
}
