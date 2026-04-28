import { baseApi } from "./baseApi";

export const appointmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAppointments: builder.query<any, { doctorId?: string; patientId?: string }>({
      query: (params) => ({
        url: "/appointments",
        params,
      }),
      providesTags: ["Appointment"],
    }),
    createAppointment: builder.mutation<any, any>({
      query: (body) => ({
        url: "/appointments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Appointment", "Availability"],
    }),
    updateAppointment: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/appointments/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Appointment", "Availability"],
    }),
    deleteAppointment: builder.mutation<any, string>({
      query: (id) => ({
        url: `/appointments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Appointment", "Availability"],
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
} = appointmentsApi;
