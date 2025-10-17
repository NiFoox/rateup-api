// src/game/validators/game.validation.ts
import { z } from "zod";

// POST /games (obligatorio + strict)
export const GameCreateSchema = z.strictObject({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1),
  genre: z.string().trim().min(1).max(100),
});

// PATCH /games/:id (parcial + strict)
export const GameUpdateSchema = GameCreateSchema.partial().strict();

export const GameIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// helper: "" -> undefined para que funcionen los default()
const emptyToUndef = (rawValue: unknown) =>
  typeof rawValue === "string" && rawValue.trim() === "" ? undefined : rawValue;

export const GameListQuerySchema = z.object({
  page: z.preprocess(
    (input) => emptyToUndef(input),
    z.coerce.number().int().min(1).default(1)
  ),
  limit: z.preprocess(
    (input) => emptyToUndef(input),
    z.coerce.number().int().min(1).max(100).default(20)
  ),
  search: z.preprocess(emptyToUndef, z.string().trim().optional()),
  genre: z.preprocess(emptyToUndef, z.string().trim().optional()),
});

//
export type GameCreateDTO = z.output<typeof GameCreateSchema>;
export type GameUpdateDTO = z.output<typeof GameUpdateSchema>;
export type GameListQuery = z.output<typeof GameListQuerySchema>;
export type GameIdParams  = z.output<typeof GameIdParamSchema>;
