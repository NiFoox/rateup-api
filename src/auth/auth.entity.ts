import type { UserRole } from '../user/user.entity.js';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  roles: UserRole[];
}

export interface AuthLoginRequest {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthLoginResponse {
  success: true;
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
}
