import { Module } from '@nestjs/common';
import { AppointmentModule } from './appointment/appointment.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CallsModule } from './calls/calls.module';
import { AvailabilityModule } from './availability/availability.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SpecializationsModule } from './specializations/specializations.module';
import { MedicineModule } from './medicine/medicine.module';
import { UsersModule } from './users/users.module';
import { CloudinaryUploadsModule } from './cloudinary/cloudinary.module';
import { TranscriptModule } from './transcript/transcript.module';
@Module({
  imports: [
    AppointmentModule,
    AuthModule,
    CallsModule,
    AvailabilityModule,
    ChatModule,
    NotificationsModule,
    SpecializationsModule,
    UsersModule,
    MedicineModule,
    CloudinaryUploadsModule,
    TranscriptModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
