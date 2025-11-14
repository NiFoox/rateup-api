import { Comment, Review, ReviewWithUserVote, VoteValue } from './review.entity.js';
import {
  CommentListFilters,
  ReviewListFilters,
  ReviewRepository,
} from './review.repository.interface.js';

type Pool = import('pg').Pool;

function mapReviewRow(row: any): ReviewWithUserVote {
  return {
    id: String(row.id),
    title: row.title,
    game: row.game,
    authorId: String(row.author_id),
    authorName: row.author_name,
    tags: (row.tags ?? []) as string[],
    rating: Number(row.rating ?? 0),
    body: row.body,
    votes: Number(row.votes ?? row.votes_count ?? 0),
    comments: Number(row.comments ?? row.comments_count ?? 0),
    createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    updatedAt: row.updated_at ?? null,
    userVote: Number(row.user_vote ?? 0) as VoteValue,
  };
}

function mapCommentRow(row: any): Comment {
  return {
    id: String(row.id),
    reviewId: String(row.review_id),
    authorId: String(row.author_id),
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    updatedAt: row.updated_at ?? null,
    votes: row.votes !== undefined && row.votes !== null ? Number(row.votes) : undefined,
  };
}

const SORT_CLAUSES: Record<NonNullable<ReviewListFilters['sort']>, string> = {
  hot: 'votes DESC, comments DESC, created_at DESC',
  new: 'created_at DESC',
  top: 'rating DESC, votes DESC',
};

export class ReviewPostgresRepository implements ReviewRepository {
  constructor(private readonly pool: Pool) {}

  async list(filters: ReviewListFilters): Promise<{ reviews: ReviewWithUserVote[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];

    if (filters.search) {
      values.push(`%${filters.search.toLowerCase()}%`);
      const index = values.length;
      conditions.push(`(LOWER(title) LIKE $${index} OR LOWER(body) LIKE $${index})`);
    }

    if (filters.tag) {
      values.push(filters.tag);
      conditions.push(`$${values.length} = ANY(tags)`);
    }

    if (filters.game) {
      values.push(filters.game);
      conditions.push(`LOWER(game) = LOWER($${values.length})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalQuery = `SELECT COUNT(*)::int AS total FROM reviews ${whereClause}`;
    const totalResult = await this.pool.query<{ total: number }>(totalQuery, values);
    const total = totalResult.rows[0]?.total ?? 0;

    const orderClause = SORT_CLAUSES[filters.sort ?? 'new'] ?? SORT_CLAUSES.new;

    const queryValues = [...values];
    let userVoteJoin = '';
    if (filters.userId) {
      queryValues.push(filters.userId);
      userVoteJoin = `LEFT JOIN review_votes uv ON uv.review_id = r.id AND uv.user_id = $${queryValues.length}`;
    }
    const userVoteSelect = filters.userId ? 'COALESCE(uv.value, 0) AS user_vote' : '0 AS user_vote';

    const limitIndex = queryValues.length + 1;
    const offsetIndex = queryValues.length + 2;
    queryValues.push(filters.limit, filters.offset);

    const dataQuery = `
      SELECT
        r.id,
        r.title,
        r.game,
        r.author_id,
        r.author_name,
        r.tags,
        r.rating,
        r.body,
        r.votes_count AS votes,
        r.comments_count AS comments,
        r.created_at,
        r.updated_at,
        ${userVoteSelect}
      FROM reviews r
      ${userVoteJoin}
      ${whereClause}
      ORDER BY ${orderClause}
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `;

    const { rows } = await this.pool.query(dataQuery, queryValues);
    const reviews = rows.map(mapReviewRow);

    // TODO: ensure reviews table exposes title, game, author_name, tags (TEXT[]), rating, body, votes_count, comments_count columns.

    return { reviews, total };
  }

  async findById(id: string, userId?: string): Promise<ReviewWithUserVote | null> {
    const values: any[] = [id];
    let userVoteJoin = '';
    if (userId) {
      values.push(userId);
      userVoteJoin = 'LEFT JOIN review_votes uv ON uv.review_id = r.id AND uv.user_id = $2';
    }

    const query = `
      SELECT
        r.id,
        r.title,
        r.game,
        r.author_id,
        r.author_name,
        r.tags,
        r.rating,
        r.body,
        r.votes_count AS votes,
        r.comments_count AS comments,
        r.created_at,
        r.updated_at,
        ${userId ? 'COALESCE(uv.value, 0) AS user_vote' : '0 AS user_vote'}
      FROM reviews r
      ${userVoteJoin}
      WHERE r.id = $1
    `;

    const { rows } = await this.pool.query(query, values);
    return rows[0] ? mapReviewRow(rows[0]) : null;
  }

  async saveVote(
    reviewId: string,
    userId: string,
    value: VoteValue,
  ): Promise<{ review: Review; userVote: VoteValue }> {
    if (value === 0) {
      await this.pool.query('DELETE FROM review_votes WHERE review_id = $1 AND user_id = $2', [reviewId, userId]);
    } else {
      await this.pool.query(
        `
        INSERT INTO review_votes (review_id, user_id, value)
        VALUES ($1, $2, $3)
        ON CONFLICT (review_id, user_id)
        DO UPDATE SET value = EXCLUDED.value
      `,
        [reviewId, userId, value],
      );
    }

    // TODO: ensure review_votes table exists with columns (review_id UUID, user_id UUID, value SMALLINT).

    const review = await this.findById(reviewId, userId);
    if (!review) {
      throw new Error('REVIEW_NOT_FOUND');
    }

    const { userVote, ...rest } = review;
    return { review: rest, userVote };
  }

  async getComments(filters: CommentListFilters): Promise<{ comments: Comment[]; total: number }> {
    const totalQuery = 'SELECT COUNT(*)::int AS total FROM review_comments WHERE review_id = $1';
    const totalResult = await this.pool.query<{ total: number }>(totalQuery, [filters.reviewId]);
    const total = totalResult.rows[0]?.total ?? 0;

    const query = `
      SELECT id, review_id, author_id, author_name, body, created_at, updated_at
      FROM review_comments
      WHERE review_id = $1
      ORDER BY created_at ASC
      LIMIT $2
      OFFSET $3
    `;

    const { rows } = await this.pool.query(query, [filters.reviewId, filters.limit, filters.offset]);
    return { comments: rows.map(mapCommentRow), total };
  }

  async addComment(reviewId: string, authorId: string, authorName: string, body: string): Promise<Comment> {
    const { rows } = await this.pool.query(
      `
      INSERT INTO review_comments (review_id, author_id, author_name, body)
      VALUES ($1, $2, $3, $4)
      RETURNING id, review_id, author_id, author_name, body, created_at, updated_at
    `,
      [reviewId, authorId, authorName, body],
    );

    if (!rows[0]) {
      throw new Error('COMMENT_CREATE_FAILED');
    }

    // TODO: ensure review_comments table has author_name column to store denormalised user name.
    return mapCommentRow(rows[0]);
  }

  async updateComment(
    reviewId: string,
    commentId: string,
    authorId: string,
    body: string,
  ): Promise<Comment | null> {
    const { rows } = await this.pool.query(
      `
      UPDATE review_comments
      SET body = $4, updated_at = NOW()
      WHERE id = $2 AND review_id = $1 AND author_id = $3
      RETURNING id, review_id, author_id, author_name, body, created_at, updated_at
    `,
      [reviewId, commentId, authorId, body],
    );

    return rows[0] ? mapCommentRow(rows[0]) : null;
  }

  async deleteComment(reviewId: string, commentId: string, authorId: string): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM review_comments WHERE id = $1 AND review_id = $2 AND author_id = $3',
      [commentId, reviewId, authorId],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
