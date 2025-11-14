import { z } from 'zod';

const emptyToUndefined = (value: unknown) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }
  return value;
};

export const ReviewListQuerySchema = z.object({
  page: z.preprocess((v) => emptyToUndefined(v), z.coerce.number().int().min(1)),
  limit: z.preprocess((v) => emptyToUndefined(v), z.coerce.number().int().min(1)),
  search: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  tag: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  game: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  sort: z.preprocess(emptyToUndefined, z.enum(['hot', 'new', 'top']).optional()),
});

export const ReviewIdParamSchema = z.object({
  reviewId: z.string().uuid().or(z.string().min(1)),
});

export const CommentIdParamSchema = ReviewIdParamSchema.extend({
  commentId: z.string().uuid().or(z.string().min(1)),
});

export const VoteRequestSchema = z.strictObject({
  value: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
});

export const CommentBodySchema = z.strictObject({
  body: z.string().min(1),
});

export const CommentListQuerySchema = z.object({
  page: z.preprocess((v) => emptyToUndefined(v), z.coerce.number().int().min(1)),
  limit: z.preprocess((v) => emptyToUndefined(v), z.coerce.number().int().min(1)),
});

export type ReviewListQuery = z.output<typeof ReviewListQuerySchema>;
export type VoteRequestDto = z.output<typeof VoteRequestSchema>;
export type CommentBodyDto = z.output<typeof CommentBodySchema>;
export type CommentListQuery = z.output<typeof CommentListQuerySchema>;
export type ReviewIdParams = z.output<typeof ReviewIdParamSchema>;
export type CommentIdParams = z.output<typeof CommentIdParamSchema>;
