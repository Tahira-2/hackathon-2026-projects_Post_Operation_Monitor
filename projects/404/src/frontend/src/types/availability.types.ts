// ─── Availability Types — derived from Prisma schema + availability service ───

/** WeekDay enum — from schema.prisma */
export type WeekDay =
  | 'SUNDAY'
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY';

/** BlockType enum — from schema.prisma */
export type BlockType = 'BREAK' | 'BUSY' | 'PERSONAL' | 'EMERGENCY';

/** Shape returned by working-hours endpoints (workingHoursSelect in service) */
export interface WorkingHours {
  id: string;
  doctorId: string;
  day: WeekDay;
  startTime: string; // "HH:MM" format
  endTime: string;   // "HH:MM" format
}

/** Shape returned by busy-block endpoints (busyBlockSelect in service) */
export interface BusyBlock {
  id: string;
  doctorId: string;
  startTime: string; // ISO datetime string
  endTime: string;   // ISO datetime string
  type: BlockType;
  reason: string | null;
}

/**
 * Shape returned by GET /availability/slots
 * Service generates: { start: Date, end: Date }[] — serialized as ISO strings
 */
export interface TimeSlot {
  start: string; // ISO datetime string
  end: string;   // ISO datetime string
}

/** POST /availability/working-hours body */
export interface UpsertWorkingHoursRequest {
  doctorId?: string;
  day: WeekDay;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
}

/** POST /availability/busy-blocks body */
export interface CreateBusyBlockRequest {
  doctorId?: string;
  startTime: string; // ISO datetime string
  endTime: string;   // ISO datetime string
  type: BlockType;
  reason?: string;
}

/** GET /availability/slots query */
export interface ListSlotsQuery {
  doctorId?: string;
  date: string;        // "YYYY-MM-DD"
  slotMinutes?: number;
}

/** GET /availability/busy-blocks query */
export interface ListBusyBlocksQuery {
  doctorId?: string;
  from?: string;
  to?: string;
}

/** POST /availability/slots/validate → { available: boolean } */
export interface ValidateSlotResponse {
  available: boolean;
}

/** DELETE /availability/working-hours/:day or /busy-blocks/:id → { success: true } */
export interface DeleteResponse {
  success: boolean;
}
