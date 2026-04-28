import { Role } from '../types/role.type';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}
