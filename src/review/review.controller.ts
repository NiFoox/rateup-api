// src/review/review.controller.ts
import { Request, Response } from 'express';
import type { ReviewRepository } from './review.repository.interface.js';
import { Review } from './review.entity.js';
import {
  ReviewCreateSchema,
  ReviewUpdateSchema,
  ReviewIdParamSchema,
  ReviewListQuerySchema,
  type ReviewCreateDTO,
  type ReviewUpdateDTO,
  type ReviewIdParamDTO,
  type ReviewListQueryDTO,
} from './validators/review.validation.js';

export class ReviewController {
  constructor(private readonly repository: ReviewRepository) {}

  // POST /reviews
  async create(req: Request, res: Response): Promise<void> {
    try {
      const body: ReviewCreateDTO =
        (res.locals?.validated?.body as ReviewCreateDTO) ??
        ReviewCreateSchema.parse(req.body);

      const { gameId, userId, content, score } = body;

      const review = new Review(gameId, userId, content, score);
      const createdReview = await this.repository.create(review);

      res.status(201).json(createdReview);
    } catch (error) {
      if (error instanceof Error && (error as any).name === 'ZodError') {
        res.status(400).json({ message: 'Datos inválidos', details: (error as any).errors });
        return;
      }
      res.status(500).json({ message: 'Error interno del servidor', error });
    }
  }

  // GET /reviews/:id
  async getById(req: Request, res: Response): Promise<void> {
    const params: ReviewIdParamDTO =
      (res.locals?.validated?.params as ReviewIdParamDTO) ??
      ReviewIdParamSchema.parse(req.params);

    const review = await this.repository.findById(params.id);

    if (!review) {
      res.status(404).json({ message: 'Reseña no encontrada' });
      return;
    }

    res.json(review);
  }

  // GET /reviews
  async list(req: Request, res: Response): Promise<void> {
    const query: ReviewListQueryDTO =
      (res.locals?.validated?.query as ReviewListQueryDTO) ??
      ReviewListQuerySchema.parse(req.query);

    const { page, pageSize, gameId, userId } = query;
    const offset = (page - 1) * pageSize;

    const reviews = await this.repository.getPaginated(offset, pageSize, {
      gameId,
      userId,
    });

    res.json({ page, pageSize, data: reviews });
  }

  // PATCH /reviews/:id
  async patch(req: Request, res: Response): Promise<void> {
    try {
      const params: ReviewIdParamDTO =
        (res.locals?.validated?.params as ReviewIdParamDTO) ??
        ReviewIdParamSchema.parse(req.params);

      const body: ReviewUpdateDTO =
        (res.locals?.validated?.body as ReviewUpdateDTO) ??
        ReviewUpdateSchema.parse(req.body);

      const patched = await this.repository.update(params.id, body);

      if (!patched) {
        res.status(404).json({ message: 'Reseña no encontrada' });
        return;
      }

      res.json(patched);
    } catch (error) {
      if (error instanceof Error && (error as any).name === 'ZodError') {
        res.status(400).json({ message: 'Datos inválidos', details: (error as any).errors });
        return;
      }
      res.status(500).json({ message: 'Error interno del servidor', error });
    }
  }

  // DELETE /reviews/:id
  async delete(req: Request, res: Response): Promise<void> {
    const params: ReviewIdParamDTO =
      (res.locals?.validated?.params as ReviewIdParamDTO) ??
      ReviewIdParamSchema.parse(req.params);

    const deleted = await this.repository.delete(params.id);

    if (!deleted) {
      res.status(404).json({ message: 'Reseña no encontrada' });
      return;
    }

    res.status(204).send();
  }
}
