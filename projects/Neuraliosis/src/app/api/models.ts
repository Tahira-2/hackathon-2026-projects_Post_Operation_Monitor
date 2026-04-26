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
  profile_photo: string | null;
  photo_url: string | null;
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
  doctor_name: string | null;
  specialization: string;
  hospital_name: string;
  latitude: string | null;
  longitude: string | null;
  available_from: string;
  available_to: string;
  phone_number: string;
  profile_photo: string | null;
  photo_url: string | null;
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

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface AppointmentSlot {
  id: number;
  doctor: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  created_at: string;
}

export interface CreateSlotPayload {
  date: string;
  start_time: string;
  end_time: string;
}

export interface Appointment {
  id: number;
  user: number;
  doctor: number;
  slot: number | null;
  scheduled_time: string;
  status: AppointmentStatus;
  reason: string;
  created_at: string;
}

export interface BookAppointmentPayload {
  doctor: number;
  scheduled_time: string;
  reason: string;
  slot?: number;
}

export interface UpdateAppointmentPayload {
  scheduled_time?: string;
  reason?: string;
  status?: 'pending' | 'cancelled';
}

export interface UpdateAppointmentStatusPayload {
  status: 'confirmed' | 'cancelled' | 'completed';
}

export interface AppointmentReport {
  id: number;
  appointment: number;
  diagnosis: string;
  notes: string;
  suggestions: string;
  prescriptions: string;
  report_file: string | null;
  created_at: string;
}

export interface CreateReportPayload {
  diagnosis: string;
  notes?: string;
  suggestions?: string;
  prescriptions?: string;
}

export interface Medicine {
  id: number;
  name: string;
  description: string;
  category: string;
  price: string;
  stock: number;
  image: string | null;
  image_url: string | null;
  requires_prescription: boolean;
  created_at: string;
}

export interface OrderItem {
  id: number;
  medicine: number;
  medicine_detail: Medicine;
  quantity: number;
  price: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Order {
  id: number;
  user: number;
  status: OrderStatus;
  total: string;
  items: OrderItem[];
  created_at: string;
}

export interface PlaceOrderItemPayload {
  medicine_id: number;
  quantity: number;
}

export interface PlaceOrderPayload {
  items: PlaceOrderItemPayload[];
}
