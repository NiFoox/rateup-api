import { Router } from "express";
import { validateBody, validateParams, validateQuery } from "../shared/middlewares/validate.js";
import { GameCreateSchema, GameUpdateSchema, GameIdParamSchema, GameListQuerySchema } from "./validators/game.validation.js";
import { GameController } from './game.controller.js';

const gameRouter = Router();
const controller = new GameController();

//Create
gameRouter.post("/",  validateBody(GameCreateSchema),  controller.create);

//Read
gameRouter.get("/all", (req, res) => controller.getAll(req, res));

gameRouter.get("/:id", validateParams(GameIdParamSchema), controller.getById);

gameRouter.get("/",   validateQuery(GameListQuerySchema), controller.list);



//Update
gameRouter.patch("/:id",
  validateParams(GameIdParamSchema),
  validateBody(GameUpdateSchema),
  controller.patch
);

//Delete
gameRouter.delete(
  "/:id",
  validateParams(GameIdParamSchema),
  controller.delete
);

export default gameRouter;