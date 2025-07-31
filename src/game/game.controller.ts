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

    const exists = await repo.findByName(name);
    if (exists) {
      return res.status(400).json({ error: 'El nombre ya existe' });
    }

    const game = new Game(name, description, genre);
    const saved = await repo.create(game);
    res.status(201).json(saved);
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = req.body as Partial<Game>;
    const updated = await repo.update(id, data);
    if (!updated) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }
    res.json(updated);
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    const deleted = await repo.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }
    res.status(204).send();
  }
}
