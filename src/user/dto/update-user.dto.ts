export interface UpdateUserDto {
  name?: string;
  email?: string;
  roles?: string[];
  active?: boolean;
  password?: string;
}
