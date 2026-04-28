import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { BlockType, WeekDay } from '@prisma/client';
import { PrismaService } from '../prisma.service';

const workingHoursSelect = {
  id: true,
  doctorId: true,
  day: true,
  startTime: true,
  endTime: true,
};

const busyBlockSelect = {
  id: true,
  doctorId: true,
  startTime: true,
  endTime: true,
  type: true,
  reason: true,
};

const weekDays: WeekDay[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertWorkingHours(
    doctorId: string,
    day: WeekDay,
    startTime: string,
    endTime: string,
  ) {
    this.assertTimeRange(startTime, endTime);
    return this.prisma.workingHours.upsert({
      where: { doctorId_day: { doctorId, day } },
      update: { startTime, endTime },
      create: { doctorId, day, startTime, endTime },
      select: workingHoursSelect,
    });
  }

  async listWorkingHours(doctorId: string) {
    return this.prisma.workingHours.findMany({
      where: { doctorId },
      orderBy: { day: 'asc' },
      select: workingHoursSelect,
    });
  }

  async deleteWorkingHours(doctorId: string, day: WeekDay) {
    await this.prisma.workingHours.delete({
      where: { doctorId_day: { doctorId, day } },
      select: { id: true },
    });
    return { success: true };
  }

  async createBusyBlock(
    doctorId: string,
    startTime: string,
    endTime: string,
    type: BlockType,
    reason?: string,
  ) {
    const start = this.parseDateTime(startTime);
    const end = this.parseDateTime(endTime);

    if (start >= end) {
      throw new BadRequestException('Invalid time range');
    }

    return this.prisma.busyBlock.create({
      data: { doctorId, startTime: start, endTime: end, type, reason },
      select: busyBlockSelect,
    });
  }

  async listBusyBlocks(doctorId: string, from?: string, to?: string) {
    const where: {
      doctorId: string;
      startTime?: { gte: Date };
      endTime?: { lte: Date };
    } = { doctorId };

    if (from) {
      where.startTime = { gte: this.parseDateTime(from) };
    }

    if (to) {
      where.endTime = { lte: this.parseDateTime(to) };
    }

    return this.prisma.busyBlock.findMany({
      where,
      orderBy: { startTime: 'asc' },
      select: busyBlockSelect,
    });
  }

  async deleteBusyBlock(id: string) {
    await this.prisma.busyBlock.delete({ where: { id }, select: { id: true } });
    return { success: true };
  }

  async listAvailableSlots(
    doctorId: string,
    date: string,
    slotMinutes: number,
  ) {
    const targetDate = this.parseDate(date);
    const day = weekDays[targetDate.getDay()];
    const workingHours = await this.prisma.workingHours.findUnique({
      where: { doctorId_day: { doctorId, day } },
      select: workingHoursSelect,
    });

    if (!workingHours) {
      return [];
    }

    const { start, end } = this.buildDayRange(targetDate, workingHours);
    const slots = this.generateSlots(start, end, slotMinutes);

    if (slots.length === 0) {
      return [];
    }

    const [busyBlocks, appointments] = await this.prisma.$transaction([
      this.prisma.busyBlock.findMany({
        where: {
          doctorId,
          startTime: { lt: end },
          endTime: { gt: start },
        },
        select: busyBlockSelect,
      }),
      this.prisma.appointment.findMany({
        where: {
          doctorId,
          startTime: { lt: end },
          endTime: { gt: start },
        },
        select: { id: true, startTime: true, endTime: true },
      }),
    ]);

    return slots.filter((slot) =>
      this.isSlotAvailable(slot.start, slot.end, busyBlocks, appointments),
    );
  }

  async validateSlot(doctorId: string, startTime: string, endTime: string) {
    const start = this.parseDateTime(startTime);
    const end = this.parseDateTime(endTime);

    if (start >= end) {
      throw new BadRequestException('Invalid time range');
    }

    const [busyBlocks, appointments] = await this.prisma.$transaction([
      this.prisma.busyBlock.findMany({
        where: {
          doctorId,
          startTime: { lt: end },
          endTime: { gt: start },
        },
        select: busyBlockSelect,
      }),
      this.prisma.appointment.findMany({
        where: {
          doctorId,
          startTime: { lt: end },
          endTime: { gt: start },
        },
        select: { id: true, startTime: true, endTime: true },
      }),
    ]);

    return {
      available: this.isSlotAvailable(start, end, busyBlocks, appointments),
    };
  }

  async resolveDoctorId(
    user: { sub: string; role: string } | undefined,
    input?: string,
  ) {
    if (user?.role === 'ADMIN') {
      if (!input) {
        throw new BadRequestException('doctorId is required');
      }
      await this.ensureDoctorExists(input);
      return input;
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: user?.sub ?? '' },
      select: { id: true },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor.id;
  }

  private async ensureDoctorExists(doctorId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { id: true },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
  }

  private parseDate(value: string) {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date');
    }
    return date;
  }

  private parseDateTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date time');
    }
    return date;
  }

  private buildDayRange(
    date: Date,
    workingHours: { startTime: string; endTime: string },
  ) {
    const start = this.combineDateAndTime(date, workingHours.startTime);
    const end = this.combineDateAndTime(date, workingHours.endTime);

    if (start >= end) {
      throw new BadRequestException('Invalid working hours');
    }

    return { start, end };
  }

  private combineDateAndTime(date: Date, time: string) {
    const [hours, minutes] = time.split(':').map((value) => Number(value));
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      throw new BadRequestException('Invalid time');
    }
    const combined = new Date(date);
    combined.setUTCHours(hours, minutes, 0, 0);
    return combined;
  }

  private generateSlots(start: Date, end: Date, slotMinutes: number) {
    if (!Number.isFinite(slotMinutes) || slotMinutes <= 0) {
      throw new BadRequestException('Invalid slot size');
    }

    const slots: { start: Date; end: Date }[] = [];
    let cursor = new Date(start);

    while (cursor.getTime() + slotMinutes * 60000 <= end.getTime()) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor.getTime() + slotMinutes * 60000);
      slots.push({ start: slotStart, end: slotEnd });
      cursor = slotEnd;
    }

    return slots;
  }

  private isSlotAvailable(
    start: Date,
    end: Date,
    busyBlocks: { startTime: Date; endTime: Date }[],
    appointments: { startTime: Date; endTime: Date }[],
  ) {
    const overlaps = (item: { startTime: Date; endTime: Date }) =>
      start < item.endTime && end > item.startTime;

    return !busyBlocks.some(overlaps) && !appointments.some(overlaps);
  }

  private assertTimeRange(startTime: string, endTime: string) {
    const startParts = startTime.split(':').map((value) => Number(value));
    const endParts = endTime.split(':').map((value) => Number(value));

    if (startParts.length !== 2 || endParts.length !== 2) {
      throw new BadRequestException('Invalid time');
    }

    const [startHour, startMinute] = startParts;
    const [endHour, endMinute] = endParts;

    if (
      !Number.isFinite(startHour) ||
      !Number.isFinite(startMinute) ||
      !Number.isFinite(endHour) ||
      !Number.isFinite(endMinute)
    ) {
      throw new BadRequestException('Invalid time');
    }

    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    if (start >= end) {
      throw new BadRequestException('Invalid time range');
    }
  }
}
