export class User {
  constructor(
    public username: string,
    public email: string,
    public passwordHash: string,
    public isActive: boolean = true,
    public createdAt: Date = new Date(),
    public id?: number
  ) {}
}
