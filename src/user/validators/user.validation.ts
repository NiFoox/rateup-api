import { z } from 'zod';

const emptyToUndefined = (value: unknown) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }
  return value;
};

export const UserListQuerySchema = z.object({
  page: z.preprocess((v) => emptyToUndefined(v), z.coerce.number().int().min(1)),
  limit: z.preprocess((v) => emptyToUndefined(v), z.coerce.number().int().min(1)),
  search: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  sort: z.preprocess(emptyToUndefined, z.enum(['name', 'email', 'createdAt', 'active']).optional()),
  dir: z.preprocess(emptyToUndefined, z.enum(['asc', 'desc']).optional()),
  role: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  active: z
    .preprocess((value) => {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }
      if (typeof value === 'boolean') {
        return value;
      }
      if (typeof value === 'string') {
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
      }
      return value;
    }, z.boolean().optional()),
});

export const UserIdParamSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
});

export const CreateUserSchema = z.strictObject({
  name: z.string().min(1),
  email: z.string().email(),
  roles: z.array(z.string().min(1)).default([]),
  active: z.boolean(),
  password: z.string().min(6).optional(),
});

export const UpdateUserSchema = CreateUserSchema.partial();

export const SetStatusSchema = z.strictObject({
  active: z.boolean(),
});

export type UserListQuery = z.output<typeof UserListQuerySchema>;
export type CreateUserDtoSchema = z.output<typeof CreateUserSchema>;
export type UpdateUserDtoSchema = z.output<typeof UpdateUserSchema>;
export type SetStatusDto = z.output<typeof SetStatusSchema>;
export type UserIdParams = z.output<typeof UserIdParamSchema>;
