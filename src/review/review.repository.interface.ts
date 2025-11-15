import { Review } from './review.entity.js';

export interface ReviewRepository {
  create(review: Review): Promise<Review>;
  findById(id: number): Promise<Review | null>;

  getPaginated(
    offset: number,
    limit: number,
    opts?: { gameId?: number; userId?: number },
  ): Promise<Review[]>;

  update(id: number, data: Partial<Review>): Promise<Review | undefined>;

  delete(id: number): Promise<boolean>;
}
