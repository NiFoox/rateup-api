import crypto from 'node:crypto'; // Importamos crypto para generar IDs unicas

export class Review {
  constructor(
    public gameTitle: string,
    public content: string,
    public score: number,
    public author: string,
    public id: string = crypto.randomUUID()
  ) {}
}