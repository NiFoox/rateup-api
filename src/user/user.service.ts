import { hashPassword } from '../common/password.util.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { PagedUsersDto, UserDto } from './dto/user.dto.js';
import { UserWithSecrets } from './user.entity.js';
import { UserListFilters, UserRepository } from './user.repository.interface.js';

function toDto(user: UserWithSecrets): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles ?? [],
    active: user.active,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : undefined,
  };
}

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async list(page: number, limit: number, filters: Omit<UserListFilters, 'offset' | 'limit'>): Promise<PagedUsersDto> {
    const offset = (page - 1) * limit;
    const { users, total } = await this.repository.list({ ...filters, offset, limit });

    return {
      items: users.map(toDto),
      total,
      page,
      pageSize: limit,
    };
  }

  async getById(id: string): Promise<UserDto | null> {
    const user = await this.repository.findById(id);
    return user ? toDto(user) : null;
  }

  async create(dto: CreateUserDto): Promise<UserDto> {
    const [byEmail, byName] = await Promise.all([
      this.repository.findByEmail(dto.email),
      this.repository.findByName(dto.name),
    ]);

    if (byEmail) {
      throw new Error('EMAIL_EXISTS');
    }
    if (byName) {
      throw new Error('NAME_EXISTS');
    }

    const passwordHash = dto.password ? await hashPassword(dto.password) : null;
    const created = await this.repository.create({
      name: dto.name,
      email: dto.email,
      roles: dto.roles,
      active: dto.active,
      passwordHash,
    });

    return toDto(created);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDto | null> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }

    if (dto.email && dto.email !== existing.email) {
      const conflict = await this.repository.findByEmail(dto.email);
      if (conflict && conflict.id !== id) {
        throw new Error('EMAIL_EXISTS');
      }
    }

    if (dto.name && dto.name !== existing.name) {
      const conflict = await this.repository.findByName(dto.name);
      if (conflict && conflict.id !== id) {
        throw new Error('NAME_EXISTS');
      }
    }

    const payload: Parameters<UserRepository['update']>[1] = {};
    if (dto.name !== undefined) payload.name = dto.name;
    if (dto.email !== undefined) payload.email = dto.email;
    if (dto.roles !== undefined) payload.roles = dto.roles;
    if (dto.active !== undefined) payload.active = dto.active;
    if (dto.password !== undefined) {
      payload.passwordHash = dto.password ? await hashPassword(dto.password) : null;
    }

    const updated = await this.repository.update(id, payload);
    return updated ? toDto(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  async setStatus(id: string, active: boolean): Promise<UserDto | null> {
    const updated = await this.repository.update(id, { active });
    return updated ? toDto(updated) : null;
  }
}
