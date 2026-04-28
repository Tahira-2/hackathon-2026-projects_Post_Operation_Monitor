import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Role } from '../types/role.type';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: Role } | undefined;
    return user?.role === 'ADMIN';
  }
}
