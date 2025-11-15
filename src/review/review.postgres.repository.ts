import { Pool } from 'pg';
import { Review } from './review.entity.js';
import type { ReviewRepository } from './review.repository.interface.js';

const mapRowToReview = (row: any): Review =>
  new Review(
    row.game_id,
    row.user_id,
    row.content,
    row.score,
    row.id,
    row.created_at,
  );

export class ReviewPostgresRepository implements ReviewRepository {
  constructor(private readonly db: Pool) {}

  async create(review: Review): Promise<Review> {
    const { rows } = await this.db.query(
      `INSERT INTO reviews (game_id, user_id, content, score)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [review.gameId, review.userId, review.content, review.score],
    );
    return mapRowToReview(rows[0]);
  }

  async findById(id: number): Promise<Review | null> {
    const { rows } = await this.db.query(
      'SELECT * FROM reviews WHERE id = $1',
      [id],
    );
    return rows[0] ? mapRowToReview(rows[0]) : null;
  }

  async getPaginated(
    offset: number,
    limit: number,
    opts?: { gameId?: number; userId?: number },
  ): Promise<Review[]> {
    const where: string[] = [];
    const values: any[] = [];

    if (opts?.gameId) {
      values.push(opts.gameId);
      where.push(`game_id = $${values.length}`);
    }

    if (opts?.userId) {
      values.push(opts.userId);
      where.push(`user_id = $${values.length}`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    values.push(limit, offset);
    const { rows } = await this.db.query(
      `SELECT * FROM reviews
       ${whereClause}
       ORDER BY id
       LIMIT $${values.length - 1}
       OFFSET $${values.length}`,
      values,
    );

    return rows.map(mapRowToReview);
  }

  async update(id: number, data: Partial<Review>): Promise<Review | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.gameId !== undefined) {
      fields.push(`game_id = $${idx++}`);
      values.push(data.gameId);
    }
    if (data.userId !== undefined) {
      fields.push(`user_id = $${idx++}`);
      values.push(data.userId);
    }
    if (data.content !== undefined) {
      fields.push(`content = $${idx++}`);
      values.push(data.content);
    }
    if (data.score !== undefined) {
      fields.push(`score = $${idx++}`);
      values.push(data.score);
    }

    if (!fields.length) {
      const existing = await this.findById(id);
      return existing ?? undefined;
    }

    values.push(id);
    const { rows } = await this.db.query(
      `UPDATE reviews
       SET ${fields.join(', ')}
       WHERE id = $${idx}
       RETURNING *`,
      values,
    );

    return rows[0] ? mapRowToReview(rows[0]) : undefined;
  }

  async delete(id: number): Promise<boolean> {
    const { rowCount } = await this.db.query(
      'DELETE FROM reviews WHERE id = $1',
      [id],
    );
    return (rowCount ?? 0) > 0;
  }
}
