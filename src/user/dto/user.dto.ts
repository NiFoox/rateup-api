import { PagedResult } from '../../shared/types/pagination.js';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  roles: string[];
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type PagedUsersDto = PagedResult<UserDto>;
