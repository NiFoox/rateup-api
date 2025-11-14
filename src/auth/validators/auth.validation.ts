import { z } from 'zod';

export const LoginRequestSchema = z.strictObject({
  email: z.string().email(),
  password: z.string().min(1),
  remember: z.boolean().optional(),
});

export type LoginRequestDto = z.output<typeof LoginRequestSchema>;
