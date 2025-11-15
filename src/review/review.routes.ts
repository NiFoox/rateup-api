import { Router } from 'express';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../shared/middlewares/validate.js';
import { ReviewController } from './review.controller.js';
import {
  ReviewCreateSchema,
  ReviewUpdateSchema,
  ReviewIdParamSchema,
  ReviewListQuerySchema,
} from './validators/review.validation.js';
import type { ReviewRepository } from './review.repository.interface.js';

export default function buildReviewRouter(repository: ReviewRepository) {
  const router = Router();
  const controller = new ReviewController(repository);

  // Create
  router.post(
    '/',
    validateBody(ReviewCreateSchema),
    controller.create.bind(controller),
  );

  // Get by id
  router.get(
    '/:id',
    validateParams(ReviewIdParamSchema),
    controller.getById.bind(controller),
  );

  // List
  router.get(
    '/',
    validateQuery(ReviewListQuerySchema),
    controller.list.bind(controller),
  );

  // Patch
  router.patch(
    '/:id',
    validateParams(ReviewIdParamSchema),
    validateBody(ReviewUpdateSchema),
    controller.patch.bind(controller),
  );

  // Delete
  router.delete(
    '/:id',
    validateParams(ReviewIdParamSchema),
    controller.delete.bind(controller),
  );

  return router;
}
