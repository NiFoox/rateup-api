import { Router } from 'express';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../shared/middlewares/validate.js';
import { ReviewCommentController } from './review-comment.controller.js';
import {
  ReviewCommentBaseParamsSchema,
  ReviewCommentWithIdParamsSchema,
  ReviewCommentCreateSchema,
  ReviewCommentUpdateSchema,
  ReviewCommentListQuerySchema,
} from './validators/review-comment.validation.js';
import type { ReviewCommentRepository } from './review-comment.repository.interface.js';

export default function buildReviewCommentRouter(
  repository: ReviewCommentRepository,
) {
  // mergeParams opcional.
  const router = Router({ mergeParams: true });
  const controller = new ReviewCommentController(repository);

  // POST /api/reviews/:reviewId/comments
  router.post(
    '/',
    validateParams(ReviewCommentBaseParamsSchema),
    validateBody(ReviewCommentCreateSchema),
    controller.create.bind(controller),
  );

  // GET /api/reviews/:reviewId/comments
  router.get(
    '/',
    validateParams(ReviewCommentBaseParamsSchema),
    validateQuery(ReviewCommentListQuerySchema),
    controller.list.bind(controller),
  );

  // PATCH /api/reviews/:reviewId/comments/:commentId
  router.patch(
    '/:commentId',
    validateParams(ReviewCommentWithIdParamsSchema),
    validateBody(ReviewCommentUpdateSchema),
    controller.patch.bind(controller),
  );

  // DELETE /api/reviews/:reviewId/comments/:commentId
  router.delete(
    '/:commentId',
    validateParams(ReviewCommentWithIdParamsSchema),
    controller.delete.bind(controller),
  );

  return router;
}
