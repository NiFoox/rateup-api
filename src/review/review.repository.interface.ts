import { Review } from './review.entity';

export interface ReviewRepository {
  create(review: Review): Promise<Review | undefined>;
}
