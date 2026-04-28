import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const trimOptionalString = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim() || undefined : value;

export class ListMedicinesQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @ApiPropertyOptional({ example: 'para' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  search?: string;

  @ApiPropertyOptional({ example: 'PRESCRIPTION' })
  @IsOptional()
  @IsString()
  category?: string;
}
