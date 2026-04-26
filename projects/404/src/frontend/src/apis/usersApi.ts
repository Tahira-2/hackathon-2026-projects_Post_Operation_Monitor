import { baseApi } from "./baseApi";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<any, Record<string, any>>({
      query: (params) => ({
        url: "/users",
        params,
      }),
      providesTags: ["User"],
    }),
    getDoctors: builder.query<any, Record<string, any>>({
      query: (params) => ({
        url: "/users/doctors",
        params,
      }),
      providesTags: ["User"],
    }),
    getUser: builder.query<any, string>({
      query: (id) => ({
        url: `/users/${id}`,
      }),
      providesTags: (_result, _error, id) => [{ type: "User", id: String(id) }],
    }),
    createUser: builder.mutation<any, any>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation<any, {id: string; body: any}>({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation<any, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    getMedications: builder.query<any[], string>({
      query: (patientId) => `/users/patient/${patientId}/medications`,
      providesTags: ["Medication"],
    }),
    getCarePlans: builder.query<any[], string>({
      query: (patientId) => `/users/patient/${patientId}/care-plans`,
      providesTags: ["CarePlan"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetDoctorsQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetMedicationsQuery,
  useGetCarePlansQuery,
} = usersApi;
