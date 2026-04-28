import { Role } from '../../common/types/role.type';

export type UpdateUserDto = {
  fullName?: string;
  email?: string;
  password?: string;
  role?: Role;
};
