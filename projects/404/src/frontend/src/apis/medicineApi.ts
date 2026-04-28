import { baseApi } from "./baseApi";

export const medicineApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMedicines: builder.query<any, Record<string, any>>({
      query: (params) => ({
        url: "/medicines",
        params,
      }),
      providesTags: ["Admin"],
    }),
    createMedicine: builder.mutation<any, any>({
      query: (body) => ({
        url: "/medicines",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Admin"],
    }),
    updateMedicine: builder.mutation<any, {id: string; body: any}>({
      query: ({ id, body }) => ({
        url: `/medicines/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Admin"],
    }),
    deleteMedicine: builder.mutation<any, string>({
      query: (id) => ({
        url: `/medicines/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admin"],
    }),
  }),
});

export const {
  useGetMedicinesQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
} = medicineApi;
