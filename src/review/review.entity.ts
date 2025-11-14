export type VoteValue = -1 | 0 | 1;

export interface Review {
  id: string;
  title: string;
  game: string;
  authorId: string;
  authorName: string;
  tags: string[];
  rating: number;
  body: string;
  votes: number;
  comments: number;
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface ReviewWithUserVote extends Review {
  userVote: VoteValue;
}

export interface Comment {
  id: string;
  reviewId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: Date;
  updatedAt?: Date | null;
  votes?: number;
}

export interface ReviewDto extends Omit<Review, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewWithUserVoteDto extends ReviewDto {
  userVote: VoteValue;
}

export interface CommentDto extends Omit<Comment, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt?: string;
}
