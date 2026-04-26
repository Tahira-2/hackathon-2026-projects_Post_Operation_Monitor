import { IsString, IsNotEmpty } from 'class-validator';

export class SaveChunkDto {
  @IsString()
  @IsNotEmpty()
  speaker: string; // "Doctor" | "Patient"

  @IsString()
  @IsNotEmpty()
  audioBase64: string; // base64-encoded WebM/Opus audio chunk
}
