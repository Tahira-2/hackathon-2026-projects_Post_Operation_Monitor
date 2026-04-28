import type { DoctorProfile } from './auth-api'
import { useAuthStore } from '../stores/authStore'
import { useProfileStore } from '../stores/profileStore'

export function syncDoctorToStores(doctor: DoctorProfile, token?: string) {
  const authStore = useAuthStore.getState()
  const profileStore = useProfileStore.getState()

  if (token) {
    authStore.setAuth(token, doctor)
  } else {
    authStore.setDoctor(doctor)
  }

  profileStore.hydrateFromDoctor(doctor)
}

export function clearDoctorSession() {
  useAuthStore.getState().clearAuth()
  useProfileStore.getState().resetProfile()
}
