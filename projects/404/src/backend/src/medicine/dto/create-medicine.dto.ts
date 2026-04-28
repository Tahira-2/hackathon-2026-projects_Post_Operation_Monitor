import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicineCategory, MedicineForm } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

const trimString = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim() : value;

const trimOptionalString = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim() || undefined : value;

export class CreateMedicineDto {
  @ApiProperty({ example: 'Paracetamol 500mg' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) => trimString(value))
  name!: string;

  @ApiProperty({ enum: MedicineForm, example: MedicineForm.TABLET })
  @IsEnum(MedicineForm)
  form!: MedicineForm;

  @ApiPropertyOptional({
    enum: MedicineCategory,
    example: MedicineCategory.OTC,
  })
  @IsOptional()
  @IsEnum(MedicineCategory)
  category?: MedicineCategory;

  @ApiPropertyOptional({ example: 'N02BE01' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  rxnormCode?: string;

  @ApiPropertyOptional({ example: 'Analgesic' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  drugClass?: string;

  @ApiPropertyOptional({ example: 'Pain reliever and fever reducer.' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  description?: string;

  @ApiPropertyOptional({ example: 'Acme Pharma' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  manufacturer?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/medicine/paracetamol.png',
  })
  @IsOptional()
  @IsUrl()
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  imageUrl?: string;
}
