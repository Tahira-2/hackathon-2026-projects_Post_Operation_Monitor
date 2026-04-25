import type { WeekDay } from '@prisma/client';

export type UpsertWorkingHoursDto = {
  doctorId?: string;
  day: WeekDay;
  startTime: string;
  endTime: string;
};
