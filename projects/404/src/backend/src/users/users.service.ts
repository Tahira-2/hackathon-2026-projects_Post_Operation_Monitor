import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { normalizePagination } from '../common/pagination';
import type { Role } from '../common/types/role.type';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQuery } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SpecializationsService } from '../specializations/specializations.service';

const userSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  createdAt: true,
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly specializationsService: SpecializationsService,
  ) {}

  async create(data: CreateUserDto) {
    if (data.role === 'DOCTOR') {
      const specializationId = await this.resolveSpecializationId(data);

      return this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            fullName: data.fullName,
            email: data.email,
            password: data.password,
            role: data.role,
          },
          select: userSelect,
        });

        await tx.doctor.create({
          data: {
            userId: user.id,
            specializationId,
          },
          select: { id: true },
        });

        return user;
      });
    }

    if (data.role === 'PATIENT') {
      return this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({ data, select: userSelect });

        await tx.patient.create({
          data: { userId: user.id },
          select: { id: true },
        });

        return user;
      });
    }

    return this.prisma.user.create({ data, select: userSelect });
  }

  async existsByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }

  async findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { ...userSelect, password: true },
    });
  }

  async findAll(query: ListUsersQuery) {
    const { page, pageSize, skip, take } = normalizePagination({
      page: query.page,
      pageSize: query.pageSize,
    });

    const where: {
      fullName?: { contains: string; mode: 'insensitive' };
      email?: { contains: string; mode: 'insensitive' };
      role?: Role;
    } = {};

    if (query.name) {
      where.fullName = { contains: query.name, mode: 'insensitive' };
    }

    if (query.email) {
      where.email = { contains: query.email, mode: 'insensitive' };
    }

    if (query.role) {
      where.role = query.role;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: userSelect,
      }),
      this.prisma.user.count({ where }),
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
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, data: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({ where: { id }, data, select: userSelect });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id }, select: userSelect });
  }

  private async resolveSpecializationId(data: CreateUserDto) {
    if (data.specializationId) {
      await this.specializationsService.findOne(data.specializationId);
      return data.specializationId;
    }

    if (data.specializationName) {
      const specialization =
        await this.specializationsService.getOrCreateByName(
          data.specializationName,
          data.specializationDescription,
        );
      return specialization.id;
    }

    throw new BadRequestException('Specialization is required for doctors');
  }
}
