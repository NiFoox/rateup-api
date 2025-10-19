import { Pool } from 'pg';
import { Game } from './game.entity.js';
import { GameRepository } from './game.repository.interface.js';

export class GamePostgresRepository implements GameRepository {
  constructor(private readonly db: Pool) {
    this.db = db;
  }

  // Create
  async create(game: Game): Promise<Game> {
    const { rows } = await this.db.query<Game>(
      'INSERT INTO games (name, description, genre) VALUES ($1,$2,$3) RETURNING *',
      [game.name, game.description, game.genre]
    );
    return rows[0];
  }

  // Read
  async findById(id: number): Promise<Game | null> {
    const { rows } = await this.db.query<Game>('SELECT * FROM games WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async findByName(name: string): Promise<Game | null> {
    const { rows } = await this.db.query<Game>('SELECT * FROM games WHERE name = $1', [name]);
    return rows[0] || null;
  }

  async getPaginated(
    offset: number,
    limit: number,
    opts?: { search?: string; genre?: string }
  ): Promise<Game[]> {
    const where: string[] = [];
    const params: any[] = [];
    let i = 1;

    if (opts?.search) {
      where.push(`(name ILIKE $${i} OR description ILIKE $${i})`);
      params.push(`%${opts.search}%`);
      i++;
    }
    if (opts?.genre) {
      where.push(`genre = $${i}`);
      params.push(opts.genre);
      i++;
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const sql = `
      SELECT id, name, description, genre
      FROM games
      ${whereSQL}
      ORDER BY id
      LIMIT $${i} OFFSET $${i + 1}
    `;
    params.push(limit, offset);

    const { rows } = await this.db.query<Game>(sql, params);
    return rows;
  } // Se ordena por id, agregarle order by name después

  async getAll(): Promise<Game[]> {
    const { rows } = await this.db.query<Game>('SELECT * FROM games ORDER BY id');
    return rows;
  }

  // Update
  async patch(id: number, game: Partial<Game>): Promise<Game | undefined> {
    const updatableFields: Array<keyof Pick<Game, 'name' | 'description' | 'genre'>> = [
      'name',
      'description',
      'genre',
    ];

    const setters: string[] = [];
    const values: unknown[] = [];

    updatableFields.forEach((field) => {
      const value = game[field];
      if (value !== undefined) {
        setters.push(`${field} = $${setters.length + 1}`);
        values.push(value);
      }
    });

    if (!setters.length) {
      const { rows } = await this.db.query<Game>('SELECT * FROM games WHERE id = $1', [id]);
      return rows[0] ?? undefined;
    }

    values.push(id);
    const query = `UPDATE games SET ${setters.join(', ')} WHERE id = $${values.length} RETURNING *`;
    const { rows } = await this.db.query<Game>(query, values);

    return rows[0] ?? undefined;
  }

  // Delete
  async delete(id: number): Promise<boolean> {
    const { rowCount } = await this.db.query('DELETE FROM games WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  }
}