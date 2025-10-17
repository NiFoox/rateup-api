import { Request, Response } from 'express';
import { GamePostgresRepository } from './game.postgres.repository.js';
import { Game } from './game.entity.js';
import { GameCreateDTO, GameIdParams, GameListQuery, GameListQuerySchema } from './validators/game.validation.js';

const repo = new GamePostgresRepository();

export class GameController {

  // Create
  async create(req: Request<{}, any, GameCreateDTO>, res: Response) {
    const { name, description, genre } = req.body;
    if (await repo.findByName(name)) {
      return res.status(400).json({ error: "El nombre ya existe" });
    }
    let game = new Game(name, description, genre);
    const saved = await repo.create(game);
    return res.status(201).location(`/games/${saved.id}`).json(saved);
  }

  // Read
  async getById(req: Request, res: Response) {
    const id = Number(req.params.id); // Creo que no hace falta el Number() si usás Zod con coerce
    // Alternativa: const { id } = res.locals.validated.params as GameIdParams;
    // (siempre y cuando el middleware de validación se haya ejecutado antes)
    const game = await repo.findById(id);
    return game ? res.json(game) : res.status(404).json({ error: "Juego no encontrado" });
  }

  async list(req: Request, res: Response) {
    const q: GameListQuery =
      (res.locals?.validated?.query as GameListQuery)
      ?? GameListQuerySchema.parse(req.query);

    const { page, limit, search, genre } = q;
    const offset = (page - 1) * limit;

    const games = await repo.getPaginated(offset, limit, { search, genre });
    return res.json({ page, limit, data: games });
  }


/*
async list(req: Request, res: Response) {
  const q = (res.locals?.validated?.query) || req.query;
  // si usás Zod con coerce, page/limit ya deberían ser números;
  // si no, parsealos como venías haciendo
  const page  = q.page || 1;
  const limit = q.limit || 10;
  const offset = (page - 1) * limit;

  const search = q.search || undefined;
  const genre  = q.genre || undefined;

  const games = await repo.getPaginated(offset, limit, { search, genre });
  return res.json({ page, limit, data: games });
}
*/

  async getAll(req: Request, res: Response) {
    const games = await repo.getAll();
    return res.json(games);
  }

  // Update
  async patch(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { name, description, genre } = req.body;
    let game = new Game(name, description, genre);
    const patched = await repo.patch(id, game);
    return patched ? res.json(patched) : res.status(404).json({ error: "Juego no encontrado" });
  }

  // Delete
  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    const deleted = await repo.delete(id);
    return deleted
      ? res.status(204).send()
      : res.status(404).json({ error: 'Juego no encontrado' });
  }
}
