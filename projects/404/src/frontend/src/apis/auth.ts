import { baseApi } from "./baseApi";
import type { LoginRequest, AuthResponse, SignupRequest } from "@/types/auth";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    patientLogin: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/patient/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth", "Patient"],
    }),
    doctorLogin: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/doctor/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth", "Physician"],
    }),
    adminLogin: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/admin/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth", "Admin"],
    }),
    patientSignup: builder.mutation<AuthResponse, SignupRequest>({
      query: (userData) => ({
        url: "/auth/patient/signup",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Auth", "Patient"],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "User"],
    }),
  }),
});

export const {
  usePatientLoginMutation,
  useDoctorLoginMutation,
  useAdminLoginMutation,
  usePatientSignupMutation,
  useLogoutMutation,
} = authApi;
