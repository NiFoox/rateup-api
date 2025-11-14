export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  active: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface UserWithSecrets extends User {
  passwordHash: string | null;
}
