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

  // Mis reseñas (usuario logueado) -> IMPORTANTE: antes de '/:id'
  router.get(
    '/me',
    requireAuth,
    validateQuery(ReviewListQuerySchema),
    controller.listMine.bind(controller),
  );

  // Crear reseña (requiere login)
  router.post(
    '/',
    requireAuth,
    validateBody(ReviewCreateSchema),
    controller.create.bind(controller),
  );

  // Obtener reseña por id - público
  router.get(
    '/:id',
    validateParams(ReviewIdParamSchema),
    controller.getById.bind(controller),
  );

  // Listar reseñas - público, con filtros opcionales
  router.get(
    '/',
    validateQuery(ReviewListQuerySchema),
    controller.list.bind(controller),
  );

  // Obtener reseña con relaciones básicas
  router.get(
    '/:id/details',
    validateParams(ReviewIdParamSchema),
    controller.getWithRelations.bind(controller),
  );

  // Obtener reseña completa
  router.get(
    '/:id/full',
    validateParams(ReviewIdParamSchema),
    controller.getFull.bind(controller),
  );

  // Actualizar reseña (dueño o ADMIN)
  router.patch(
    '/:id',
    requireAuth,
    validateParams(ReviewIdParamSchema),
    validateBody(ReviewUpdateSchema),
    controller.patch.bind(controller),
  );

  // Eliminar reseña (dueño o ADMIN)
  router.delete(
    '/:id',
    requireAuth,
    validateParams(ReviewIdParamSchema),
    controller.delete.bind(controller),
  );

  return router;
}
