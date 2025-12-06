import type { NextFunction, Request, Response } from 'express';
import { DomainError } from './domain-error.js';

export function httpErrorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof DomainError) {
    return res.status(err.httpStatus).json({
      message: err.message,
      code: err.code,
      field: err.field,
    });
  }

  console.error('Unhandled error:', err);

  return res.status(500).json({
    message: 'Internal server error',
  });
}
