import type { ErrorRequestHandler } from 'express';
import { logger } from '../logger.js';
import { DomainError } from '../errors/domain-error.js';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof DomainError) {
    const payload: any = {
      message: err.message,
      code: err.code,
    };

    if (err.field) {
      payload.field = err.field;
    }

    return res.status(err.httpStatus).json(payload);
  }

  logger.error({ err }, 'Unhandled error');

  return res.status(500).json({
    message: 'Internal server error',
  });
};
