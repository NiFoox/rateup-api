// src/user/validators/user.validation.ts
import { z } from 'zod';

// helper: "" -> undefined para default/optional
const emptyToUndef = (rawValue: unknown) =>
  typeof rawValue === 'string' && rawValue.trim() === '' ? undefined : rawValue;

// ---------- Body schemas ----------

const UserBaseSchema = z
  .object({
    username: z.string().trim().min(1, 'username is required'),
    email: z.string().trim().pipe(z.email({ message: 'invalid email' })),
    password: z.string().min(8, 'password must be at least 8 characters'),
  })
  .strict();

export const UserCreateSchema = UserBaseSchema;

export const UserUpdateSchema = UserBaseSchema.partial()
  .extend({
    isActive: z.boolean().optional(),
  })
  .strict();

// ---------- Params schema ----------

export const UserIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// ---------- Query schema ----------

export const UserListQuerySchema = z.object({
  page: z.preprocess(
    emptyToUndef,
    z.coerce.number().int().min(1).default(1),
  ),
  pageSize: z.preprocess(
    emptyToUndef,
    z.coerce.number().int().min(1).max(100).default(10),
  ),
  search: z.preprocess(emptyToUndef, z.string().trim().optional()),
});

// ---------- Types (DTOs) ----------

export type UserCreateDTO = z.infer<typeof UserCreateSchema>;
export type UserUpdateDTO = z.infer<typeof UserUpdateSchema>;
export type UserIdParamDTO = z.infer<typeof UserIdParamSchema>;
export type UserListQueryDTO = z.infer<typeof UserListQuerySchema>;
