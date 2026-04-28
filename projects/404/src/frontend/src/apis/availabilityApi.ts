import { baseApi } from "./baseApi";

export const availabilityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkingHours: builder.query<any, { doctorId?: string }>({
      query: (params) => ({
        url: "/availability/working-hours",
        params,
      }),
      providesTags: ["Availability"],
    }),
    upsertWorkingHours: builder.mutation<any, any>({
      query: (body) => ({
        url: "/availability/working-hours",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Availability"],
    }),
    deleteWorkingHours: builder.mutation<any, { day: string; doctorId?: string }>({
      query: ({ day, doctorId }) => ({
        url: `/availability/working-hours/${day}`,
        method: "DELETE",
        params: doctorId ? { doctorId } : undefined,
      }),
      invalidatesTags: ["Availability"],
    }),
    getBusyBlocks: builder.query<any, { doctorId?: string; from?: string; to?: string }>({
      query: (params) => ({
        url: "/availability/busy-blocks",
        params,
      }),
      providesTags: ["Availability"],
    }),
    createBusyBlock: builder.mutation<any, any>({
      query: (body) => ({
        url: "/availability/busy-blocks",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Availability"],
    }),
    deleteBusyBlock: builder.mutation<any, string>({
      query: (id) => ({
        url: `/availability/busy-blocks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Availability"],
    }),
    getAvailableSlots: builder.query<any, { doctorId?: string; date: string; slotMinutes?: number }>({
      query: (params) => ({
        url: "/availability/slots",
        params,
      }),
      providesTags: ["Availability"],
    }),
  }),
});

export const {
  useGetWorkingHoursQuery,
  useUpsertWorkingHoursMutation,
  useDeleteWorkingHoursMutation,
  useGetBusyBlocksQuery,
  useCreateBusyBlockMutation,
  useDeleteBusyBlockMutation,
  useGetAvailableSlotsQuery,
} = availabilityApi;
