import { randomBytes } from 'crypto';
import { verifyPassword } from '../common/password.util.js';
import { AuthResponse, AuthUser, LoginRequest } from './auth.entity.js';
import type { UserRepository } from '../user/user.repository.interface.js';
import type { UserWithSecrets } from '../user/user.entity.js';

interface SessionRecord {
  userId: string;
  accessToken: string;
  refreshToken?: string;
  createdAt: Date;
}

export class AuthService {
  private readonly sessions = new Map<string, SessionRecord>();

  constructor(private readonly users: UserRepository) {}

  async login(dto: LoginRequest): Promise<AuthResponse> {
    if (!dto.email || !dto.password) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const user = await this.users.findByEmail(dto.email.toLowerCase());
    if (!user || !user.passwordHash) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const valid = await verifyPassword(dto.password, user.passwordHash);
    if (!valid || !user.active) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const accessToken = this.generateToken();
    const refreshToken = dto.remember ? this.generateToken() : undefined;

    this.sessions.set(accessToken, {
      userId: user.id,
      accessToken,
      refreshToken,
      createdAt: new Date(),
    });

    return {
      accessToken,
      refreshToken,
      user: this.toAuthUser(user),
    };
  }

  async logout(accessToken: string | undefined): Promise<void> {
    if (!accessToken) {
      return;
    }
    this.sessions.delete(accessToken);
  }

  async getUserFromToken(accessToken: string | undefined): Promise<AuthUser | null> {
    if (!accessToken) {
      return null;
    }

    const session = this.sessions.get(accessToken);
    if (!session) {
      return null;
    }

    const user = await this.users.findById(session.userId);
    return user ? this.toAuthUser(user) : null;
  }

  private toAuthUser(user: UserWithSecrets): AuthUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles ?? [],
    };
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }
}
