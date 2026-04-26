import { apiFetch } from './api-client';
import {
  API_ENDPOINTS,
  appointmentEndpoint,
  appointmentStatusEndpoint,
} from './endpoints';
import type {
  Appointment,
  BookAppointmentPayload,
  UpdateAppointmentPayload,
  UpdateAppointmentStatusPayload,
} from './models';

export async function getMyAppointments(): Promise<Appointment[]> {
  return apiFetch<Appointment[]>(API_ENDPOINTS.appointments.root, {
    authenticated: true,
  });
}

export async function bookAppointment(
  payload: BookAppointmentPayload,
): Promise<Appointment> {
  return apiFetch<Appointment>(API_ENDPOINTS.appointments.root, {
    method: 'POST',
    body: payload,
    authenticated: true,
  });
}

export async function updateAppointment(
  id: number,
  payload: UpdateAppointmentPayload,
): Promise<Appointment> {
  return apiFetch<Appointment>(appointmentEndpoint(id), {
    method: 'PATCH',
    body: payload,
    authenticated: true,
  });
}

export async function updateAppointmentStatus(
  id: number,
  payload: UpdateAppointmentStatusPayload,
): Promise<Appointment> {
  return apiFetch<Appointment>(appointmentStatusEndpoint(id), {
    method: 'PATCH',
    body: payload,
    authenticated: true,
  });
}
