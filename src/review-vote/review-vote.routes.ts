import { Router } from 'express';
import {
  validateBody,
  validateParams,
} from '../shared/middlewares/validate.js';
import { requireAuth, optionalAuth } from '../shared/middlewares/auth.js';
import { ReviewVoteController } from './review-vote.controller.js';
import {
  ReviewVoteParamsSchema,
  ReviewVoteBodySchema,
} from './validators/review-vote.validation.js';
import type { ReviewVoteRepository } from './review-vote.repository.interface.js';

export default function buildReviewVoteRouter(
  repository: ReviewVoteRepository,
) {
  const router = Router({ mergeParams: true });
  const controller = new ReviewVoteController(repository);

  // GET resumen de votos - público
  // GET /api/reviews/:reviewId/votes
  router.get(
    '/',
    optionalAuth,
    validateParams(ReviewVoteParamsSchema),
    controller.getSummary.bind(controller),
  );

  // POST upvote / downvote (requiere login)
  // POST /api/reviews/:reviewId/votes
  router.post(
    '/',
    requireAuth,
    validateParams(ReviewVoteParamsSchema),
    validateBody(ReviewVoteBodySchema),
    controller.upsert.bind(controller),
  );

  // DELETE quitar voto (requiere login, sin body)
  // DELETE /api/reviews/:reviewId/votes
  router.delete(
    '/',
    requireAuth,
    validateParams(ReviewVoteParamsSchema),
    controller.remove.bind(controller),
  );

  return router;
}
