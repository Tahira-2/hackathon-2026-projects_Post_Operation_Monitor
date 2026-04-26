import apiClient from './axios';
import type {
  Appointment,
  CreateAppointmentRequest,
  ListAppointmentsQuery,
  UpdateAppointmentRequest,
} from '../../types/appointment.types';

/** POST /appointments */
export const createAppointment = (data: CreateAppointmentRequest): Promise<Appointment> =>
  apiClient.post<Appointment>('/appointments', data).then((r) => r.data);

/** GET /appointments?doctorId=&patientId= */
export const listAppointments = (query?: ListAppointmentsQuery): Promise<Appointment[]> =>
  apiClient.get<Appointment[]>('/appointments', { params: query }).then((r) => r.data);

/** GET /appointments/:id */
export const getAppointment = (id: string): Promise<Appointment> =>
  apiClient.get<Appointment>(`/appointments/${id}`).then((r) => r.data);

/** PATCH /appointments/:id */
export const updateAppointment = (
  id: string,
  data: UpdateAppointmentRequest,
): Promise<Appointment> =>
  apiClient.patch<Appointment>(`/appointments/${id}`, data).then((r) => r.data);

/** DELETE /appointments/:id */
export const deleteAppointment = (id: string): Promise<Appointment> =>
  apiClient.delete<Appointment>(`/appointments/${id}`).then((r) => r.data);
