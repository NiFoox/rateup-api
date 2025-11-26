import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { UserRole } from '../../user/user.entity.js';

export interface JwtUserPayload extends JwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
}

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return secret;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Authorization header missing or malformed' });
  }

  const token = authHeader.substring('Bearer '.length);

  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (!decoded || typeof decoded !== 'object') {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const payload = decoded as JwtPayload;

    const email = (payload as any).email;
    const roles = (payload as any).roles;

    if (
      typeof payload.sub !== 'string' ||
      typeof email !== 'string' ||
      !Array.isArray(roles)
    ) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const userPayload: JwtUserPayload = {
      ...payload,
      sub: payload.sub,
      email,
      roles,
    };

    req.user = userPayload;

    return next();
  } catch (error) {
    if (error instanceof Error && error.message === 'JWT_SECRET is not defined') {
      return res.status(500).json({ error: 'Config de JWT incompleta' });
    }

    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const hasRole = user.roles?.some((role) => roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    return next();
  };
}
