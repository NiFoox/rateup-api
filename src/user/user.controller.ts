import type { Request, Response } from 'express';
import { UserService } from './user.service.js';
import {
  UserCreateSchema,
  UserUpdateSchema,
  UserIdParamSchema,
  UserListQuerySchema,
  type UserCreateDTO,
  type UserUpdateDTO,
  type UserIdParamDTO,
  type UserListQueryDTO,
} from './validators/user.validation.js';

export class UserController {
  constructor(private readonly service: UserService) {}

  // POST /api/users
  async create(req: Request, res: Response) {
    const body: UserCreateDTO =
      (res.locals?.validated?.body as UserCreateDTO) ??
      UserCreateSchema.parse(req.body);

    try {
      const user = await this.service.create(body);
      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof Error && error.message === 'USER_ALREADY_EXISTS') {
        return res
          .status(409)
          .json({ error: 'El nombre de usuario o email ya existen' });
      }

      return res.status(500).json({ error: 'Error al crear usuario' });
    }
  }

  // GET /api/users
  async list(req: Request, res: Response) {
    const query: UserListQueryDTO =
      (res.locals?.validated?.query as UserListQueryDTO) ??
      UserListQuerySchema.parse(req.query);

    const result = await this.service.list(query);
    return res.json(result);
  }

  // GET /api/users/:id
  async getById(req: Request, res: Response) {
    const params: UserIdParamDTO =
      (res.locals?.validated?.params as UserIdParamDTO) ??
      UserIdParamSchema.parse(req.params);

    const user = await this.service.findById(params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json(user);
  }

  // PATCH /api/users/:id
  async update(req: Request, res: Response) {
    const params: UserIdParamDTO =
      (res.locals?.validated?.params as UserIdParamDTO) ??
      UserIdParamSchema.parse(req.params);

    const body: UserUpdateDTO =
      (res.locals?.validated?.body as UserUpdateDTO) ??
      UserUpdateSchema.parse(req.body);

    const updated = await this.service.update(params.id, body);

    if (!updated) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json(updated);
  }

  // DELETE /api/users/:id
  async delete(req: Request, res: Response) {
    const params: UserIdParamDTO =
      (res.locals?.validated?.params as UserIdParamDTO) ??
      UserIdParamSchema.parse(req.params);

    const deleted = await this.service.delete(params.id);

    return deleted
      ? res.status(204).send()
      : res.status(404).json({ error: 'Usuario no encontrado' });
  }
}
