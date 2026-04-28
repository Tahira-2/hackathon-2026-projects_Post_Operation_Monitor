import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TranscriptService } from './transcript.service';
import { TranscriptController } from './transcript.controller';
import { PrismaService } from '../prisma.service';
import { CallsModule } from '../calls/calls.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => CallsModule),
  ],
  controllers: [TranscriptController],
  providers: [TranscriptService, PrismaService],
  exports: [TranscriptService],
})
export class TranscriptModule {}
