export const config = {
  jwtSecret: process.env.JWT_SECRET ?? 'fallback-secret',
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
};
