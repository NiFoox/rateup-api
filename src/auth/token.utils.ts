import { Request } from 'express';

export function extractBearerToken(req: Request): string | undefined {
  const header = req.header('authorization') ?? req.header('Authorization');
  if (!header) {
    return undefined;
  }
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return undefined;
  }
  return token.trim();
}
