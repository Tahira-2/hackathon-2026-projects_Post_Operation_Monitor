import axios from "axios";
import { api } from "./axios";

export const RESET_PASSWORD_TOKEN_KEY = "refai-reset-access-token";

export interface DoctorProfile {
  id: string;
  email: string;
  full_name: string;
  contact_number?: string | null;
  specialty?: string | null;
  license_number?: string | null;
  hospital?: string | null;
  avatar_url?: string | null;
  created_at?: string;
}

interface SignInResponse {
  access_token?: string;
}

interface SignUpPayload {
  email: string;
  password: string;
  full_name: string;
}

interface SignInPayload {
  email: string;
  password: string;
}

export interface UpdateDoctorProfilePayload {
  full_name?: string;
  email?: string;
  contact_number?: string;
  specialty?: string;
  license_number?: string;
  hospital?: string;
}

export interface DoctorProfileLookups {
  specialties: string[];
  hospitals: string[];
}

export async function signIn(payload: SignInPayload) {
  const { data } = await api.post<SignInResponse>(
    "/api/v1/auth/signin",
    payload,
  );

  if (!data.access_token) {
    throw new Error("Sign in failed: no access token returned");
  }

  const profileResponse = await api.get<DoctorProfile>(
    "/api/v1/doctors/profile",
    {
      headers: { Authorization: `Bearer ${data.access_token}` },
    },
  );

  return {
    accessToken: data.access_token,
    doctor: profileResponse.data,
  };
}

export async function signUp(payload: SignUpPayload) {
  await api.post("/api/v1/auth/signup", payload);
}

export async function forgotPassword(email: string) {
  await api.post("/api/v1/auth/forgot-password", { email });
}

export async function resetPassword(accessToken: string, newPassword: string) {
  await api.post(
    "/api/v1/auth/reset-password",
    { new_password: newPassword },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
}

export async function signOut() {
  await api.post("/api/v1/auth/signout");
}

export async function getDoctorProfile() {
  const { data } = await api.get<DoctorProfile>("/api/v1/doctors/profile");
  return data;
}

export async function getDoctorById(doctorId: string) {
  const { data } = await api.get<DoctorProfile>(`/api/v1/doctors/${doctorId}`);
  return data;
}

export async function getDoctorProfileLookups() {
  const { data } = await api.get<DoctorProfileLookups>(
    "/api/v1/doctors/lookups",
  );
  return data;
}

export async function updateDoctorProfile(payload: UpdateDoctorProfilePayload) {
  const { data } = await api.patch<DoctorProfile>(
    "/api/v1/doctors/profile",
    payload,
  );

  return data;
}

export async function uploadDoctorAvatar(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await api.post<{ avatar_url: string }>(
    "/api/v1/doctors/profile/avatar",
    formData,
  );

  return data;
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ error?: string; message?: string }>(error)) {
    if (!error.response) {
      return "Unable to reach the server. Check your connection and try again.";
    }

    return (
      error.response?.data?.error ?? error.response?.data?.message ?? fallback
    );
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
