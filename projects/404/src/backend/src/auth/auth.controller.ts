import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { LoginDto } from './dto/login.dto';
import type { SignupDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('patient/signup')
  @Public()
  signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @Post('patient/login')
  @Public()
  patientLogin(@Body() body: LoginDto) {
    return this.authService.login(body, 'PATIENT');
  }

  @Post('doctor/login')
  @Public()
  doctorLogin(@Body() body: LoginDto) {
    return this.authService.login(body, 'DOCTOR');
  }

  @Post('admin/login')
  @Public()
  adminLogin(@Body() body: LoginDto) {
    return this.authService.login(body, 'ADMIN');
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout() {
    return this.authService.logout();
  }
}
