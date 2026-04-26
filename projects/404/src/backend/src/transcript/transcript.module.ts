import { Module } from '@nestjs/common';
import { TranscriptService } from './transcript.service';
import { TranscriptController } from './transcript.controller';
import { PrismaService } from '../prisma.service';

import { CallsModule } from '../calls/calls.module';

@Module({
  imports: [CallsModule],
  controllers: [TranscriptController],
  providers: [TranscriptService, PrismaService],
  exports: [TranscriptService],
})
export class TranscriptModule {}
