import { Role } from '../../common/types/role.type';

export type SignupDto = {
  fullName: string;
  email: string;
  password: string;
  role: Role;
};
