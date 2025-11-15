import { z } from 'zod';

// /api/reviews/:reviewId/votes
export const ReviewVoteParamsSchema = z.object({
  reviewId: z.coerce.number().int().positive(),
});

// Body para PUT (upsert vote)
export const ReviewVoteBodySchema = z
  .object({
    userId: z.coerce.number().int().positive(),
    value: z.union([z.literal(1), z.literal(-1)]),
  })
  .strict();

// Body para DELETE (remove vote)
export const ReviewVoteDeleteBodySchema = z
  .object({
    userId: z.coerce.number().int().positive(),
  })
  .strict();

export type ReviewVoteParamsDTO = z.infer<typeof ReviewVoteParamsSchema>;
export type ReviewVoteBodyDTO = z.infer<typeof ReviewVoteBodySchema>;
export type ReviewVoteDeleteBodyDTO = z.infer<
  typeof ReviewVoteDeleteBodySchema
>;
