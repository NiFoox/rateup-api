import { Router } from 'express';
import { UserController } from './user.controller.js';
import {
  CreateUserSchema,
  SetStatusSchema,
  UpdateUserSchema,
  UserIdParamSchema,
  UserListQuerySchema,
} from './validators/user.validation.js';
import { validateBody, validateParams, validateQuery } from '../shared/middlewares/validate.js';

export function buildUserRouter(controller: UserController) {
  const router = Router();

  router.get('/', validateQuery(UserListQuerySchema), controller.list);
  router.get('/:id', validateParams(UserIdParamSchema), controller.getById);
  router.post('/', validateBody(CreateUserSchema), controller.create);
  router.put(
    '/:id',
    validateParams(UserIdParamSchema),
    validateBody(UpdateUserSchema),
    controller.update,
  );
  router.delete('/:id', validateParams(UserIdParamSchema), controller.remove);
  router.patch(
    '/:id/status',
    validateParams(UserIdParamSchema),
    validateBody(SetStatusSchema),
    controller.setStatus,
  );

  return router;
}
