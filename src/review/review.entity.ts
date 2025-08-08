export class Review {
  constructor(
    public gameTitle: string,
    public content: string,
    public score: number,
    public author: string,
    public id?: number
  ) {}
}