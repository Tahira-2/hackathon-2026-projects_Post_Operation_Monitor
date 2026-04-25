import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(data: SignupDto) {
    const exists = await this.usersService.existsByEmail(data.email);

    if (exists) {
      throw new ConflictException('Email already in use');
    }

    const password = await bcrypt.hash(data.password, 10);

    const user = await this.usersService.create({
      fullName: data.fullName,
      email: data.email,
      password,
      role: data.role,
    });

    return this.buildAuthResponse(user);
  }

  async login(data: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(data.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(data.password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...safeUser } = user;
    return this.buildAuthResponse(safeUser);
  }

  logout() {
    return { success: true };
  }

  private buildAuthResponse(user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    createdAt: Date;
  }) {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, accessToken };
  }
}
