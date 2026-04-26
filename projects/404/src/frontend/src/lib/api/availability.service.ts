import apiClient from './axios';
import type {
  BusyBlock,
  CreateBusyBlockRequest,
  DeleteResponse,
  ListBusyBlocksQuery,
  ListSlotsQuery,
  TimeSlot,
  UpsertWorkingHoursRequest,
  ValidateSlotResponse,
  WeekDay,
  WorkingHours,
} from '../../types/availability.types';

/** POST /availability/working-hours — DOCTOR/ADMIN only */
export const upsertWorkingHours = (data: UpsertWorkingHoursRequest): Promise<WorkingHours> =>
  apiClient.post<WorkingHours>('/availability/working-hours', data).then((r) => r.data);

/** GET /availability/working-hours?doctorId= — DOCTOR/ADMIN only */
export const listWorkingHours = (doctorId?: string): Promise<WorkingHours[]> =>
  apiClient
    .get<WorkingHours[]>('/availability/working-hours', { params: doctorId ? { doctorId } : {} })
    .then((r) => r.data);

/** DELETE /availability/working-hours/:day?doctorId= — DOCTOR/ADMIN only */
export const deleteWorkingHours = (day: WeekDay, doctorId?: string): Promise<DeleteResponse> =>
  apiClient
    .delete<DeleteResponse>(`/availability/working-hours/${day}`, {
      params: doctorId ? { doctorId } : {},
    })
    .then((r) => r.data);

/** POST /availability/busy-blocks — DOCTOR/ADMIN only */
export const createBusyBlock = (data: CreateBusyBlockRequest): Promise<BusyBlock> =>
  apiClient.post<BusyBlock>('/availability/busy-blocks', data).then((r) => r.data);

/** GET /availability/busy-blocks?doctorId=&from=&to= — DOCTOR/ADMIN only */
export const listBusyBlocks = (query?: ListBusyBlocksQuery): Promise<BusyBlock[]> =>
  apiClient.get<BusyBlock[]>('/availability/busy-blocks', { params: query }).then((r) => r.data);

/** DELETE /availability/busy-blocks/:id — DOCTOR/ADMIN only */
export const deleteBusyBlock = (id: string): Promise<DeleteResponse> =>
  apiClient.delete<DeleteResponse>(`/availability/busy-blocks/${id}`).then((r) => r.data);

/** GET /availability/slots?doctorId=&date=&slotMinutes= — DOCTOR/ADMIN only */
export const listAvailableSlots = (query: ListSlotsQuery): Promise<TimeSlot[]> =>
  apiClient.get<TimeSlot[]>('/availability/slots', { params: query }).then((r) => r.data);

/** POST /availability/slots/validate — DOCTOR/ADMIN only */
export const validateSlot = (body: {
  doctorId?: string;
  startTime: string;
  endTime: string;
}): Promise<ValidateSlotResponse> =>
  apiClient
    .post<ValidateSlotResponse>('/availability/slots/validate', body)
    .then((r) => r.data);
