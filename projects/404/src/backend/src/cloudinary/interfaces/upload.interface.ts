export interface UploadOptions {
  folder?: string;
  fileType?: string;
  maxSizeInMB?: number;
  maxFiles?: number;
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
}
