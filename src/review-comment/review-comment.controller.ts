import { Request, Response } from 'express';
import type { ReviewCommentRepository } from './review-comment.repository.interface.js';
import { ReviewComment } from './review-comment.entity.js';
import {
  ReviewCommentBaseParamsSchema,
  ReviewCommentWithIdParamsSchema,
  ReviewCommentCreateSchema,
  ReviewCommentUpdateSchema,
  ReviewCommentListQuerySchema,
  type ReviewCommentBaseParamsDTO,
  type ReviewCommentWithIdParamsDTO,
  type ReviewCommentCreateDTO,
  type ReviewCommentUpdateDTO,
  type ReviewCommentListQueryDTO,
} from './validators/review-comment.validation.js';

export class ReviewCommentController {
  constructor(private readonly repository: ReviewCommentRepository) {}

  // POST /api/reviews/:reviewId/comments
  async create(req: Request, res: Response): Promise<void> {
    try {
      const params: ReviewCommentBaseParamsDTO =
        (res.locals?.validated?.params as ReviewCommentBaseParamsDTO) ??
        ReviewCommentBaseParamsSchema.parse(req.params);

      const body: ReviewCommentCreateDTO =
        (res.locals?.validated?.body as ReviewCommentCreateDTO) ??
        ReviewCommentCreateSchema.parse(req.body);

      const { reviewId } = params;
      const { userId, content } = body;

      const comment = new ReviewComment(reviewId, userId, content);
      const created = await this.repository.create(comment);

      res.status(201).json(created);
    } catch (error) {
      if (error instanceof Error && (error as any).name === 'ZodError') {
        res
          .status(400)
          .json({ message: 'Invalid data', details: (error as any).errors });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // GET /api/reviews/:reviewId/comments
  async list(req: Request, res: Response): Promise<void> {
    const params: ReviewCommentBaseParamsDTO =
      (res.locals?.validated?.params as ReviewCommentBaseParamsDTO) ??
      ReviewCommentBaseParamsSchema.parse(req.params);

    const query: ReviewCommentListQueryDTO =
      (res.locals?.validated?.query as ReviewCommentListQueryDTO) ??
      ReviewCommentListQuerySchema.parse(req.query);

    const { reviewId } = params;
    const { page, pageSize } = query;

    const offset = (page - 1) * pageSize;

    const comments = await this.repository.getByReview(
      reviewId,
      offset,
      pageSize,
    );

    res.json({ reviewId, page, pageSize, data: comments });
  }

  // GET /api/reviews/:reviewId/comments/details
  async listWithUser(req: Request, res: Response): Promise<void> {
    try {
      const params: ReviewCommentBaseParamsDTO =
        (res.locals?.validated?.params as ReviewCommentBaseParamsDTO) ??
        ReviewCommentBaseParamsSchema.parse(req.params);

      const query: ReviewCommentListQueryDTO =
        (res.locals?.validated?.query as ReviewCommentListQueryDTO) ??
        ReviewCommentListQuerySchema.parse(req.query);

      const { reviewId } = params;

      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 20;

      const offset = (page - 1) * pageSize;
      const limit = pageSize;

      const comments = await this.repository.getByReviewWithUser(
        reviewId,
        offset,
        limit,
      );

      res.json({
        reviewId,
        page,
        pageSize,
        count: comments.length,
        items: comments,
      });
    } catch (error) {
      if ((error as any)?.name === 'ZodError') {
        res
          .status(400)
          .json({ message: 'Invalid data', details: (error as any).errors });
        return;
      }

      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // PATCH /api/reviews/:reviewId/comments/:commentId
  async patch(req: Request, res: Response): Promise<void> {
    try {
      const params: ReviewCommentWithIdParamsDTO =
        (res.locals?.validated?.params as ReviewCommentWithIdParamsDTO) ??
        ReviewCommentWithIdParamsSchema.parse(req.params);

      const body: ReviewCommentUpdateDTO =
        (res.locals?.validated?.body as ReviewCommentUpdateDTO) ??
        ReviewCommentUpdateSchema.parse(req.body);

      const { reviewId, commentId } = params;

      // Busca el comment actual (podría saltear esto y hacer update directo,
      // pero así chequea existencia primero)
      const existing = await this.repository.findById(commentId);
      if (!existing || existing.reviewId !== reviewId) {
        res.status(404).json({ message: 'Comment not found' });
        return;
      }

      const patched = await this.repository.update(commentId, body);

      if (!patched) {
        res.status(404).json({ message: 'Comment not found' });
        return;
      }

      res.json(patched);
    } catch (error) {
      if (error instanceof Error && (error as any).name === 'ZodError') {
        res
          .status(400)
          .json({ message: 'Invalid data', details: (error as any).errors });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // DELETE /api/reviews/:reviewId/comments/:commentId
  async delete(req: Request, res: Response): Promise<void> {
    const params: ReviewCommentWithIdParamsDTO =
      (res.locals?.validated?.params as ReviewCommentWithIdParamsDTO) ??
      ReviewCommentWithIdParamsSchema.parse(req.params);

    const { reviewId, commentId } = params;

    const deleted = await this.repository.delete(commentId, reviewId);

    if (!deleted) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    res.status(204).send();
  }
}
