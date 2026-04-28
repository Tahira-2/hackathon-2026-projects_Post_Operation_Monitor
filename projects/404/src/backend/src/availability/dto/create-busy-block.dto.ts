import type { BlockType } from '@prisma/client';

export type CreateBusyBlockDto = {
  doctorId?: string;
  startTime: string;
  endTime: string;
  type: BlockType;
  reason?: string;
};
