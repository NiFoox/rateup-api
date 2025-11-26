import { User, type UserRole } from './user.entity.js';
import type { UserRepository } from './user.repository.interface.js';
import type {
  UserCreateDTO,
  UserUpdateDTO,
  UserListQueryDTO,
} from './validators/user.validation.js';
import { hashPassword } from '../common/password.util.js';

export interface UserResponseDTO {
  id: number;
  username: string;
  email: string;
  roles: UserRole[];
  isActive: boolean;
  createdAt: string;
}

export interface UserListResult {
  data: UserResponseDTO[];
  page: number;
  pageSize: number;
  total: number;
}

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  private toResponse(user: User): UserResponseDTO {
    if (user.id == null) {
      // debería no pasar nunca si viene de la DB
      throw new Error('INVALID_DATA');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async create(dto: UserCreateDTO): Promise<UserResponseDTO> {
    const [existingByEmail, existingByUsername] = await Promise.all([
      this.userRepository.findByEmail(dto.email),
      this.userRepository.findByUsername(dto.username),
    ]);

    if (existingByEmail || existingByUsername) {
      throw new Error('USER_ALREADY_EXISTS');
    }

    const passwordHash = await hashPassword(dto.password);
    const roles: UserRole[] = (dto.roles as UserRole[] | undefined) ?? ['USER'];
    const isActive = dto.isActive ?? true;

    const user = new User(dto.username, dto.email, passwordHash, roles, isActive);
    const created = await this.userRepository.create(user);

    return this.toResponse(created);
  }

  async findById(id: number): Promise<UserResponseDTO | undefined> {
    const user = await this.userRepository.findById(id);
    return user ? this.toResponse(user) : undefined;
  }

  async list(query: UserListQueryDTO): Promise<UserListResult> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const search = query.search;

    const { data, total } = await this.userRepository.search(page, pageSize, search);

    return {
      data: data.map((u) => this.toResponse(u)),
      page,
      pageSize,
      total,
    };
  }

  async update(id: number, dto: UserUpdateDTO): Promise<UserResponseDTO | undefined> {
    const partial: Partial<User> = {};

    if (dto.username !== undefined) {
      partial.username = dto.username;
    }
    if (dto.email !== undefined) {
      partial.email = dto.email;
    }
    if (dto.password !== undefined) {
      partial.passwordHash = await hashPassword(dto.password);
    }
    if (dto.roles !== undefined) {
      partial.roles = dto.roles as UserRole[];
    }
    if (dto.isActive !== undefined) {
      partial.isActive = dto.isActive;
    }

    const updated = await this.userRepository.update(id, partial);
    return updated ? this.toResponse(updated) : undefined;
  }

  async delete(id: number): Promise<boolean> {
    return this.userRepository.delete(id);
  }
}
