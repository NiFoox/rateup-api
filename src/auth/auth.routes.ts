// src/auth/auth.routes.ts
import { Router } from 'express';
import { validateBody } from '../shared/middlewares/validate.js';
import { AuthController } from './auth.controller.js';
import type { AuthService } from './auth.service.js';
import type { UserService } from '../user/user.service.js';
import { AuthLoginSchema } from './validators/auth.validation.js';
import { UserCreateSchema } from '../user/validators/user.validation.js';
import { requireAuth } from '../shared/middlewares/auth.js';

export default function buildAuthRouter(
  authService: AuthService,
  userService: UserService,
) {
  const router = Router();
  const controller = new AuthController(authService, userService);

  // POST /api/auth/login
  router.post(
    '/login',
    validateBody(AuthLoginSchema),
    controller.login.bind(controller),
  );

  // POST /api/auth/register
  router.post(
    '/register',
    validateBody(UserCreateSchema),
    controller.register.bind(controller),
  );

  // GET /api/auth/me
  router.get('/me', requireAuth, controller.me.bind(controller));

  return router;
}
