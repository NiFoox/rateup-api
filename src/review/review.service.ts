import { PagedResult } from '../shared/types/pagination.js';
import {
  CommentDto,
  Comment,
  Review,
  ReviewDto,
  ReviewWithUserVote,
  ReviewWithUserVoteDto,
  VoteValue,
} from './review.entity.js';
import {
  CommentListFilters,
  ReviewListFilters,
  ReviewRepository,
} from './review.repository.interface.js';

function toReviewDto(review: Review): ReviewDto {
  return {
    id: review.id,
    title: review.title,
    game: review.game,
    authorId: review.authorId,
    authorName: review.authorName,
    tags: review.tags,
    rating: review.rating,
    body: review.body,
    votes: review.votes,
    comments: review.comments,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt ? new Date(review.updatedAt).toISOString() : undefined,
  };
}

function toReviewWithVoteDto(review: ReviewWithUserVote): ReviewWithUserVoteDto {
  return {
    ...toReviewDto(review),
    userVote: review.userVote ?? 0,
  };
}

function toCommentDto(comment: Comment): CommentDto {
  return {
    id: comment.id,
    reviewId: comment.reviewId,
    authorId: comment.authorId,
    authorName: comment.authorName,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt ? new Date(comment.updatedAt).toISOString() : undefined,
    votes: comment.votes,
  };
}

export class ReviewService {
  constructor(private readonly repository: ReviewRepository) {}

  async list(filters: ReviewListFilters): Promise<PagedResult<ReviewWithUserVoteDto>> {
    const { reviews, total } = await this.repository.list(filters);
    return {
      items: reviews.map(toReviewWithVoteDto),
      total,
      page: Math.floor(filters.offset / filters.limit) + 1,
      pageSize: filters.limit,
    };
  }

  async getById(id: string, userId?: string): Promise<ReviewWithUserVoteDto | null> {
    const review = await this.repository.findById(id, userId);
    return review ? toReviewWithVoteDto(review) : null;
  }

  async vote(reviewId: string, userId: string, value: VoteValue): Promise<{ review: ReviewDto; userVote: VoteValue }> {
    const result = await this.repository.saveVote(reviewId, userId, value);
    return { review: toReviewDto(result.review), userVote: result.userVote };
  }

  async getComments(filters: CommentListFilters): Promise<PagedResult<CommentDto>> {
    const { comments, total } = await this.repository.getComments(filters);
    return {
      items: comments.map(toCommentDto),
      total,
      page: Math.floor(filters.offset / filters.limit) + 1,
      pageSize: filters.limit,
    };
  }

  async addComment(reviewId: string, authorId: string, authorName: string, body: string): Promise<CommentDto> {
    const comment = await this.repository.addComment(reviewId, authorId, authorName, body);
    return toCommentDto(comment);
  }

  async updateComment(
    reviewId: string,
    commentId: string,
    authorId: string,
    body: string,
  ): Promise<CommentDto | null> {
    const comment = await this.repository.updateComment(reviewId, commentId, authorId, body);
    return comment ? toCommentDto(comment) : null;
  }

  async deleteComment(reviewId: string, commentId: string, authorId: string): Promise<boolean> {
    return this.repository.deleteComment(reviewId, commentId, authorId);
  }
}
