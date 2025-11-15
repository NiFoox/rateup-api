import { z } from 'zod';

export const AuthLoginSchema = z.strictObject({
  usernameOrEmail: z.string().trim().min(1, 'usernameOrEmail is required'),
  password: z.string().min(1, 'password is required'),
});

export type AuthLoginDTO = z.output<typeof AuthLoginSchema>;
