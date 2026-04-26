export const API_ENDPOINTS = {
  auth: {
    refresh: '/token/refresh/',
  },
  users: {
    register: '/users/register/',
    login: '/users/login/',
    me: '/users/me/',
    updateMe: '/users/me/update/',
    uploadPhoto: '/users/me/photo/',
    location: '/users/location/',
    updateLocation: '/users/location/update/',
  },
  doctors: {
    list: '/doctors/',
    create: '/doctors/create/',
    nearby: '/doctors/nearby/',
  },
  appointments: {
    root: '/appointments/',
    slots: '/appointments/slots/',
    doctor: '/appointments/doctor/',
  },
  medicines: {
    list: '/medicines/',
  },
  orders: {
    root: '/orders/',
  },
} as const;

export const doctorDetailEndpoint = (id: number) => `/doctors/${id}/`;
export const doctorAvailabilityEndpoint = (id: number) => `/doctors/${id}/availability/`;
export const appointmentEndpoint = (id: number) => `/appointments/${id}/`;
export const appointmentStatusEndpoint = (id: number) => `/appointments/${id}/status/`;
export const appointmentReportEndpoint = (id: number) => `/appointments/${id}/report/`;
export const appointmentSlotEndpoint = (id: number) => `/appointments/slots/${id}/`;
export const availableSlotsEndpoint = (doctorId: number) => `/appointments/available/${doctorId}/`;
export const medicineDetailEndpoint = (id: number) => `/medicines/${id}/`;
export const orderDetailEndpoint = (id: number) => `/orders/${id}/`;
