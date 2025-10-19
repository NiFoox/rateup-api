import { Request, Response } from 'express';
import { GameRepository } from './game.repository.interface.js';
import { Game } from './game.entity.js';
import { GameCreateDTO, GameIdParams, GameListQuery, GameListQuerySchema } from './validators/game.validation.js';

export class GameController {

  constructor(private readonly repo: GameRepository) {
    this.repo = repo;
  }

  // Create
  async create(req: Request, res: Response) {
    const { name, description, genre } = req.body;
    if (await this.repo.findByName(name)) {
      return res.status(400).json({ error: "El nombre ya existe" });
    }
    let game = new Game(name, description, genre);
    const saved = await this.repo.create(game);
    return res.status(201).location(`/games/${saved.id}`).json(saved);
  }

  // Read
  async getById(req: Request, res: Response) {
    const { id } = res.locals.validated.params as GameIdParams;
    const game = await this.repo.findById(id);
    return game ? res.json(game) : res.status(404).json({ error: "Juego no encontrado" });
  }

  async list(req: Request, res: Response) {
    const q: GameListQuery =
      (res.locals?.validated?.query as GameListQuery)
      ?? GameListQuerySchema.parse(req.query);

    const { page, limit, search, genre, all } = q;

    if (all) {
      const games = await this.repo.getAll();
      return res.json(games);
    }
    else {
      const offset = (page - 1) * limit;

      const games = await this.repo.getPaginated(offset, limit, { search, genre });
      return res.json({ page, limit, data: games });
    }
    
  }

  // Update
  async patch(req: Request, res: Response) {
    const { id } = res.locals.validated.params as GameIdParams;
    const { name, description, genre } = req.body;
    let game = new Game(name, description, genre);
    const patched = await this.repo.patch(id, game);
    return patched ? res.json(patched) : res.status(404).json({ error: "Juego no encontrado" });
  }

  // Delete
  async delete(req: Request, res: Response) {
    const { id } = res.locals.validated.params as GameIdParams;
    const deleted = await this.repo.delete(id);
    return deleted
      ? res.status(204).send()
      : res.status(404).json({ error: 'Juego no encontrado' });
  }
}
