export type UserRole = 'user' | 'doctor' | 'admin';

export type RegisterRole = Exclude<UserRole, 'admin'>;

export interface UserProfile {
  id: number;
  last_login: string | null;
  is_superuser: boolean;
  email: string;
  full_name: string;
  role: UserRole;
  latitude: string | null;
  longitude: string | null;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
  groups: number[];
  user_permissions: number[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
  role: RegisterRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateUserProfilePayload {
  email?: string;
  full_name?: string;
  latitude?: string | null;
  longitude?: string | null;
}

export interface UserLocation {
  latitude: string | null;
  longitude: string | null;
}

export interface UpdateUserLocationPayload {
  latitude: string;
  longitude: string;
}

export interface DoctorProfile {
  id: number;
  user: number;
  specialization: string;
  hospital_name: string;
  latitude: string | null;
  longitude: string | null;
  available_from: string;
  available_to: string;
  phone_number: string;
  created_at: string;
  distance_km?: number;
}

export interface CreateDoctorPayload {
  email: string;
  full_name: string;
  password: string;
  specialization: string;
  hospital_name: string;
  latitude?: string | null;
  longitude?: string | null;
  available_from: string;
  available_to: string;
  phone_number: string;
}

export interface DoctorAvailability {
  is_available: boolean;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Appointment {
  id: number;
  user: number;
  doctor: number;
  scheduled_time: string;
  status: AppointmentStatus;
  reason: string;
  created_at: string;
}

export interface BookAppointmentPayload {
  doctor: number;
  scheduled_time: string;
  reason: string;
}

export interface UpdateAppointmentPayload {
  scheduled_time?: string;
  reason?: string;
  status?: 'pending' | 'cancelled';
}

export interface UpdateAppointmentStatusPayload {
  status: 'confirmed' | 'cancelled';
}
