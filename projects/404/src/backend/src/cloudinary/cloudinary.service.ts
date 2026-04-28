import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import type { UploadOptions } from './interfaces/upload.interface';

@Injectable()
export class CloudinaryUploadsService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    options: UploadOptions = {},
  ): Promise<UploadApiResponse> {
    const {
      folder = 'caredevi',
      fileType = 'image',
      maxSizeInMB = 5,
    } = options;

    this.validateFile(file, fileType, maxSizeInMB);

    return new Promise((resolve, reject) => {
      const uploadOptions: Record<string, unknown> = {
        folder,
        resource_type: 'auto',
      };

      if (fileType === 'image') {
        uploadOptions.quality = 'auto';
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) return reject(new Error(error.message));
          if (result) resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadFiles(
    files: Express.Multer.File[],
    options: UploadOptions = {},
  ): Promise<UploadApiResponse[]> {
    const { maxFiles } = options;

    if (maxFiles && files.length > maxFiles) {
      throw new BadRequestException(
        `Maximum ${maxFiles} files allowed, but ${files.length} provided`,
      );
    }

    const uploadPromises = files.map((file) => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }

  async uploadBuffer(
    buffer: Buffer,
    options: { folder?: string; filename?: string } = {},
  ): Promise<UploadApiResponse> {
    const { folder = 'caredevi', filename } = options;
    return new Promise((resolve, reject) => {
      const uploadOptions: Record<string, unknown> = {
        folder,
        resource_type: 'image',
        format: 'pdf',
        access_mode: 'public',
        type: 'upload',
      };
      if (filename) {
        uploadOptions.public_id = filename;
      }
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) return reject(new Error(error.message));
          if (result) resolve(result);
        },
      );
      uploadStream.end(buffer);
    });
  }

  async deleteFile(publicId: string): Promise<unknown> {
    return cloudinary.uploader.destroy(publicId);
  }

  async deleteFiles(publicIds: string[]): Promise<unknown> {
    return cloudinary.api.delete_resources(publicIds);
  }

  private validateFile(
    file: Express.Multer.File,
    fileType: string,
    maxSizeInMB: number,
  ): void {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      throw new BadRequestException(`File size exceeds ${maxSizeInMB}MB limit`);
    }

    const validMimeTypes = this.getValidMimeTypes(fileType);
    if (!validMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Expected ${fileType}, got ${file.mimetype}`,
      );
    }
  }

  private getValidMimeTypes(fileType: string): string[] {
    switch (fileType) {
      case 'image':
        return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      case 'pdf':
        return ['application/pdf'];
      case 'document':
        return [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
      default:
        return [];
    }
  }

  extractPublicId(url: string): string {
    const parts = url.split('/');
    const publicIdWithExt = parts.slice(-2).join('/');
    return publicIdWithExt.replace(/\.[^/.]+$/, '');
  }
}
