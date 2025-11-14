import { Request, Response } from 'express';
import { UserService } from './user.service.js';
import { UserListQuery } from './validators/user.validation.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

export class UserController {
  constructor(private readonly service: UserService) {}

  list = async (req: Request, res: Response) => {
    const query = res.locals.validated?.query as UserListQuery;
    const { page, limit, search, sort, dir, role, active } = query;

    const result = await this.service.list(page, limit, { search, sort, dir, role, active });
    return res.status(200).json(result);
  };

  getById = async (req: Request, res: Response) => {
    const { id } = res.locals.validated.params as { id: string };
    const user = await this.service.getById(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    return res.status(200).json(user);
  };

  create = async (req: Request, res: Response) => {
    const dto = req.body as CreateUserDto;
    try {
      const user = await this.service.create(dto);
      return res.status(201).location(`/api/users/${user.id}`).json(user);
    } catch (error) {
      if (error instanceof Error && error.message === 'EMAIL_EXISTS') {
        return res.status(409).json({ error: 'El correo electrónico ya está en uso' });
      }
      if (error instanceof Error && error.message === 'NAME_EXISTS') {
        return res.status(409).json({ error: 'El nombre ya está en uso' });
      }
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  update = async (req: Request, res: Response) => {
    const { id } = res.locals.validated.params as { id: string };
    const dto = req.body as UpdateUserDto;

    try {
      const updated = await this.service.update(id, dto);
      if (!updated) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      return res.status(200).json(updated);
    } catch (error) {
      if (error instanceof Error && error.message === 'EMAIL_EXISTS') {
        return res.status(409).json({ error: 'El correo electrónico ya está en uso' });
      }
      if (error instanceof Error && error.message === 'NAME_EXISTS') {
        return res.status(409).json({ error: 'El nombre ya está en uso' });
      }
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  remove = async (req: Request, res: Response) => {
    const { id } = res.locals.validated.params as { id: string };
    const deleted = await this.service.delete(id);
    return deleted ? res.status(204).send() : res.status(404).json({ error: 'Usuario no encontrado' });
  };

  setStatus = async (req: Request, res: Response) => {
    const { id } = res.locals.validated.params as { id: string };
    const { active } = req.body as { active: boolean };
    const updated = await this.service.setStatus(id, active);
    if (!updated) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    return res.status(200).json(updated);
  };
}
