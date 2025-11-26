import { Router } from 'express';
import { validateBody } from '../shared/middlewares/validate.js';
import { AuthController } from './auth.controller.js';
import type { AuthService } from './auth.service.js';
import { AuthLoginSchema } from './validators/auth.validation.js';

export default function buildAuthRouter(authService: AuthService) {
  const router = Router();
  const controller = new AuthController(authService);

  router.post('/login', validateBody(AuthLoginSchema), controller.login.bind(controller));

  return router;
}
