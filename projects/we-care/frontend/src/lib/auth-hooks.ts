import { useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  forgotPassword,
  getDoctorById,
  getDoctorProfile,
  getDoctorProfileLookups,
  RESET_PASSWORD_TOKEN_KEY,
  resetPassword,
  signIn,
  signOut,
  signUp,
  updateDoctorProfile,
  uploadDoctorAvatar,
  type UpdateDoctorProfilePayload,
} from './auth-api'
import { getDashboardSummary, type DashboardSummary } from './dashboard-api'
import { clearDoctorSession, syncDoctorToStores } from './doctor-session'
import { queryKeys } from './query-keys'
import type { ReferralViewType } from './referral-view'
import { useAuthStore } from '../stores/authStore'

function readRecoveryToken() {
  const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
  const hashToken = hashParams.get('access_token')
  const hashType = hashParams.get('type')
  const queryToken = new URLSearchParams(window.location.search).get('access_token')
  const storedToken = sessionStorage.getItem(RESET_PASSWORD_TOKEN_KEY)

  if (hashToken && hashType === 'recovery') {
    sessionStorage.setItem(RESET_PASSWORD_TOKEN_KEY, hashToken)
    window.history.replaceState({}, '', '/reset-password')
    return hashToken
  }

  return hashToken ?? queryToken ?? storedToken
}

export function useRecoveryToken() {
  return useMemo(readRecoveryToken, [])
}

export function useDoctorProfileQuery() {
  const token = useAuthStore((state) => state.token)

  return useQuery({
    queryKey: queryKeys.doctorProfile,
    queryFn: getDoctorProfile,
    enabled: Boolean(token),
    retry: false,
  })
}

export function useDoctorByIdQuery(doctorId: string) {
  return useQuery({
    queryKey: queryKeys.doctorById(doctorId),
    queryFn: () => getDoctorById(doctorId),
    enabled: Boolean(doctorId),
  })
}

export function useDashboardQuery(viewType: ReferralViewType) {
  return useQuery<DashboardSummary>({
    queryKey: queryKeys.dashboard(viewType),
    queryFn: () => getDashboardSummary(viewType),
  })
}

export function useAuthBootstrap() {
  const token = useAuthStore((state) => state.token)
  const setToken = useAuthStore((state) => state.setToken)
  const setInitialized = useAuthStore((state) => state.setInitialized)
  const recoveryToken = useRecoveryToken()
  const doctorProfileQuery = useDoctorProfileQuery()

  useEffect(() => {
    if (recoveryToken) {
      clearDoctorSession()
      return
    }

    if (!token) {
      setInitialized()
      return
    }

    setToken(token)
  }, [recoveryToken, setInitialized, setToken, token])

  useEffect(() => {
    if (!token || recoveryToken) return
    if (!doctorProfileQuery.data) return

    syncDoctorToStores(doctorProfileQuery.data)
    setInitialized()
  }, [doctorProfileQuery.data, recoveryToken, setInitialized, token])

  useEffect(() => {
    if (!token || recoveryToken) return
    if (!doctorProfileQuery.isError) return

    clearDoctorSession()
  }, [doctorProfileQuery.isError, recoveryToken, token])
}

export function useDoctorProfileLookupsQuery() {
  return useQuery({
    queryKey: queryKeys.doctorLookups,
    queryFn: getDoctorProfileLookups,
  })
}

export function useSignInMutation() {
  return useMutation({
    mutationFn: signIn,
    onSuccess: (data) => {
      syncDoctorToStores(data.doctor, data.accessToken)
      useAuthStore.getState().setInitialized()
    },
  })
}

export function useSignUpMutation() {
  return useMutation({
    mutationFn: signUp,
  })
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: forgotPassword,
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({ accessToken, newPassword }: { accessToken: string; newPassword: string }) =>
      resetPassword(accessToken, newPassword),
    onSuccess: () => {
      sessionStorage.removeItem(RESET_PASSWORD_TOKEN_KEY)
    },
  })
}

export function useSignOutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: signOut,
    onSettled: async () => {
      clearDoctorSession()
      await queryClient.removeQueries()
    },
  })
}

export function useUpdateDoctorProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateDoctorProfilePayload) => updateDoctorProfile(payload),
    onSuccess: (doctor) => {
      syncDoctorToStores(doctor)
      void queryClient.setQueryData(queryKeys.doctorProfile, doctor)
    },
  })
}

export function useUploadDoctorAvatarMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uploadDoctorAvatar,
    onSuccess: async () => {
      const doctor = await queryClient.fetchQuery({
        queryKey: queryKeys.doctorProfile,
        queryFn: getDoctorProfile,
      })

      syncDoctorToStores(doctor)
    },
  })
}
