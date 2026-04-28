import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CallStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

import { TranscriptService } from '../transcript/transcript.service';
import { forwardRef, Inject } from '@nestjs/common';

const callSessionSelect = {
  id: true,
  appointmentId: true,
  doctorId: true,
  patientId: true,
  status: true,
  startedAt: true,
  endedAt: true,
} satisfies Prisma.CallSessionSelect;

type IceServer = {
  urls: string[];
  username?: string;
  credential?: string;
};

@Injectable()
export class CallsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => TranscriptService))
    private readonly transcriptService: TranscriptService,
  ) {}

  async getSessionByAppointmentId(appointmentId: string) {
    return this.prisma.callSession.findUnique({
      where: { appointmentId },
      select: callSessionSelect,
    });
  }

  async getIceServers() {
    const servers: IceServer[] = [
      { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
    ];

    const turnUrls = process.env.TURN_URLS;
    const turnUsername = process.env.TURN_USERNAME;
    const turnCredential = process.env.TURN_CREDENTIAL;

    if (turnUrls && turnUsername && turnCredential) {
      servers.push({
        urls: turnUrls.split(','),
        username: turnUsername,
        credential: turnCredential,
      });
    }

    return servers;
  }

  async initiateCall(appointmentId: string, userId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        doctorId: true,
        patientId: true,
        doctor: { select: { userId: true } },
        patient: { select: { userId: true } },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const doctorUserId = appointment.doctor.userId;
    const patientUserId = appointment.patient.userId;

    if (userId !== doctorUserId && userId !== patientUserId) {
      throw new ForbiddenException('Not allowed to call');
    }

    const existing = await this.prisma.callSession.findUnique({
      where: { appointmentId },
      select: callSessionSelect,
    });

    // Allow joining INITIATED and ONGOING sessions (participant reconnect).
    // Only reset ENDED sessions back to INITIATED.
    const session = await this.prisma.callSession.upsert({
      where: { appointmentId },
      update:
        existing?.status === CallStatus.ENDED
          ? { status: CallStatus.INITIATED, startedAt: null, endedAt: null }
          : {}, // keep INITIATED or ONGOING as-is
      create: {
        appointmentId,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        status: CallStatus.INITIATED,
      },
      select: callSessionSelect,
    });

    const calleeUserId = userId === doctorUserId ? patientUserId : doctorUserId;

    return {
      session,
      calleeUserId,
    };
  }


  async acceptCall(callSessionId: string, userId: string) {
    const session = await this.ensureParticipant(callSessionId, userId);

    // Only reject if the call has ended
    if (session.status === CallStatus.ENDED || session.status === CallStatus.MISSED) {
      throw new BadRequestException('Call is not available');
    }

    return this.prisma.callSession.update({
      where: { id: callSessionId },
      data: {
        status: CallStatus.ONGOING,
        startedAt: session.status === CallStatus.INITIATED ? new Date() : undefined,
      },
      select: callSessionSelect,
    });
  }


  async rejectCall(callSessionId: string, userId: string) {
    await this.ensureParticipant(callSessionId, userId);

    return this.prisma.callSession.update({
      where: { id: callSessionId },
      data: { status: CallStatus.MISSED, endedAt: new Date() },
      select: callSessionSelect,
    });
  }

  async endCall(callSessionId: string, userId: string) {
    await this.ensureParticipant(callSessionId, userId);

    const session = await this.prisma.callSession.update({
      where: { id: callSessionId },
      data: { status: CallStatus.ENDED, endedAt: new Date() },
      select: callSessionSelect,
    });

    // Trigger ML extraction and summary generation
    try {
      console.log(`[calls] triggering summary generation for session: ${callSessionId}`);
      await this.transcriptService.generateSummary(callSessionId);
    } catch (err) {
      console.error(`[calls] failed to generate summary:`, err);
    }

    return session;
  }

  async assertParticipant(callSessionId: string, userId: string) {
    await this.ensureParticipant(callSessionId, userId);
  }

  private async ensureParticipant(callSessionId: string, userId: string) {
    const session = await this.prisma.callSession.findUnique({
      where: { id: callSessionId },
      select: {
        id: true,
        status: true,
        doctorId: true,
        patientId: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Call session not found');
    }

    const [doctor, patient] = await this.prisma.$transaction([
      this.prisma.doctor.findUnique({
        where: { id: session.doctorId },
        select: { userId: true },
      }),
      this.prisma.patient.findUnique({
        where: { id: session.patientId },
        select: { userId: true },
      }),
    ]);

    if (!doctor || !patient) {
      throw new NotFoundException('Call participants not found');
    }

    if (doctor.userId !== userId && patient.userId !== userId) {
      throw new ForbiddenException('Not allowed');
    }

    return session;
  }
}
