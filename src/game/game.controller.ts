import { Request, Response } from 'express';
import { GamePostgresRepository } from './game.postgres.repository.js';
import { Game } from './game.entity.js';

const repo = new GamePostgresRepository();

export class GameController {
  async create(req: Request, res: Response) {
    const { name, description, genre } = req.body;

    if (!name || !description || !genre) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (await repo.findByName(name)) {
      return res.status(400).json({ error: 'El nombre ya existe' });
    }

    const game = new Game(name, description, genre);
    const saved = await repo.create(game);
    res
      .status(201)
      .location(`/games/${saved.id}`) // Location relativa
      .json(saved);
  }

  async get(req: Request, res: Response) {
    const id = Number(req.params.id);
    const game = await repo.findById(id);
    return game
      ? res.json(game)
      : res.status(404).json({ error: 'Juego no encontrado' });
  }

  async getAll(req: Request, res: Response) {
    const games = await repo.getAll();
    res.json(games);
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await repo.update(id, data);
    return updated
      ? res.json(updated)
      : res.status(404).json({ error: 'Juego no encontrado' });
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    const deleted = await repo.delete(id);
    return deleted
      ? res.status(204).send()
      : res.status(404).json({ error: 'Juego no encontrado' });
  }
}
