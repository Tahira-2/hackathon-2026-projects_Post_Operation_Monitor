import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CallStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

const appointmentSelect = {
  id: true,
  doctorId: true,
  patientId: true,
  status: true,
  startTime: true,
  endTime: true,
  reason: true,
  isVirtual: true,
  createdAt: true,
  doctor: {
    select: {
      id: true,
      user: {
        select: {
          fullName: true,
          email: true,
        }
      }
    }
  },
  patient: {
    select: {
      id: true,
      user: {
        select: {
          fullName: true,
          email: true,
        }
      }
    }
  },
  callSession: {
    select: {
      id: true,
      status: true,
    }
  },
} satisfies Prisma.AppointmentSelect;

export type AppointmentResponse = Prisma.AppointmentGetPayload<{
  select: typeof appointmentSelect;
}>;

@Injectable()
export class AppointmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAppointmentDto): Promise<AppointmentResponse> {
    this.ensureStartBeforeEnd(data.startTime, data.endTime);
    await this.ensureDoctorAndPatientExist(data.doctorId, data.patientId);

    return this.prisma.appointment.create({
      data: {
        status: data.status,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        reason: data.reason,
        isVirtual: data.isVirtual ?? true,
        doctor: { connect: { id: data.doctorId } },
        patient: { connect: { id: data.patientId } },
      },
      select: appointmentSelect,
    });
  }

  async findAll(filters: {
    doctorId?: string;
    patientId?: string;
  }): Promise<AppointmentResponse[]> {
    return this.prisma.appointment.findMany({
      where: {
        doctorId: filters.doctorId,
        patientId: filters.patientId,
      },
      orderBy: { startTime: 'asc' },
      select: appointmentSelect,
    });
  }

  async findOne(id: string): Promise<AppointmentResponse> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      select: appointmentSelect,
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async update(
    id: string,
    data: UpdateAppointmentDto,
  ): Promise<AppointmentResponse> {
    const existingAppointment = await this.prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        doctorId: true,
        patientId: true,
        startTime: true,
        endTime: true,
        patient: {
          select: { userId: true },
        },
      },
    });

    if (!existingAppointment) {
      throw new NotFoundException('Appointment not found');
    }

    const doctorId = data.doctorId ?? existingAppointment.doctorId;
    const patientId = data.patientId ?? existingAppointment.patientId;
    const nextStartTime = data.startTime
      ? new Date(data.startTime)
      : existingAppointment.startTime;
    const nextEndTime = data.endTime
      ? new Date(data.endTime)
      : existingAppointment.endTime;

    this.ensureStartBeforeEnd(nextStartTime, nextEndTime);

    if (doctorId !== existingAppointment.doctorId) {
      await this.ensureDoctorExists(doctorId);
    }

    if (patientId !== existingAppointment.patientId) {
      await this.ensurePatientExists(patientId);
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        doctorId,
        patientId,
        status: data.status,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        reason: data.reason,
        isVirtual: data.isVirtual,
      },
      select: appointmentSelect,
    });

    // Auto-create a CallSession when appointment is confirmed
    if (data.status === 'CONFIRMED') {
      await this.prisma.$transaction([
        this.prisma.callSession.upsert({
          where: { appointmentId: id },
          update: { status: CallStatus.INITIATED },
          create: {
            appointmentId: id,
            doctorId: existingAppointment.doctorId,
            patientId: existingAppointment.patientId,
            status: CallStatus.INITIATED,
          },
        }),
        this.prisma.notification.create({
          data: {
            userId: existingAppointment.patient.userId,
            title: 'Appointment Confirmed',
            message: 'Your upcoming appointment has been confirmed by the physician.',
            type: 'APPOINTMENT_UPDATE',
          },
        }),
      ]);

      // Re-fetch so the response includes the new callSession
      return this.prisma.appointment.findUniqueOrThrow({
        where: { id },
        select: appointmentSelect,
      });
    }

    return updated;
  }

  async remove(id: string): Promise<AppointmentResponse> {
    await this.ensureAppointmentExists(id);

    return this.prisma.appointment.delete({
      where: { id },
      select: appointmentSelect,
    });
  }

  private ensureStartBeforeEnd(
    startTime: string | Date,
    endTime: string | Date,
  ): void {
    const start = startTime instanceof Date ? startTime : new Date(startTime);
    const end = endTime instanceof Date ? endTime : new Date(endTime);

    if (start.getTime() >= end.getTime()) {
      throw new BadRequestException('startTime must be before endTime');
    }
  }

  private async ensureAppointmentExists(id: string): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
  }

  private async ensureDoctorAndPatientExist(
    doctorId: string,
    patientId: string,
  ): Promise<void> {
    const [doctor, patient] = await this.prisma.$transaction([
      this.prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { id: true },
      }),
      this.prisma.patient.findUnique({
        where: { id: patientId },
        select: { id: true },
      }),
    ]);

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
  }

  private async ensureDoctorExists(doctorId: string): Promise<void> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { id: true },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
  }

  private async ensurePatientExists(patientId: string): Promise<void> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
  }
}
