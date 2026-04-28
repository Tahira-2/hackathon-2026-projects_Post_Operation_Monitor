import {
  Body,
  Controller,
  Delete,
  Get,
  ParseUUIDPipe,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../common/guards/admin.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { ListMedicinesQueryDto } from './dto/list-medicines.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import {
  MedicineListResponse,
  MedicineResponse,
  MedicineService,
} from './medicine.service';

@ApiTags('medicines')
@Controller('medicines')
@UseGuards(JwtAuthGuard, AdminGuard)
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  @Post()
  create(@Body() body: CreateMedicineDto): Promise<MedicineResponse> {
    return this.medicineService.create(body);
  }

  @Get()
  findAll(
    @Query() query: ListMedicinesQueryDto,
  ): Promise<MedicineListResponse> {
    return this.medicineService.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<MedicineResponse> {
    return this.medicineService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: UpdateMedicineDto,
  ): Promise<MedicineResponse> {
    return this.medicineService.update(id, body);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<MedicineResponse> {
    return this.medicineService.remove(id);
  }
}
