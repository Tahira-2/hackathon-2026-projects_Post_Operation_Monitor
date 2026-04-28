import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { normalizePagination } from '../common/pagination';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { ListSpecializationsQuery } from './dto/list-specializations.dto';
import { UpdateSpecializationDto } from './dto/update-specialization.dto';

const specializationSelect = {
  id: true,
  name: true,
  description: true,
};

@Injectable()
export class SpecializationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSpecializationDto) {
    return this.prisma.specialization.create({
      data,
      select: specializationSelect,
    });
  }

  async findAll(query: ListSpecializationsQuery) {
    const { page, pageSize, skip, take } = normalizePagination({
      page: query.page,
      pageSize: query.pageSize,
    });

    const where: { name?: { contains: string; mode: 'insensitive' } } = {};

    if (query.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.specialization.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        select: specializationSelect,
      }),
      this.prisma.specialization.count({ where }),
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
    const specialization = await this.prisma.specialization.findUnique({
      where: { id },
      select: specializationSelect,
    });

    if (!specialization) {
      throw new NotFoundException('Specialization not found');
    }

    return specialization;
  }

  async update(id: string, data: UpdateSpecializationDto) {
    await this.findOne(id);
    return this.prisma.specialization.update({
      where: { id },
      data,
      select: specializationSelect,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.specialization.delete({
      where: { id },
      select: specializationSelect,
    });
  }

  async getOrCreateByName(name: string, description?: string) {
    const existing = await this.prisma.specialization.findUnique({
      where: { name },
      select: specializationSelect,
    });

    if (existing) {
      return existing;
    }

    return this.prisma.specialization.create({
      data: { name, description },
      select: specializationSelect,
    });
  }
}
