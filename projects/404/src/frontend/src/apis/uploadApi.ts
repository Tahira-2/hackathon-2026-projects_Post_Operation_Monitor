import { baseApi } from "./baseApi";

export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    publicId: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
  };
}

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({
        url: "/cloudinary-uploads/single",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const { useUploadImageMutation } = uploadApi;
