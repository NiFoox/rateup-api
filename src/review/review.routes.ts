import { Router } from 'express';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../shared/middlewares/validate.js';
import { requireAuth } from '../shared/middlewares/auth.js';
import { ReviewController } from './review.controller.js';
import {
  ReviewCreateSchema,
  ReviewUpdateSchema,
  ReviewIdParamSchema,
  ReviewListQuerySchema,
} from './validators/review.validation.js';
import type { ReviewRepository } from './review.repository.interface.js';
import type { ReviewCommentRepository } from '../review-comment/review-comment.repository.interface.js';
import type { ReviewVoteRepository } from '../review-vote/review-vote.repository.interface.js';

export default function buildReviewRouter(
  reviewRepository: ReviewRepository,
  reviewCommentRepository: ReviewCommentRepository,
  reviewVoteRepository: ReviewVoteRepository,
) {
  const router = Router();
  const controller = new ReviewController(
    reviewRepository,
    reviewCommentRepository,
    reviewVoteRepository,
  );

  // Create review (requiere login)
  router.post(
    '/',
    requireAuth,
    validateBody(ReviewCreateSchema),
    controller.create.bind(controller),
  );

  // Get by id - público
  router.get(
    '/:id',
    validateParams(ReviewIdParamSchema),
    controller.getById.bind(controller),
  );

  // List - público
  router.get(
    '/',
    validateQuery(ReviewListQuerySchema),
    controller.list.bind(controller),
  );

  // Details - público
  router.get(
    '/:id/details',
    validateParams(ReviewIdParamSchema),
    controller.getWithRelations.bind(controller),
  );

  // Full (review + user + game + comments + votes) - público
  router.get(
    '/:id/full',
    validateParams(ReviewIdParamSchema),
    controller.getFull.bind(controller),
  );

  // Patch review (requiere login)
  router.patch(
    '/:id',
    requireAuth,
    validateParams(ReviewIdParamSchema),
    validateBody(ReviewUpdateSchema),
    controller.patch.bind(controller),
  );

  // Delete review (requiere login)
  router.delete(
    '/:id',
    requireAuth,
    validateParams(ReviewIdParamSchema),
    controller.delete.bind(controller),
  );

  return router;
}
