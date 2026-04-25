import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { UpsertWorkingHoursDto } from './dto/upsert-working-hours.dto';
import type { ListWorkingHoursQuery } from './dto/list-working-hours.dto';
import type { CreateBusyBlockDto } from './dto/create-busy-block.dto';
import type { ListBusyBlocksQuery } from './dto/list-busy-blocks.dto';
import type { ListSlotsQuery } from './dto/list-slots.dto';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { WeekDay } from '@prisma/client';

const parseNumber = (value?: string) => {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

@Controller('availability')
@UseGuards(JwtAuthGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post('working-hours')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  upsertWorkingHours(
    @Body() body: UpsertWorkingHoursDto,
    @CurrentUser() user: { sub: string; role: string } | undefined,
  ) {
    return this.availabilityService
      .resolveDoctorId(user, body.doctorId)
      .then((doctorId) =>
        this.availabilityService.upsertWorkingHours(
          doctorId,
          body.day,
          body.startTime,
          body.endTime,
        ),
      );
  }

  @Get('working-hours')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  listWorkingHours(
    @Query() query: ListWorkingHoursQuery,
    @CurrentUser() user: { sub: string; role: string } | undefined,
  ) {
    return this.availabilityService
      .resolveDoctorId(user, query.doctorId)
      .then((doctorId) => this.availabilityService.listWorkingHours(doctorId));
  }

  @Delete('working-hours/:day')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  deleteWorkingHours(
    @Param('day') day: WeekDay,
    @Query() query: ListWorkingHoursQuery,
    @CurrentUser() user: { sub: string; role: string } | undefined,
  ) {
    return this.availabilityService
      .resolveDoctorId(user, query.doctorId)
      .then((doctorId) =>
        this.availabilityService.deleteWorkingHours(doctorId, day),
      );
  }

  @Post('busy-blocks')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  createBusyBlock(
    @Body() body: CreateBusyBlockDto,
    @CurrentUser() user: { sub: string; role: string } | undefined,
  ) {
    return this.availabilityService
      .resolveDoctorId(user, body.doctorId)
      .then((doctorId) =>
        this.availabilityService.createBusyBlock(
          doctorId,
          body.startTime,
          body.endTime,
          body.type,
          body.reason,
        ),
      );
  }

  @Get('busy-blocks')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  listBusyBlocks(
    @Query() query: ListBusyBlocksQuery,
    @CurrentUser() user: { sub: string; role: string } | undefined,
  ) {
    return this.availabilityService
      .resolveDoctorId(user, query.doctorId)
      .then((doctorId) =>
        this.availabilityService.listBusyBlocks(doctorId, query.from, query.to),
      );
  }

  @Delete('busy-blocks/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  deleteBusyBlock(@Param('id') id: string) {
    return this.availabilityService.deleteBusyBlock(id);
  }

  @Get('slots')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  listSlots(
    @Query() query: ListSlotsQuery,
    @CurrentUser() user: { sub: string; role: string } | undefined,
  ) {
    const slotMinutes = query.slotMinutes
      ? parseNumber(String(query.slotMinutes))
      : 30;
    return this.availabilityService
      .resolveDoctorId(user, query.doctorId)
      .then((doctorId) =>
        this.availabilityService.listAvailableSlots(
          doctorId,
          query.date,
          slotMinutes ?? 30,
        ),
      );
  }

  @Post('slots/validate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  validateSlot(
    @Body() body: { doctorId?: string; startTime: string; endTime: string },
    @CurrentUser() user: { sub: string; role: string } | undefined,
  ) {
    return this.availabilityService
      .resolveDoctorId(user, body.doctorId)
      .then((doctorId) =>
        this.availabilityService.validateSlot(
          doctorId,
          body.startTime,
          body.endTime,
        ),
      );
  }
}
