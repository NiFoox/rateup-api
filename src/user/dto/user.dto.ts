export interface UserDto {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface PaginatedUsersDto {
  data: UserDto[];
  total: number;
  page: number;
  pageSize: number;
}
