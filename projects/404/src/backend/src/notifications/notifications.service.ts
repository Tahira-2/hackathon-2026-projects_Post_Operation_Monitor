import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { normalizePagination } from '../common/pagination';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ListNotificationsQuery } from './dto/list-notifications.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

const notificationSelect = {
  id: true,
  userId: true,
  title: true,
  message: true,
  type: true,
  isRead: true,
  createdAt: true,
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNotificationDto) {
    if (!data.userId) {
      throw new BadRequestException('userId is required');
    }
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
      },
      select: notificationSelect,
    });
  }

  async findAll(query: ListNotificationsQuery) {
    const { page, pageSize, skip, take } = normalizePagination({
      page: query.page,
      pageSize: query.pageSize,
    });

    const where: { userId?: string; isRead?: boolean } = {};

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.isRead !== undefined) {
      where.isRead = query.isRead;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: notificationSelect,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      select: notificationSelect,
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async update(id: string, data: UpdateNotificationDto) {
    await this.findOne(id);
    return this.prisma.notification.update({
      where: { id },
      data,
      select: notificationSelect,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.notification.delete({
      where: { id },
      select: notificationSelect,
    });
  }
}
