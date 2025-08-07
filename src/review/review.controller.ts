import { Request, Response } from 'express';
import { ReviewPostgresRepository } from './review.postgres.repository.js';
import { Review } from './review.entity.js';
const repository = new ReviewPostgresRepository();

export class ReviewController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { gameTitle, content, score, author } = req.body;
      
      if (!gameTitle || !content || score == null || typeof score !== 'number'  || Number.isNaN(score)) {
        res.status(400).json({ message: 'Faltan campos obligatorios o son inválidos' });
        return;
      }

      const review = new Review(gameTitle, content, score, author);
      
      const createdReview = await repository.create(review);

      if (createdReview) {
        res.status(201).json(createdReview);
      } else {
        res.status(400).json({ message: 'Error al crear la reseña' });
      }

    } catch (error) {
      res.status(500).json({ message: 'Error interno del servidor', error });
    }
  }
}