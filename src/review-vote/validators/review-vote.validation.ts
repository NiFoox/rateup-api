// src/review-vote/validators/review-vote.validation.ts
import { z } from 'zod';

// /api/reviews/:reviewId/votes
export const ReviewVoteParamsSchema = z.object({
  reviewId: z.coerce.number().int().positive(),
});

// Body para PUT (upsert vote)
export const ReviewVoteBodySchema = z
  .object({
    value: z.union([z.literal(1), z.literal(-1)]),
  })
  .strict();

export type ReviewVoteParamsDTO = z.infer<typeof ReviewVoteParamsSchema>;
export type ReviewVoteBodyDTO = z.infer<typeof ReviewVoteBodySchema>;
