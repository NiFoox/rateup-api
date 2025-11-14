export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}
