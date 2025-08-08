import { Client } from 'pg';
import { Game } from './game.entity.js';
import { GameRepository } from './game.repository.interface.js';

const client = new Client({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  user: process.env.POSTGRES_USER || 'rateup',
  password: process.env.POSTGRES_PASSWORD || 'rateup123',
  database: process.env.POSTGRES_DB || 'rateupdb',
});

client.connect(); // Le da un único "hilo" a la conexión a la base de datos

export class GamePostgresRepository implements GameRepository {
  async create(game: Game): Promise<Game> {
    const { rows } = await client.query<Game>(
      'INSERT INTO games (name, description, genre) VALUES ($1,$2,$3) RETURNING *',
      [game.name, game.description, game.genre]
    );
    return rows[0];
  }

  async findById(id: number): Promise<Game | null> {
    const { rows } = await client.query<Game>('SELECT * FROM games WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async findByName(name: string): Promise<Game | null> {
    const { rows } = await client.query<Game>('SELECT * FROM games WHERE name = $1', [name]);
    return rows[0] || null;
  }

  async getAll(): Promise<Game[]> {
    const { rows } = await client.query<Game>('SELECT * FROM games');
    return rows;
  }

  async update(id: number, game: Partial<Game>): Promise<Game | undefined> {
    const { rows } = await client.query<Game>(
      'UPDATE games SET name = $1, description = $2, genre = $3 WHERE id = $4 RETURNING *',
      [game.name, game.description, game.genre, id]
    );
    return rows[0] || undefined;
  }

  async delete(id: number): Promise<boolean> {
    const { rowCount } = await client.query('DELETE FROM games WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  }
}