export const API_ENDPOINTS = {
  auth: {
    refresh: '/token/refresh/',
  },
  users: {
    register: '/users/register/',
    login: '/users/login/',
    me: '/users/me/',
    updateMe: '/users/me/update/',
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
  },
} as const;

export const doctorDetailEndpoint = (id: number) => `/doctors/${id}/`;
export const doctorAvailabilityEndpoint = (id: number) => `/doctors/${id}/availability/`;
export const appointmentEndpoint = (id: number) => `/appointments/${id}/`;
export const appointmentStatusEndpoint = (id: number) => `/appointments/${id}/status/`;
