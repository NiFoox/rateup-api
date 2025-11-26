import { Router } from 'express';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../shared/middlewares/validate.js';
import { requireAuth, requireRole } from '../shared/middlewares/auth.js';
import {
  GameCreateSchema,
  GameUpdateSchema,
  GameIdParamSchema,
  GameListQuerySchema,
} from './validators/game.validation.js';
import { GameController } from './game.controller.js';
import type { GameRepository } from './game.repository.interface.js';

export default function buildGameRouter(repo: GameRepository) {
  const gameRouter = Router();
  const controller = new GameController(repo);

  // Create (solo ADMIN)
  gameRouter.post(
    '/',
    requireAuth,
    requireRole('ADMIN'),
    validateBody(GameCreateSchema),
    controller.create.bind(controller),
  );

  // Read (by id) - público
  gameRouter.get(
    '/:id',
    validateParams(GameIdParamSchema),
    controller.getById.bind(controller),
  );

  // List (paginado / filtros) - público
  gameRouter.get(
    '/',
    validateQuery(GameListQuerySchema),
    controller.list.bind(controller),
  );

  // Update (PATCH) - solo ADMIN
  gameRouter.patch(
    '/:id',
    requireAuth,
    requireRole('ADMIN'),
    validateParams(GameIdParamSchema),
    validateBody(GameUpdateSchema),
    controller.patch.bind(controller),
  );

  // Delete - solo ADMIN
  gameRouter.delete(
    '/:id',
    requireAuth,
    requireRole('ADMIN'),
    validateParams(GameIdParamSchema),
    controller.delete.bind(controller),
  );

  return gameRouter;
}
