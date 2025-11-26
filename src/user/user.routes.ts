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
  UserRolesUpdateSchema,
} from './validators/user.validation.js';
import { UserController } from './user.controller.js';
import type { UserService } from './user.service.js';
import {
  requireAuth,
  requireRole,
} from '../shared/middlewares/auth.js';

export default function buildUserRouter(userService: UserService) {
  const router = Router();
  const controller = new UserController(userService);

  // Perfil público
  router.get(
    '/profile/:id',
    validateParams(UserIdParamSchema),
    controller.getProfileById.bind(controller),
  );

  // Crear usuario (ADMIN)
  router.post(
    '/',
    requireAuth,
    requireRole('ADMIN'),
    validateBody(UserCreateSchema),
    controller.create.bind(controller),
  );

  // Listar usuarios (ADMIN)
  router.get(
    '/',
    requireAuth,
    requireRole('ADMIN'),
    validateQuery(UserListQuerySchema),
    controller.list.bind(controller),
  );

  // Ver usuario (ADMIN)
  router.get(
    '/:id',
    requireAuth,
    requireRole('ADMIN'),
    validateParams(UserIdParamSchema),
    controller.getById.bind(controller),
  );

  // Actualizar roles de usuario (solo ADMIN)
  router.patch(
    '/:id/roles',
    requireAuth,
    requireRole('ADMIN'),
    validateParams(UserIdParamSchema),
    validateBody(UserRolesUpdateSchema),
    controller.updateRoles.bind(controller),
  );

  // Actualizar usuario (dueño o ADMIN)
  router.patch(
    '/:id',
    requireAuth,
    validateParams(UserIdParamSchema),
    validateBody(UserUpdateSchema),
    controller.update.bind(controller),
  );

  // Eliminar usuario (ADMIN)
  router.delete(
    '/:id',
    requireAuth,
    requireRole('ADMIN'),
    validateParams(UserIdParamSchema),
    controller.delete.bind(controller),
  );

  return router;
}
