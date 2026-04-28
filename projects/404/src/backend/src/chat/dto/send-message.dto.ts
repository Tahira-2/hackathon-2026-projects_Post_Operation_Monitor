import { MessageSender } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId!: string;

  @IsOptional()
  @IsString()
  senderId?: string;

  @IsOptional()
  @IsEnum(MessageSender)
  senderType?: MessageSender;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  conversationId!: string;
}
