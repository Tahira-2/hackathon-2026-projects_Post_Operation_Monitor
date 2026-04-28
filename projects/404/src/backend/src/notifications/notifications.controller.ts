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
import type { CreateNotificationDto } from './dto/create-notification.dto';
import type { ListNotificationsQuery } from './dto/list-notifications.dto';
import type { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminGuard } from '../common/guards/admin.guard';

const parseNumber = (value?: string) => {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseBoolean = (value?: string) => {
  if (value === undefined) {
    return undefined;
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return undefined;
};

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(
    @Body() body: CreateNotificationDto,
    @CurrentUser() user: { sub: string; role: string } | undefined,
  ) {
    const userId = body.userId ?? user?.sub;
    return this.notificationsService.create({
      ...body,
      userId: userId ?? '',
    });
  }

  @Get()
  findAll(
    @Query() query: Record<string, string>,
    @CurrentUser() user: { sub: string; role: string } | undefined,
  ) {
    const filters: ListNotificationsQuery = {
      page: parseNumber(query.page),
      pageSize: parseNumber(query.pageSize),
      userId: query.userId,
      isRead: parseBoolean(query.isRead),
    };

    if (user?.role !== 'ADMIN') {
      filters.userId = user?.sub;
    }

    return this.notificationsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateNotificationDto) {
    return this.notificationsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
