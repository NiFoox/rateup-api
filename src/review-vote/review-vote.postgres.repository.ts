import { Pool } from 'pg';
import { ReviewVote } from './review-vote.entity.js';
import type { ReviewVoteRepository } from './review-vote.repository.interface.js';

const mapRowToVote = (row: any): ReviewVote =>
  new ReviewVote(
    row.review_id,
    row.user_id,
    row.value,
    row.id,
    row.created_at,
    row.updated_at,
  );

export class ReviewVotePostgresRepository implements ReviewVoteRepository {
  constructor(private readonly db: Pool) {}

  async upsertVote(
    reviewId: number,
    userId: number,
    value: 1 | -1,
  ): Promise<ReviewVote> {
    try {
      const { rows } = await this.db.query(
        `
        INSERT INTO review_votes (review_id, user_id, value)
        VALUES ($1, $2, $3)
        ON CONFLICT (review_id, user_id)
        DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
        RETURNING *
        `,
        [reviewId, userId, value],
      );

      return mapRowToVote(rows[0]);
    } catch (error) {
      console.error('Error en ReviewVotePostgresRepository.upsertVote:', error);
      throw error;
    }
  }

  async deleteVote(reviewId: number, userId: number): Promise<boolean> {
    const { rowCount } = await this.db.query(
      `
      DELETE FROM review_votes
      WHERE review_id = $1 AND user_id = $2
      `,
      [reviewId, userId],
    );

    return (rowCount ?? 0) > 0;
  }

  async getSummary(reviewId: number): Promise<{
    upvotes: number;
    downvotes: number;
    score: number;
  }> {
    const { rows } = await this.db.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE value = 1)  AS upvotes,
        COUNT(*) FILTER (WHERE value = -1) AS downvotes,
        COALESCE(SUM(value), 0)            AS score
      FROM review_votes
      WHERE review_id = $1
      `,
      [reviewId],
    );

    const row = rows[0] ?? { upvotes: 0, downvotes: 0, score: 0 };

    return {
      upvotes: Number(row.upvotes ?? 0),
      downvotes: Number(row.downvotes ?? 0),
      score: Number(row.score ?? 0),
    };
  }
}
