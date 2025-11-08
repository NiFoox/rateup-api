import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../shared/middlewares/validate.js';
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

  //Create
  gameRouter.post('/', validateBody(GameCreateSchema), controller.create.bind(controller));

  //Read
  // !!! el profe dijo q se usa mas algo como routes, se referira a hacer algo como composition routes? o flashie composition root

  gameRouter.get('/:id', validateParams(GameIdParamSchema), controller.getById.bind(controller));

  gameRouter.get('/', validateQuery(GameListQuerySchema), controller.list.bind(controller));

  //Update
  gameRouter.patch(
    '/:id',
    validateParams(GameIdParamSchema),
    validateBody(GameUpdateSchema),
    controller.patch.bind(controller),
  );

  //Delete
  gameRouter.delete('/:id', validateParams(GameIdParamSchema), controller.delete.bind(controller));

  return gameRouter;
}
