import { Request, Response } from 'express';
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

  // GET /api/users/:id
  async getById(req: Request, res: Response) {
    const params: UserIdParamDTO =
      (res.locals?.validated?.params as UserIdParamDTO) ??
      UserIdParamSchema.parse(req.params);

    const user = await this.service.findById(params.id);

    return user
      ? res.json(user)
      : res.status(404).json({ error: 'Usuario no encontrado' });
  }

  // GET /api/users
  async getAll(req: Request, res: Response) {
    const query: UserListQueryDTO =
      (res.locals?.validated?.query as UserListQueryDTO) ??
      UserListQuerySchema.parse(req.query);

    const result = await this.service.search(query);
    return res.json(result);
  }

  // POST /api/users
  async create(req: Request, res: Response) {
    const dto: UserCreateDTO =
      (res.locals?.validated?.body as UserCreateDTO) ??
      UserCreateSchema.parse(req.body);

    try {
      const user = await this.service.create(dto);
      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_DATA') {
          return res.status(400).json({ error: 'Datos inválidos' });
        }
        if (error.message === 'USERNAME_EXISTS') {
          return res.status(409).json({ error: 'El nombre de usuario ya existe' });
        }
        if (error.message === 'EMAIL_EXISTS') {
          return res.status(409).json({ error: 'El email ya está registrado' });
        }
      }
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // PATCH /api/users/:id
  async update(req: Request, res: Response) {
    const params: UserIdParamDTO =
      (res.locals?.validated?.params as UserIdParamDTO) ??
      UserIdParamSchema.parse(req.params);

    const dto: UserUpdateDTO =
      (res.locals?.validated?.body as UserUpdateDTO) ??
      UserUpdateSchema.parse(req.body);

    try {
      const updated = await this.service.update(params.id, dto);

      if (!updated) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      return res.json(updated);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'USERNAME_EXISTS') {
          return res.status(409).json({ error: 'El nombre de usuario ya existe' });
        }
        if (error.message === 'EMAIL_EXISTS') {
          return res.status(409).json({ error: 'El email ya está registrado' });
        }
      }
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
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
