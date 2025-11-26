// src/review-vote/review-vote.routes.ts
import { Router } from 'express';
import {
  validateBody,
  validateParams,
} from '../shared/middlewares/validate.js';
import { requireAuth } from '../shared/middlewares/auth.js';
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
    validateParams(ReviewVoteParamsSchema),
    controller.getSummary.bind(controller),
  );

  // PUT votar / cambiar voto (requiere login)
  // PUT /api/reviews/:reviewId/votes
  router.put(
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
