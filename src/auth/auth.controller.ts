import { Request, Response } from 'express';
import type { UserService } from '../user/user.service.js';
import type { AuthLoginDTO } from './validators/auth.validation.js';

export class AuthController {
  constructor(private readonly userService: UserService) {}

  async login(req: Request, res: Response) {
    const dto = (res.locals?.validated?.body as AuthLoginDTO) ?? (req.body as AuthLoginDTO);

    try {
      const response = await this.userService.login(dto);
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
