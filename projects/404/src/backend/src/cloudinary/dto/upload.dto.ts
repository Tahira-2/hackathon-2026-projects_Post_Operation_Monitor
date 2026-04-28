import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { FileType } from '../enums/file-type.enum';

export class UploadFileDto {
  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsEnum(FileType)
  fileType?: FileType;

  @IsOptional()
  @IsNumber()
  maxSizeInMB?: number;
}

export class UploadFilesDto extends UploadFileDto {
  @IsOptional()
  @IsNumber()
  maxFiles?: number;
}
