import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { McpService } from './mcp.service';
import { MedicineModule } from '../medicine/medicine.module';
import { SpecializationsModule } from '../specializations/specializations.module';
import { UsersModule } from '../users/users.module';
import { AppointmentModule } from '../appointment/appointment.module';
import { AvailabilityModule } from '../availability/availability.module';

@Module({
  imports: [
    MedicineModule,
    SpecializationsModule,
    UsersModule,
    AppointmentModule,
    AvailabilityModule,
  ],
  providers: [McpService, PrismaService],
  exports: [McpService],
})
export class McpModule {}
