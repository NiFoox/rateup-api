import { z } from 'zod';

// helper: "" -> undefined para que funcionen bien los default/optional
const emptyToUndef = (rawValue: unknown) =>
  typeof rawValue === 'string' && rawValue.trim() === '' ? undefined : rawValue;

// ---------- Body schemas ----------

// POST /games (obligatorio + strict)
export const GameCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    description: z.string().trim().min(1),
    genre: z.string().trim().min(1).max(100),
  })
  .strict();

// PATCH /games/:id (parcial + strict)
export const GameUpdateSchema = GameCreateSchema.partial().strict();

// ---------- Params schema ----------

export const GameIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// ---------- Query schema ----------

export const GameListQuerySchema = z.object({
  page: z.preprocess(
    emptyToUndef,
    z.coerce.number().int().min(1).default(1),
  ),
  limit: z.preprocess(
    emptyToUndef,
    z.coerce.number().int().min(1).max(100).default(20),
  ),
  search: z.preprocess(emptyToUndef, z.string().trim().optional()),
  genre: z.preprocess(emptyToUndef, z.string().trim().optional()),
  all: z.preprocess(
    emptyToUndef,
    z.coerce.boolean().optional().default(false),
  ),
});

// ---------- Types (DTOs) ----------

export type GameCreateDTO = z.infer<typeof GameCreateSchema>;
export type GameUpdateDTO = z.infer<typeof GameUpdateSchema>;
export type GameListQueryDTO = z.infer<typeof GameListQuerySchema>;
export type GameIdParamDTO = z.infer<typeof GameIdParamSchema>;