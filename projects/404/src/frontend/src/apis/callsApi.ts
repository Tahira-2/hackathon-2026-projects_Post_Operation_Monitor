import { baseApi } from "./baseApi";

export const callsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    endCall: builder.mutation<any, { callSessionId: string }>({
      query: ({ callSessionId }) => ({
        url: `calls/end`, // I need to verify this endpoint exists on backend controller
        method: "POST",
        body: { callSessionId },
      }),
    }),
  }),
});

export const { useEndCallMutation } = callsApi;
