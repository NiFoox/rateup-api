import pg from 'pg';

const { Pool } = pg as unknown as { Pool: new (...args: any[]) => import('pg').Pool };

export function createPgPool() {
  return new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || 'rateup',
    password: process.env.POSTGRES_PASSWORD || 'rateup123',
    database: process.env.POSTGRES_DB || 'rateupdb',
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}
