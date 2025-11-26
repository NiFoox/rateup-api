import { Request, Response } from 'express';
import type { GameRepository } from './game.repository.interface.js';
import { Game } from './game.entity.js';
import {
  GameCreateSchema,
  GameUpdateSchema,
  GameIdParamSchema,
  GameListQuerySchema,
  type GameCreateDTO,
  type GameUpdateDTO,
  type GameIdParamDTO,
  type GameListQueryDTO,
} from './validators/game.validation.js';

export class GameController {
  constructor(private readonly repo: GameRepository) {}

  // Create
  async create(req: Request, res: Response) {
    const body: GameCreateDTO =
      (res.locals?.validated?.body as GameCreateDTO) ??
      GameCreateSchema.parse(req.body);

    const { name, description, genre } = body;

    if (await this.repo.findByName(name)) {
      return res.status(400).json({ error: 'El nombre ya existe' });
    }

    const game = new Game(name, description, genre);
    const saved = await this.repo.create(game);

    return res.status(201).location(`/games/${saved.id}`).json(saved);
  }

  // Read
  async getById(req: Request, res: Response) {
    const params: GameIdParamDTO =
      (res.locals?.validated?.params as GameIdParamDTO) ??
      GameIdParamSchema.parse(req.params);

    const game = await this.repo.findById(params.id);
    return game
      ? res.json(game)
      : res.status(404).json({ error: 'Juego no encontrado' });
  }

  async list(req: Request, res: Response) {
    const q: GameListQueryDTO =
      (res.locals?.validated?.query as GameListQueryDTO) ??
      GameListQuerySchema.parse(req.query);

    const { page, limit, search, genre, all } = q;

    if (all) {
      const games = await this.repo.getAll();
      return res.json(games);
    } else {
      const offset = (page - 1) * limit;
      const games = await this.repo.getPaginated(offset, limit, { search, genre });
      return res.json({ page, limit, data: games });
    }
  }

  // Update (PATCH)
  async patch(req: Request, res: Response) {
    const params: GameIdParamDTO =
      (res.locals?.validated?.params as GameIdParamDTO) ??
      GameIdParamSchema.parse(req.params);

    const body: GameUpdateDTO =
      (res.locals?.validated?.body as GameUpdateDTO) ??
      GameUpdateSchema.parse(req.body);

    // body ya está validado y es parcial, matchea con Partial<Game>
    const patched = await this.repo.patch(params.id, body);

    return patched
      ? res.json(patched)
      : res.status(404).json({ error: 'Juego no encontrado' });
  }

  // Delete
  async delete(req: Request, res: Response) {
    const params: GameIdParamDTO =
      (res.locals?.validated?.params as GameIdParamDTO) ??
      GameIdParamSchema.parse(req.params);

    const deleted = await this.repo.delete(params.id);
    return deleted
      ? res.status(204).send()
      : res.status(404).json({ error: 'Juego no encontrado' });
  }
}
