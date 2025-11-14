export interface CreateUserDto {
  name: string;
  email: string;
  roles: string[];
  active: boolean;
  password?: string;
}
