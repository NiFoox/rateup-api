import { Pool } from 'pg';
import { Review } from './review.entity.js';
import type { ReviewRepository } from './review.repository.interface.js';
import type { ReviewWithRelationsDTO } from './dto/review-with-relations.dto.js';
import type { TrendingReviewDTO } from './dto/trending-review.dto.js';

const mapRowToReview = (row: any): Review =>
  new Review(
    row.game_id,
    row.user_id,
    row.content,
    row.score,
    row.id,
    row.created_at,
    row.updated_at,
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

  async findByIdWithRelations(id: number): Promise<ReviewWithRelationsDTO | null> {
    const query = `
      SELECT
        r.id,
        r.content,
        r.score,
        r.created_at,
        r.updated_at,
        u.id   AS user_id,
        u.username AS user_username,
        u.email    AS user_email,
        g.id   AS game_id,
        g.name AS game_name,
        g.genre AS game_genre
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      JOIN games g ON g.id = r.game_id
      WHERE r.id = $1
    `;

    const { rows } = await this.db.query(query, [id]);

    if (!rows[0]) {
      return null;
    }

    const row = rows[0];

    const dto: ReviewWithRelationsDTO = {
      id: row.id,
      content: row.content,
      score: row.score,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        id: row.user_id,
        username: row.user_username,
        email: row.user_email,
      },
      game: {
        id: row.game_id,
        name: row.game_name,
        genre: row.game_genre,
      },
    };

    return dto;
  }

  async getTrendingReviews(
    limit: number,
    daysWindow: number,
  ): Promise<TrendingReviewDTO[]> {
    const query = `
      SELECT
        r.id,
        r.content,
        r.score,
        r.created_at,
        u.id   AS user_id,
        u.username AS user_username,
        g.id   AS game_id,
        g.name AS game_name,
        g.genre AS game_genre,
        COALESCE(SUM(rv.value), 0) AS vote_score
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      JOIN games g ON g.id = r.game_id
      LEFT JOIN review_votes rv
        ON rv.review_id = r.id
       AND rv.created_at >= NOW() - ($1 || ' days')::INTERVAL
      WHERE r.created_at >= NOW() - ($1 || ' days')::INTERVAL
      GROUP BY
        r.id,
        r.content,
        r.score,
        r.created_at,
        u.id,
        u.username,
        g.id,
        g.name,
        g.genre
      ORDER BY
        vote_score DESC,
        r.created_at DESC
      LIMIT $2
    `;

    const { rows } = await this.db.query(query, [daysWindow, limit]);

    return rows.map((row) => ({
      id: row.id,
      content: row.content,
      score: row.score,
      createdAt: row.created_at,
      voteScore: Number(row.vote_score),
      user: {
        id: row.user_id,
        username: row.user_username,
      },
      game: {
        id: row.game_id,
        name: row.game_name,
        genre: row.game_genre,
      },
    }));
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

    // updated_at siempre cambia cuando se hace PATCH
    fields.push(`updated_at = NOW()`);

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
