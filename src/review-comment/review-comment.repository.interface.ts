import { ReviewComment } from './review-comment.entity.js';

export interface ReviewCommentRepository {
  create(comment: ReviewComment): Promise<ReviewComment>;
  findById(id: number): Promise<ReviewComment | null>;
  getByReview(
    reviewId: number,
    offset: number,
    limit: number,
  ): Promise<ReviewComment[]>;
  update(
    id: number,
    data: Partial<Pick<ReviewComment, 'content'>>,
  ): Promise<ReviewComment | undefined>;
  delete(id: number, reviewId?: number): Promise<boolean>;
}
