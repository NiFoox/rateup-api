export class Review {
  constructor(
    public gameId: number,
    public userId: number,
    public content: string,
    public score: number,
    public id?: number,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
