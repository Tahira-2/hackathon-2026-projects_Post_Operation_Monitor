import { Role } from '../../common/types/role.type';

export type ListUsersQuery = {
  page?: number;
  pageSize?: number;
  name?: string;
  email?: string;
  role?: Role;
};
