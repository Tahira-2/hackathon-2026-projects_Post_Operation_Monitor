import { Module } from '@nestjs/common';
import { AppointmentModule } from './appointment/appointment.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AvailabilityModule } from './availability/availability.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SpecializationsModule } from './specializations/specializations.module';
import { MedicineModule } from './medicine/medicine.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AppointmentModule,
    AuthModule,
    AvailabilityModule,
    NotificationsModule,
    SpecializationsModule,
    UsersModule,
    MedicineModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
