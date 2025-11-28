import { Request, Response } from 'express';
import type { ReviewRepository } from './review.repository.interface.js';
import type { ReviewCommentRepository } from '../review-comment/review-comment.repository.interface.js';
import type { ReviewVoteRepository } from '../review-vote/review-vote.repository.interface.js';
import type { AuthenticatedRequest } from '../shared/middlewares/auth.js';
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

      const { gameId, content, score } = body;

      const authReq = req as AuthenticatedRequest;
      const authUser = authReq.user;

      if (!authUser) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      const userId = Number(authUser.sub);

      const review = new Review(gameId, userId, content, score);
      const createdReview = await this.repository.create(review);

      res.status(201).json(createdReview);
    } catch (error) {
      if (error instanceof Error && (error as any).name === 'ZodError') {
        res
          .status(400)
          .json({ message: 'Datos inválidos', details: (error as any).errors });
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
    try {
      const query: ReviewListQueryDTO =
        (res.locals?.validated?.query as ReviewListQueryDTO) ??
        ReviewListQuerySchema.parse(req.query);

      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 10;
      const offset = (page - 1) * pageSize;

      const { data, total } = await this.repository.getPaginated(
        offset,
        pageSize,
        {
          gameId: query.gameId,
          userId: query.userId,
        },
      );

      res.json({
        page,
        pageSize,
        total,
        data,
      });
    } catch (error) {
      console.error('[ReviewController.list] Error', error);
      res
        .status(500)
        .json({ message: 'Error interno del servidor' });
    }
  }

  // GET /reviews/me
  // Lista las reseñas del usuario logueado usando sub (JWT)
  async listMine(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const authUser = authReq.user;

    if (!authUser) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const query: ReviewListQueryDTO =
      (res.locals?.validated?.query as ReviewListQueryDTO) ??
      ReviewListQuerySchema.parse(req.query);

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const gameId = query.gameId;

    const offset = (page - 1) * pageSize;

    const userId = Number(authUser.sub);

    const { data, total } = await this.repository.getPaginated(
      offset,
      pageSize,
      { gameId, userId },
    );

    res.json({
      page,
      pageSize,
      total,
      data,
    });
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
      const params: ReviewIdParamDTO =
        (res.locals?.validated?.params as ReviewIdParamDTO) ??
        ReviewIdParamSchema.parse(req.params);

      const reviewId = params.id;

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

      const review = await this.repository.findByIdWithRelations(reviewId);

      if (!review) {
        res.status(404).json({ message: 'Review not found' });
        return;
      }

      const comments = await this.commentRepository.getByReviewWithUser(
        reviewId,
        offset,
        limit,
      );

      const votesSummary = await this.voteRepository.getSummary(reviewId);

      res.json({
        reviewId,
        review,
        comments: {
          page: commentsPage,
          pageSize: commentsPageSize,
          count: comments.length,
          items: comments,
        },
        // reviewId no es necesario pero lo puse para respetar el contrato (errado) y el front lo consume así.
        // Aunque si no se manda queda como undefined y no pasa nada.
        votes: { reviewId, votesSummary }, 
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

      const authReq = req as AuthenticatedRequest;
      const authUser = authReq.user;

      if (!authUser) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }

      const existing = await this.repository.findById(params.id);

      if (!existing) {
        res.status(404).json({ message: 'Reseña no encontrada' });
        return;
      }

      const currentUserId = Number(authUser.sub);
      const isOwner = existing.userId === currentUserId;
      const isAdmin = authUser.roles?.includes('ADMIN') ?? false;

      if (!isOwner && !isAdmin) {
        res.status(403).json({
          message: 'No autorizado para modificar esta reseña',
        });
        return;
      }

      const patched = await this.repository.update(params.id, body);

      if (!patched) {
        res.status(404).json({ message: 'Reseña no encontrada' });
        return;
      }

      res.json(patched);
    } catch (error) {
      if (error instanceof Error && (error as any).name === 'ZodError') {
        res
          .status(400)
          .json({ message: 'Datos inválidos', details: (error as any).errors });
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

    const authReq = req as AuthenticatedRequest;
    const authUser = authReq.user;

    if (!authUser) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const existing = await this.repository.findById(params.id);

    if (!existing) {
      res.status(404).json({ message: 'Reseña no encontrada' });
      return;
    }

    const currentUserId = Number(authUser.sub);
    const isOwner = existing.userId === currentUserId;
    const isAdmin = authUser.roles?.includes('ADMIN') ?? false;

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        message: 'No autorizado para eliminar esta reseña',
      });
      return;
    }

    const deleted = await this.repository.delete(params.id);

    if (!deleted) {
      res.status(404).json({ message: 'Reseña no encontrada' });
      return;
    }

    res.status(204).send();
  }
}
