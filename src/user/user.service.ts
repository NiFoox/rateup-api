import { hashPassword, verifyPassword } from '../common/password.util.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginRequestDto } from './dto/login-request.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { PaginatedUsersDto, UserDto } from './dto/user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './user.entity.js';
import type { UserRepository } from './user.repository.interface.js';
import { randomBytes } from 'crypto';

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  private toDto(user: User): UserDto {
    return {
      id: user.id!,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : new Date(user.createdAt).toISOString(),
    };
  }

  async create(dto: CreateUserDto): Promise<UserDto> {
    if (!dto.username || !dto.email || !dto.password) {
      throw new Error('INVALID_DATA');
    }

    const existingByUsername = await this.repository.findByUsername(dto.username);
    if (existingByUsername) {
      throw new Error('USERNAME_EXISTS');
    }

    const existingByEmail = await this.repository.findByEmail(dto.email);
    if (existingByEmail) {
      throw new Error('EMAIL_EXISTS');
    }

    const passwordHash = await hashPassword(dto.password);
    const user = new User(dto.username, dto.email, passwordHash, true);
    const created = await this.repository.create(user);
    return this.toDto(created);
  }

  async findById(id: number): Promise<UserDto | null> {
    const user = await this.repository.findById(id);
    return user ? this.toDto(user) : null;
  }

  async search(page = 1, pageSize = 10, searchTerm?: string): Promise<PaginatedUsersDto> {
    const safePage = page > 0 ? page : 1;
    const safePageSize = pageSize > 0 ? pageSize : 10;
    const { data, total } = await this.repository.search(safePage, safePageSize, searchTerm);
    return {
      data: data.map((u) => this.toDto(u)),
      total,
      page: safePage,
      pageSize: safePageSize,
    };
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserDto | null> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }

    if (dto.username && dto.username !== existing.username) {
      const userWithUsername = await this.repository.findByUsername(dto.username);
      if (userWithUsername && userWithUsername.id !== id) {
        throw new Error('USERNAME_EXISTS');
      }
    }

    if (dto.email && dto.email !== existing.email) {
      const userWithEmail = await this.repository.findByEmail(dto.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new Error('EMAIL_EXISTS');
      }
    }

    const payload: Partial<User> = {};
    if (dto.username !== undefined) {
      payload.username = dto.username;
    }
    if (dto.email !== undefined) {
      payload.email = dto.email;
    }
    if (dto.isActive !== undefined) {
      payload.isActive = dto.isActive;
    }

    const updated = await this.repository.update(id, payload);

    return updated ? this.toDto(updated) : null;
  }

  async delete(id: number): Promise<boolean> {
    return this.repository.delete(id);
  }

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    if (!dto.usernameOrEmail || !dto.password) {
      throw new Error('INVALID_DATA');
    }

    const identifier = dto.usernameOrEmail;
    const user = (await this.repository.findByUsername(identifier)) ?? (await this.repository.findByEmail(identifier));

    if (!user || !user.isActive) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const validPassword = await verifyPassword(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    return {
      success: true,
      token,
      expiresAt,
    };
  }
}
