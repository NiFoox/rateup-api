export interface LoginResponseDto {
  success: boolean;
  token?: string;
  expiresAt?: string;
  message?: string;
}
