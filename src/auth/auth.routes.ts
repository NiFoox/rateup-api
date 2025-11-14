import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateBody } from '../shared/middlewares/validate.js';
import { LoginRequestSchema } from './validators/auth.validation.js';

export function buildAuthRouter(controller: AuthController) {
  const router = Router();

  router.post('/login', validateBody(LoginRequestSchema), controller.login);
  router.post('/logout', controller.logout);
  router.get('/me', controller.me);

  return router;
}
