// src/user/validators/user.validation.ts
import { z } from 'zod';

// helper: "" -> undefined
const emptyToUndef = (rawValue: unknown) =>
  typeof rawValue === 'string' && rawValue.trim() === '' ? undefined : rawValue;

const UserRoleEnum = z.enum(['USER', 'ADMIN']);

// ---------- Body schemas ----------

const UserBaseSchema = z
  .object({
    username: z.string().trim().min(1, 'username is required'),
    email: z.string().trim().email('invalid email'),
    password: z.string().min(8, 'password must be at least 8 characters'),
  })
  .strict();

// POST /users
export const UserCreateSchema = UserBaseSchema.extend({
  roles: z.array(UserRoleEnum).optional(), // default en service
  isActive: z.boolean().optional().default(true),
}).strict();

// PATCH /users/:id
export const UserUpdateSchema = z
  .object({
    username: z.preprocess(
      emptyToUndef,
      z.string().trim().min(1).optional(),
    ),
    email: z.preprocess(
      emptyToUndef,
      z.string().trim().email('invalid email').optional(),
    ),
    password: z.preprocess(
      emptyToUndef,
      z.string().min(8, 'password must be at least 8 characters').optional(),
    ),
    roles: z.preprocess(
      emptyToUndef,
      z.array(UserRoleEnum).min(1).optional(),
    ),
    isActive: z.preprocess(
      emptyToUndef,
      z.coerce.boolean().optional(),
    ),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

// ---------- Params ----------

export const UserIdParamSchema = z
  .object({
    id: z.coerce.number().int().positive(),
  })
  .strict();

// ---------- Query ----------

export const UserListQuerySchema = z
  .object({
    page: z.preprocess(
      emptyToUndef,
      z.coerce.number().int().min(1).default(1),
    ),
    pageSize: z.preprocess(
      emptyToUndef,
      z.coerce.number().int().min(1).max(100).default(10),
    ),
    search: z.preprocess(
      emptyToUndef,
      z.string().trim().optional(),
    ),
  })
  .strict();

// ---------- Types (DTOs) ----------

export type UserCreateDTO = z.infer<typeof UserCreateSchema>;
export type UserUpdateDTO = z.infer<typeof UserUpdateSchema>;
export type UserIdParamDTO = z.infer<typeof UserIdParamSchema>;
export type UserListQueryDTO = z.infer<typeof UserListQuerySchema>;
export type UserRoleDTO = z.infer<typeof UserRoleEnum>;
