import { baseApi } from "./baseApi";

export interface ConsultationSummary {
  id: string;
  callSessionId: string;
  summary: string;
  diagnoses: string[];
  medications: string[];
  followUp: string | null;
  isMedicationApplied: boolean;
  createdAt: string;
}

export const transcriptApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSummary: builder.query<ConsultationSummary, string>({
      query: (callSessionId) => `transcript/${callSessionId}/summary`,
      providesTags: (result, error, arg) => [{ type: "ConsultationSummary" as const, id: arg }],
    }),
    applyMedications: builder.mutation<ConsultationSummary, string>({
      query: (callSessionId) => ({
        url: `transcript/${callSessionId}/apply-medications`,
        method: "POST",
      }),
    }),
    generateSummary: builder.mutation<ConsultationSummary, string>({
      query: (callSessionId) => ({
        url: `transcript/${callSessionId}/summary`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "ConsultationSummary" as const, id: arg },
        "ConsultationSummary"
      ],
    }),
    getHistory: builder.query<any[], string>({
      query: (patientId) => `transcript/history/${patientId}`,
      providesTags: ["ConsultationSummary"],
    }),
  }),
});

export const { 
  useGetSummaryQuery, 
  useApplyMedicationsMutation,
  useGetHistoryQuery,
  useGenerateSummaryMutation
} = transcriptApi;
