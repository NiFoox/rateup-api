// src/user/user.routes.ts
import { Router } from 'express';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../shared/middlewares/validate.js';
import {
  UserCreateSchema,
  UserUpdateSchema,
  UserIdParamSchema,
  UserListQuerySchema,
} from './validators/user.validation.js';
import { UserController } from './user.controller.js';
import type { UserService } from './user.service.js';

export default function buildUserRouter(userService: UserService) {
  const router = Router();
  const controller = new UserController(userService);

  // POST /api/users
  router.post('/', validateBody(UserCreateSchema), controller.create.bind(controller));

  // GET /api/users?page=&pageSize=&search=
  router.get(
    '/',
    validateQuery(UserListQuerySchema),
    controller.list.bind(controller),
  );

  // GET /api/users/:id
  router.get(
    '/:id',
    validateParams(UserIdParamSchema),
    controller.getById.bind(controller),
  );

  // PATCH /api/users/:id
  router.patch(
    '/:id',
    validateParams(UserIdParamSchema),
    validateBody(UserUpdateSchema),
    controller.update.bind(controller),
  );

  // DELETE /api/users/:id
  router.delete(
    '/:id',
    validateParams(UserIdParamSchema),
    controller.delete.bind(controller),
  );

  return router;
}
