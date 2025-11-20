// src/review/review.controller.ts
import { Request, Response } from 'express';
import type { ReviewRepository } from './review.repository.interface.js';
import type { ReviewCommentRepository } from '../review-comment/review-comment.repository.interface.js';
import type { ReviewVoteRepository } from '../review-vote/review-vote.repository.interface.js';
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
  constructor(
    private readonly repository: ReviewRepository,
    private readonly commentRepository: ReviewCommentRepository,
    private readonly voteRepository: ReviewVoteRepository,
  ) {}

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

  // GET /reviews/:id/details
  async getWithRelations(req: Request, res: Response): Promise<void> {
    const params: ReviewIdParamDTO =
      (res.locals?.validated?.params as ReviewIdParamDTO) ??
      ReviewIdParamSchema.parse(req.params);

    const review = await this.repository.findByIdWithRelations(params.id);

    if (!review) {
      res.status(404).json({ message: 'Reseña no encontrada' });
      return;
    }

    res.json(review);
  }

  // GET /api/reviews/:id/full
  async getFull(req: Request, res: Response): Promise<void> {
    try {
      // 1) ID de la review (usamos el mismo schema que getById)
      const params: ReviewIdParamDTO =
        (res.locals?.validated?.params as ReviewIdParamDTO) ??
        ReviewIdParamSchema.parse(req.params);

      const reviewId = params.id;

      // 2) Paginación de comentarios (simple)
      // /api/reviews/:id/full?commentsPage=1&commentsPageSize=10
      const rawCommentsPage = req.query.commentsPage;
      const rawCommentsPageSize = req.query.commentsPageSize;

      let commentsPage =
        typeof rawCommentsPage === 'string' ? Number(rawCommentsPage) : 1;
      let commentsPageSize =
        typeof rawCommentsPageSize === 'string'
          ? Number(rawCommentsPageSize)
          : 10;

      if (!Number.isFinite(commentsPage) || commentsPage < 1) {
        commentsPage = 1;
      }
      if (
        !Number.isFinite(commentsPageSize) ||
        commentsPageSize < 1 ||
        commentsPageSize > 100
      ) {
        commentsPageSize = 10;
      }

      const offset = (commentsPage - 1) * commentsPageSize;
      const limit = commentsPageSize;

      // 3) Review + user + game
      const review = await this.repository.findByIdWithRelations(reviewId);

      if (!review) {
        res.status(404).json({ message: 'Review not found' });
        return;
      }

      // 4) Comentarios con usuario
      const comments =
        await this.commentRepository.getByReviewWithUser(
          reviewId,
          offset,
          limit,
        );

      // 5) Resumen de votos
      const votesSummary = await this.voteRepository.getSummary(reviewId);

      // 6) Respuesta "full" para el front
      res.json({
        reviewId,
        review, // { id, content, score, createdAt, user:{...}, game:{...} }
        comments: {
          page: commentsPage,
          pageSize: commentsPageSize,
          count: comments.length,
          items: comments,
        },
        votes: votesSummary, // { upvotes, downvotes, score }
      });
    } catch (error) {
      if ((error as any)?.name === 'ZodError') {
        res.status(400).json({
          message: 'Invalid data',
          details: (error as any).errors,
        });
        return;
      }

      res.status(500).json({ message: 'Internal server error' });
    }
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
