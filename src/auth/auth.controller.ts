import { Request, Response } from 'express';
import { LoginRequestDto } from '../user/dto/login-request.dto.js';
import { UserService } from '../user/user.service.js';
import { UserPostgresRepository } from '../user/user.postgres.repository.js';

const service = new UserService(new UserPostgresRepository());

export class AuthController {
  async login(req: Request, res: Response) {
    const dto = req.body as LoginRequestDto;

    try {
      const response = await service.login(dto);
      return res.json(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_DATA') {
          return res.status(400).json({ error: 'Datos inválidos' });
        }
        if (error.message === 'INVALID_CREDENTIALS') {
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }
      }
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}
