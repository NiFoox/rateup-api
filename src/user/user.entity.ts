export class User {
  constructor(
    public username: string,
    public email: string,
    public password: string,
    public isActive: boolean = true,
    public createdAt: Date = new Date(),
    public id?: number,
  ) {}
}
