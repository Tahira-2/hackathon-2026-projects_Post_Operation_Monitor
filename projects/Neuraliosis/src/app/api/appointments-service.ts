import { apiFetch, apiUpload } from './api-client';
import {
  API_ENDPOINTS,
  appointmentEndpoint,
  appointmentReportEndpoint,
  appointmentSlotEndpoint,
  appointmentStatusEndpoint,
  availableSlotsEndpoint,
} from './endpoints';
import type {
  Appointment,
  AppointmentReport,
  AppointmentSlot,
  BookAppointmentPayload,
  CreateReportPayload,
  CreateSlotPayload,
  UpdateAppointmentPayload,
  UpdateAppointmentStatusPayload,
} from './models';

// ─── Patient ───
export async function getMyAppointments(): Promise<Appointment[]> {
  return apiFetch<Appointment[]>(API_ENDPOINTS.appointments.root, { authenticated: true });
}

export async function bookAppointment(payload: BookAppointmentPayload): Promise<Appointment> {
  return apiFetch<Appointment>(API_ENDPOINTS.appointments.root, {
    method: 'POST',
    body: payload,
    authenticated: true,
  });
}

export async function updateAppointment(id: number, payload: UpdateAppointmentPayload): Promise<Appointment> {
  return apiFetch<Appointment>(appointmentEndpoint(id), {
    method: 'PATCH',
    body: payload,
    authenticated: true,
  });
}

// ─── Doctor ───
export async function updateAppointmentStatus(id: number, payload: UpdateAppointmentStatusPayload): Promise<Appointment> {
  return apiFetch<Appointment>(appointmentStatusEndpoint(id), {
    method: 'PATCH',
    body: payload,
    authenticated: true,
  });
}

export async function getDoctorAppointments(): Promise<Appointment[]> {
  return apiFetch<Appointment[]>(API_ENDPOINTS.appointments.doctor, { authenticated: true });
}

// ─── Slots ───
export async function getMySlots(): Promise<AppointmentSlot[]> {
  return apiFetch<AppointmentSlot[]>(API_ENDPOINTS.appointments.slots, { authenticated: true });
}

export async function createSlot(payload: CreateSlotPayload): Promise<AppointmentSlot> {
  return apiFetch<AppointmentSlot>(API_ENDPOINTS.appointments.slots, {
    method: 'POST',
    body: payload,
    authenticated: true,
  });
}

export async function deleteSlot(id: number): Promise<void> {
  return apiFetch<void>(appointmentSlotEndpoint(id), {
    method: 'DELETE',
    authenticated: true,
  });
}

export async function getAvailableSlots(doctorId: number): Promise<AppointmentSlot[]> {
  return apiFetch<AppointmentSlot[]>(availableSlotsEndpoint(doctorId));
}

// ─── Reports ───
export async function getAppointmentReport(appointmentId: number): Promise<AppointmentReport> {
  return apiFetch<AppointmentReport>(appointmentReportEndpoint(appointmentId), {
    authenticated: true,
  });
}

export async function createReport(
  appointmentId: number,
  payload: CreateReportPayload,
  reportFileUri?: string,
): Promise<AppointmentReport> {
  if (reportFileUri) {
    const formData = new FormData();
    formData.append('diagnosis', payload.diagnosis);
    if (payload.notes) formData.append('notes', payload.notes);
    if (payload.suggestions) formData.append('suggestions', payload.suggestions);
    if (payload.prescriptions) formData.append('prescriptions', payload.prescriptions);
    formData.append('report_file', {
      uri: reportFileUri,
      name: 'report.pdf',
      type: 'application/pdf',
    } as any);
    return apiUpload<AppointmentReport>(appointmentReportEndpoint(appointmentId), formData);
  }

  return apiFetch<AppointmentReport>(appointmentReportEndpoint(appointmentId), {
    method: 'POST',
    body: payload,
    authenticated: true,
  });
}
