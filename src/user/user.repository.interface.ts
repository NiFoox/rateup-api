import { UserWithSecrets } from './user.entity.js';

export interface UserListFilters {
  search?: string;
  role?: string;
  active?: boolean;
  sort?: 'name' | 'email' | 'createdAt' | 'active';
  dir?: 'asc' | 'desc';
  offset: number;
  limit: number;
}

export interface UserRepository {
  list(filters: UserListFilters): Promise<{ users: UserWithSecrets[]; total: number }>;
  findById(id: string): Promise<UserWithSecrets | null>;
  findByEmail(email: string): Promise<UserWithSecrets | null>;
  findByName(name: string): Promise<UserWithSecrets | null>;
  create(data: {
    name: string;
    email: string;
    roles: string[];
    active: boolean;
    passwordHash?: string | null;
  }): Promise<UserWithSecrets>;
  update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      roles: string[];
      active: boolean;
      passwordHash?: string | null;
    }>,
  ): Promise<UserWithSecrets | null>;
  delete(id: string): Promise<boolean>;
}
