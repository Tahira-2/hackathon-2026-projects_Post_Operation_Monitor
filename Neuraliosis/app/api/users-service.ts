import { apiFetch, apiUpload } from './api-client';
import { API_ENDPOINTS } from './endpoints';
import { saveTokens, clearTokens } from './token-storage';
import type {
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  UpdateUserLocationPayload,
  UpdateUserProfilePayload,
  UserLocation,
  UserProfile,
} from './models';

export async function register(payload: RegisterPayload): Promise<UserProfile> {
  return apiFetch<UserProfile>(API_ENDPOINTS.users.register, {
    method: 'POST',
    body: payload,
  });
}

export async function login(payload: LoginPayload): Promise<AuthTokens> {
  const tokens = await apiFetch<AuthTokens>(API_ENDPOINTS.users.login, {
    method: 'POST',
    body: payload,
  });
  await saveTokens(tokens.access, tokens.refresh);
  return tokens;
}

export async function getProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>(API_ENDPOINTS.users.me, { authenticated: true });
}

export async function updateProfile(payload: UpdateUserProfilePayload): Promise<UserProfile> {
  return apiFetch<UserProfile>(API_ENDPOINTS.users.updateMe, {
    method: 'PATCH',
    body: payload,
    authenticated: true,
  });
}

export async function uploadProfilePhoto(photoUri: string): Promise<UserProfile> {
  const formData = new FormData();
  formData.append('photo', {
    uri: photoUri,
    name: 'profile.jpg',
    type: 'image/jpeg',
  } as any);
  return apiUpload<UserProfile>(API_ENDPOINTS.users.uploadPhoto, formData);
}

export async function updateLocation(payload: UpdateUserLocationPayload): Promise<UserLocation> {
  return apiFetch<UserLocation>(API_ENDPOINTS.users.updateLocation, {
    method: 'PATCH',
    body: payload,
    authenticated: true,
  });
}

export async function getLocation(): Promise<UserLocation> {
  return apiFetch<UserLocation>(API_ENDPOINTS.users.location, { authenticated: true });
}

export async function logout(): Promise<void> {
  await clearTokens();
}
