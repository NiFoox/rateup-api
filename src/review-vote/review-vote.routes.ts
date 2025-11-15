import { Router } from 'express';
import {
  validateBody,
  validateParams,
} from '../shared/middlewares/validate.js';
import { ReviewVoteController } from './review-vote.controller.js';
import {
  ReviewVoteParamsSchema,
  ReviewVoteBodySchema,
  ReviewVoteDeleteBodySchema,
} from './validators/review-vote.validation.js';
import type { ReviewVoteRepository } from './review-vote.repository.interface.js';

export default function buildReviewVoteRouter(
  repository: ReviewVoteRepository,
) {
  // mergeParams: true para acceder a :reviewId del prefijo
  const router = Router({ mergeParams: true });
  const controller = new ReviewVoteController(repository);

  // GET resumen de votos
  // GET /api/reviews/:reviewId/votes
  router.get(
    '/',
    validateParams(ReviewVoteParamsSchema),
    controller.getSummary.bind(controller),
  );

  // PUT votar / cambiar voto
  // PUT /api/reviews/:reviewId/votes
  router.put(
    '/',
    validateParams(ReviewVoteParamsSchema),
    validateBody(ReviewVoteBodySchema),
    controller.upsert.bind(controller),
  );

  // DELETE quitar voto
  // DELETE /api/reviews/:reviewId/votes
  router.delete(
    '/',
    validateParams(ReviewVoteParamsSchema),
    validateBody(ReviewVoteDeleteBodySchema),
    controller.remove.bind(controller),
  );

  return router;
}
