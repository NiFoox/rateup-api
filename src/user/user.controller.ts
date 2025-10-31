import { Request, Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserService } from './user.service.js';
import { UserPostgresRepository } from './user.postgres.repository.js';

const service = new UserService(new UserPostgresRepository());

export class UserController {
  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Identificador inválido' });
    }

    const user = await service.findById(id);
    return user ? res.json(user) : res.status(404).json({ error: 'Usuario no encontrado' });
  }

  async getAll(req: Request, res: Response) {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const search = req.query.search ? String(req.query.search) : undefined;

    if (page <= 0 || pageSize <= 0) {
      return res.status(400).json({ error: 'Los parámetros de paginación deben ser positivos' });
    }

    const result = await service.search(page, pageSize, search);
    return res.json(result);
  }

  async create(req: Request, res: Response) {
    const dto = req.body as CreateUserDto;

    try {
      const user = await service.create(dto);
      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_DATA') {
          return res.status(400).json({ error: 'Datos inválidos' });
        }
        if (error.message === 'USERNAME_EXISTS' || error.message === 'EMAIL_EXISTS') {
          return res.status(409).json({ error: 'El usuario ya existe' });
        }
      }
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Identificador inválido' });
    }

    const dto = req.body as UpdateUserDto;

    try {
      const updated = await service.update(id, dto);
      if (!updated) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      return res.json(updated);
    } catch (error) {
      if (error instanceof Error && (error.message === 'USERNAME_EXISTS' || error.message === 'EMAIL_EXISTS')) {
        return res.status(409).json({ error: 'El usuario ya existe' });
      }
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Identificador inválido' });
    }

    const deleted = await service.delete(id);
    return deleted ? res.status(204).send() : res.status(404).json({ error: 'Usuario no encontrado' });
  }
}
