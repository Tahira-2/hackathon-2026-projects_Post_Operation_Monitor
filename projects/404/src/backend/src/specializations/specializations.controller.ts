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
import type { CreateSpecializationDto } from './dto/create-specialization.dto';
import type { ListSpecializationsQuery } from './dto/list-specializations.dto';
import type { UpdateSpecializationDto } from './dto/update-specialization.dto';
import { SpecializationsService } from './specializations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

const parseNumber = (value?: string) => {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

@Controller('specializations')
@UseGuards(JwtAuthGuard)
export class SpecializationsController {
  constructor(
    private readonly specializationsService: SpecializationsService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  create(@Body() body: CreateSpecializationDto) {
    return this.specializationsService.create(body);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findAll(@Query() query: Record<string, string>) {
    const filters: ListSpecializationsQuery = {
      page: parseNumber(query.page),
      pageSize: parseNumber(query.pageSize),
      name: query.name,
    };
    return this.specializationsService.findAll(filters);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.specializationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() body: UpdateSpecializationDto) {
    return this.specializationsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.specializationsService.remove(id);
  }
}
