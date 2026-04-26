// ─── Appointment Types — derived from Prisma schema + appointment service ─────

/** AppointmentStatus enum — from schema.prisma */
export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'RESCHEDULED';

/** Shape returned by every appointment endpoint (appointmentSelect in service) */
export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  status: AppointmentStatus;
  startTime: string; // ISO datetime string
  endTime: string;   // ISO datetime string
  reason: string | null;
  createdAt: string;
}

/** POST /appointments body */
export interface CreateAppointmentRequest {
  doctorId: string;
  patientId: string;
  status: AppointmentStatus;
  startTime: string; // ISO datetime string
  endTime: string;   // ISO datetime string
  reason?: string;
}

/** PATCH /appointments/:id body — all fields optional */
export interface UpdateAppointmentRequest {
  doctorId?: string;
  patientId?: string;
  status?: AppointmentStatus;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

/** GET /appointments query params */
export interface ListAppointmentsQuery {
  doctorId?: string;
  patientId?: string;
}
