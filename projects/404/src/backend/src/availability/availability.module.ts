import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';

@Module({
  controllers: [AvailabilityController],
  providers: [AvailabilityService, PrismaService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
