export type UserRole = 'USER' | 'ADMIN';

export class User {
  constructor(
    public username: string,
    public email: string,
    public passwordHash: string,
    public roles: UserRole[] = ['USER'],
    public isActive: boolean = true,
    public createdAt: Date = new Date(),
    public id?: number,
  ) {}
}
