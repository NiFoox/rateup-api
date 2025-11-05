import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

type Where = 'body' | 'params' | 'query';

function validate(schema: z.ZodTypeAny, where: Where) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse((req as any)[where]);
    if (!parsed.success) {
      const flat = z.flattenError(parsed.error);
      return res.status(400).json({ message: 'Validation error', ...flat });
    }

    res.locals.validated ??= {};
    res.locals.validated[where] = parsed.data;

    if (where === 'body') (req as any).body = parsed.data;

    next();
  };
}

export const validateBody = (s: z.ZodTypeAny) => validate(s, 'body');
export const validateParams = (s: z.ZodTypeAny) => validate(s, 'params');
export const validateQuery = (s: z.ZodTypeAny) => validate(s, 'query');

// Middleware que invoca en tiempo de request los schemas dentro de validators
