import { Router } from 'express';
import { validateBody } from '../shared/middlewares/validate.js';
import { AuthController } from './auth.controller.js';
import type { UserService } from '../user/user.service.js';
import { AuthLoginSchema } from './validators/auth.validation.js';

export default function buildAuthRouter(userService: UserService) {
  const router = Router();
  const controller = new AuthController(userService);

  router.post('/login', validateBody(AuthLoginSchema), controller.login.bind(controller));

  return router;
}
