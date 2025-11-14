import { Router } from 'express';
import { ReviewController } from './review.controller.js';
import {
  CommentBodySchema,
  CommentIdParamSchema,
  CommentListQuerySchema,
  ReviewIdParamSchema,
  ReviewListQuerySchema,
  VoteRequestSchema,
} from './validators/review.validation.js';
import { validateBody, validateParams, validateQuery } from '../shared/middlewares/validate.js';

export function buildReviewRouter(controller: ReviewController) {
  const router = Router();

  router.get('/', validateQuery(ReviewListQuerySchema), controller.list);
  router.get('/:reviewId', validateParams(ReviewIdParamSchema), controller.getById);
  router.post(
    '/:reviewId/votes',
    validateParams(ReviewIdParamSchema),
    validateBody(VoteRequestSchema),
    controller.vote,
  );
  router.get(
    '/:reviewId/comments',
    validateParams(ReviewIdParamSchema),
    validateQuery(CommentListQuerySchema),
    controller.getComments,
  );
  router.post(
    '/:reviewId/comments',
    validateParams(ReviewIdParamSchema),
    validateBody(CommentBodySchema),
    controller.addComment,
  );
  router.patch(
    '/:reviewId/comments/:commentId',
    validateParams(CommentIdParamSchema),
    validateBody(CommentBodySchema),
    controller.updateComment,
  );
  router.delete(
    '/:reviewId/comments/:commentId',
    validateParams(CommentIdParamSchema),
    controller.deleteComment,
  );

  return router;
}
