import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SpecializationsController } from './specializations.controller';
import { SpecializationsService } from './specializations.service';

@Module({
  controllers: [SpecializationsController],
  providers: [SpecializationsService, PrismaService],
  exports: [SpecializationsService],
})
export class SpecializationsModule {}
