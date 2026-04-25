import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { normalizePagination } from '../common/pagination';
import { PrismaService } from '../prisma.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { ListMedicinesQueryDto } from './dto/list-medicines.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

const medicineSelect = {
  id: true,
  name: true,
  rxnormCode: true,
  drugClass: true,
  category: true,
  form: true,
  description: true,
  manufacturer: true,
  imageUrl: true,
} satisfies Prisma.MedicineSelect;

export type MedicineResponse = Prisma.MedicineGetPayload<{
  select: typeof medicineSelect;
}>;

export type MedicineListResponse = {
  data: MedicineResponse[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
};

@Injectable()
export class MedicineService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMedicineDto): Promise<MedicineResponse> {
    await this.ensureNameIsAvailable(data.name);
    return this.prisma.medicine.create({ data, select: medicineSelect });
  }

  async findAll(query: ListMedicinesQueryDto): Promise<MedicineListResponse> {
    const { page, pageSize, skip, take } = normalizePagination({
      page: query.page,
      pageSize: query.pageSize,
    });
    const where = this.buildSearchWhere(query.search);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.medicine.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        select: medicineSelect,
      }),
      this.prisma.medicine.count({ where }),
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

  async findOne(id: string): Promise<MedicineResponse> {
    const medicine = await this.prisma.medicine.findUnique({
      where: { id },
      select: medicineSelect,
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    return medicine;
  }

  async update(id: string, data: UpdateMedicineDto): Promise<MedicineResponse> {
    await this.findOne(id);
    if (data.name) {
      await this.ensureNameIsAvailable(data.name, id);
    }

    return this.prisma.medicine.update({
      where: { id },
      data,
      select: medicineSelect,
    });
  }

  async remove(id: string): Promise<MedicineResponse> {
    await this.findOne(id);
    return this.prisma.medicine.delete({
      where: { id },
      select: medicineSelect,
    });
  }

  private buildSearchWhere(search?: string): Prisma.MedicineWhereInput {
    if (!search) {
      return {};
    }

    return {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { drugClass: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  private async ensureNameIsAvailable(
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.prisma.medicine.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Medicine with this name already exists');
    }
  }
}
