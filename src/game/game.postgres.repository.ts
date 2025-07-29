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
    const res = await client.query(
      'INSERT INTO games (name, description, genre) VALUES ($1,$2,$3) RETURNING *',
      [game.name, game.description, game.genre]
    );
    return res.rows[0];
  }

  async findByName(name: string): Promise<Game | null> {
    const res = await client.query('SELECT * FROM games WHERE name = $1', [name]);
    return res.rows[0] || null;
  }

  async update(id: number, game: Partial<Game>): Promise<Game | undefined> {
    const res = await client.query(
      'UPDATE games SET name = $1, description = $2, genre = $3 WHERE id = $4 RETURNING *',
      [game.name, game.description, game.genre, id]
    );
    return res.rows[0] || undefined;
  }

  async delete(id: number): Promise<boolean> {
    const res = await client.query('DELETE FROM games WHERE id = $1', [id]);

    if (res.rowCount !== null) {
        return res.rowCount > 0;
    }
    else {
        return false;
    }
    
    //return (res.rowCount ?? 0)> 0;
    //return res.rowCount! > 0;
    //El operador ! asume que rowCount no es undefined, pero es mejor evitarlo para mayor claridad.
  }
}

