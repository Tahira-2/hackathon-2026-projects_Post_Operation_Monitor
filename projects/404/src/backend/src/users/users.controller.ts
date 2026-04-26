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
import type { CreateUserDto } from './dto/create-user.dto';
import type { ListUsersQuery } from './dto/list-users.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { ROLE_VALUES, Role } from '../common/types/role.type';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AdminGuard } from '../common/guards/admin.guard';

const parseNumber = (value?: string) => {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseRole = (value?: string) => {
  if (!value) {
    return undefined;
  }
  const normalized = value.toUpperCase();
  return ROLE_VALUES.includes(normalized as Role)
    ? (normalized as Role)
    : undefined;
};

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  findAll(@Query() query: Record<string, string>) {
    const filters: ListUsersQuery = {
      page: parseNumber(query.page),
      pageSize: parseNumber(query.pageSize),
      name: query.name,
      email: query.email,
      role: parseRole(query.role),
    };
    return this.usersService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
