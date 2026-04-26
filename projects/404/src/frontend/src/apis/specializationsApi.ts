import { baseApi } from "./baseApi";

export const specializationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSpecializations: builder.query<any, Record<string, any>>({
      query: (params) => ({
        url: "/specializations",
        params,
      }),
      providesTags: ["Admin"], // Will be updated to better tag
    }),
    createSpecialization: builder.mutation<any, any>({
      query: (body) => ({
        url: "/specializations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Admin"],
    }),
    updateSpecialization: builder.mutation<any, {id: string; body: any}>({
      query: ({ id, body }) => ({
        url: `/specializations/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Admin"],
    }),
    deleteSpecialization: builder.mutation<any, string>({
      query: (id) => ({
        url: `/specializations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admin"],
    }),
  }),
});

export const {
  useGetSpecializationsQuery,
  useCreateSpecializationMutation,
  useUpdateSpecializationMutation,
  useDeleteSpecializationMutation,
} = specializationsApi;
