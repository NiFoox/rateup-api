import { Comment, Review, ReviewWithUserVote, VoteValue } from './review.entity.js';

export interface ReviewListFilters {
  search?: string;
  tag?: string;
  game?: string;
  sort?: 'hot' | 'new' | 'top';
  offset: number;
  limit: number;
  userId?: string;
}

export interface CommentListFilters {
  reviewId: string;
  offset: number;
  limit: number;
}

export interface ReviewRepository {
  list(filters: ReviewListFilters): Promise<{ reviews: ReviewWithUserVote[]; total: number }>;
  findById(id: string, userId?: string): Promise<ReviewWithUserVote | null>;
  saveVote(reviewId: string, userId: string, value: VoteValue): Promise<{ review: Review; userVote: VoteValue }>;
  getComments(filters: CommentListFilters): Promise<{ comments: Comment[]; total: number }>;
  addComment(reviewId: string, authorId: string, authorName: string, body: string): Promise<Comment>;
  updateComment(
    reviewId: string,
    commentId: string,
    authorId: string,
    body: string,
  ): Promise<Comment | null>;
  deleteComment(reviewId: string, commentId: string, authorId: string): Promise<boolean>;
}
