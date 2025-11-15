export class ReviewComment {
  constructor(
    public reviewId: number,
    public userId: number,
    public content: string,
    public id?: number,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
