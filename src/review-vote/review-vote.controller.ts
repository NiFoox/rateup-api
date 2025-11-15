import { Request, Response } from 'express';
import type { ReviewVoteRepository } from './review-vote.repository.interface.js';
import {
  ReviewVoteParamsSchema,
  ReviewVoteBodySchema,
  ReviewVoteDeleteBodySchema,
  type ReviewVoteParamsDTO,
  type ReviewVoteBodyDTO,
  type ReviewVoteDeleteBodyDTO,
} from './validators/review-vote.validation.js';

export class ReviewVoteController {
  constructor(private readonly repository: ReviewVoteRepository) {}

  // GET /api/reviews/:reviewId/votes
  async getSummary(req: Request, res: Response): Promise<void> {
    const params: ReviewVoteParamsDTO =
      (res.locals?.validated?.params as ReviewVoteParamsDTO) ??
      ReviewVoteParamsSchema.parse(req.params);

    const { reviewId } = params;

    const summary = await this.repository.getSummary(reviewId);

    res.json({
      reviewId,
      ...summary,
    });
  }

  // PUT /api/reviews/:reviewId/votes
  async upsert(req: Request, res: Response): Promise<void> {
    try {
      const params: ReviewVoteParamsDTO =
        (res.locals?.validated?.params as ReviewVoteParamsDTO) ??
        ReviewVoteParamsSchema.parse(req.params);

      const body: ReviewVoteBodyDTO =
        (res.locals?.validated?.body as ReviewVoteBodyDTO) ??
        ReviewVoteBodySchema.parse(req.body);

      const { reviewId } = params;
      const { userId, value } = body;

      const vote = await this.repository.upsertVote(reviewId, userId, value);
      const summary = await this.repository.getSummary(reviewId);

      res.status(200).json({
        reviewId,
        userId: vote.userId,
        value: vote.value,
        ...summary,
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

  // DELETE /api/reviews/:reviewId/votes
  async remove(req: Request, res: Response): Promise<void> {
    try {
      const params: ReviewVoteParamsDTO =
        (res.locals?.validated?.params as ReviewVoteParamsDTO) ??
        ReviewVoteParamsSchema.parse(req.params);

      const body: ReviewVoteDeleteBodyDTO =
        (res.locals?.validated?.body as ReviewVoteDeleteBodyDTO) ??
        ReviewVoteDeleteBodySchema.parse(req.body);

      const { reviewId } = params;
      const { userId } = body;

      const deleted = await this.repository.deleteVote(reviewId, userId);

      const summary = await this.repository.getSummary(reviewId);

      if (!deleted) {
        // no había voto, pero igual devolvemos summary actual
        res.status(404).json({
          message: 'Vote not found for this user/review',
          reviewId,
          ...summary,
        });
        return;
      }

      res.status(200).json({
        reviewId,
        ...summary,
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
}
