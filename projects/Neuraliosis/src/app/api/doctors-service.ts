import { apiFetch } from './api-client';
import { API_ENDPOINTS, doctorAvailabilityEndpoint } from './endpoints';
import type { DoctorAvailability, DoctorProfile } from './models';

export async function listDoctors(): Promise<DoctorProfile[]> {
  return apiFetch<DoctorProfile[]>(API_ENDPOINTS.doctors.list);
}

export async function getNearbyDoctors(lat: number, lng: number): Promise<DoctorProfile[]> {
  return apiFetch<DoctorProfile[]>(API_ENDPOINTS.doctors.nearby, {
    params: { lat: String(lat), lng: String(lng) },
  });
}

export async function checkDoctorAvailability(
  doctorId: number,
  datetime: string,
): Promise<DoctorAvailability> {
  return apiFetch<DoctorAvailability>(doctorAvailabilityEndpoint(doctorId), {
    params: { datetime },
  });
}
