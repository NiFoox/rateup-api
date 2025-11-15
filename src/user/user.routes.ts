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

export default function buildUserRouter(service: UserService) {
  const router = Router();
  const controller = new UserController(service);

  // GET /api/users/:id
  router.get(
    '/:id',
    validateParams(UserIdParamSchema),
    controller.getById.bind(controller),
  );

  // GET /api/users
  router.get(
    '/',
    validateQuery(UserListQuerySchema),
    controller.getAll.bind(controller),
  );

  // POST /api/users
  router.post(
    '/',
    validateBody(UserCreateSchema),
    controller.create.bind(controller),
  );

  // PUT /api/users/:id
  router.put(
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
