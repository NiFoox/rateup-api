import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginRequest } from './auth.entity.js';
import { extractBearerToken } from './token.utils.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response) => {
    const dto = req.body as LoginRequest;
    try {
      const response = await this.authService.login(dto);
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  logout = async (req: Request, res: Response) => {
    const token = extractBearerToken(req);
    await this.authService.logout(token);
    return res.status(204).send();
  };

  me = async (req: Request, res: Response) => {
    const token = extractBearerToken(req);
    const user = await this.authService.getUserFromToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Sesión no válida' });
    }

    return res.status(200).json({ user });
  };
}
