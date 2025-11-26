import { Request, Response } from 'express';
import type { AuthService } from './auth.service.js';
import type { AuthLoginDTO } from './validators/auth.validation.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request, res: Response) {
    const dto =
      (res.locals?.validated?.body as AuthLoginDTO) ?? (req.body as AuthLoginDTO);

    try {
      const response = await this.authService.login(dto);
      return res.json(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_DATA') {
          return res.status(400).json({ error: 'Datos inválidos' });
        }
        if (error.message === 'INVALID_CREDENTIALS') {
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        if (error.message === 'JWT_SECRET is not defined') {
          return res.status(500).json({ error: 'Config de JWT incompleta' });
        }
      }
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}
