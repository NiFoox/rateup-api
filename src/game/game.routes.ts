import { Router } from 'express';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../shared/middlewares/validate.js';
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

  // Create
  gameRouter.post(
    '/',
    validateBody(GameCreateSchema),
    controller.create.bind(controller),
  );

  // Read (by id)
  gameRouter.get(
    '/:id',
    validateParams(GameIdParamSchema),
    controller.getById.bind(controller),
  );

  // List (paginado / filtros)
  gameRouter.get(
    '/',
    validateQuery(GameListQuerySchema),
    controller.list.bind(controller),
  );

  // Update (PATCH)
  gameRouter.patch(
    '/:id',
    validateParams(GameIdParamSchema),
    validateBody(GameUpdateSchema),
    controller.patch.bind(controller),
  );

  // Delete
  gameRouter.delete(
    '/:id',
    validateParams(GameIdParamSchema),
    controller.delete.bind(controller),
  );

  return gameRouter;
}
