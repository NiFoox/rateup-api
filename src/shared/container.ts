// Composition root
import { createPgPool } from './db.js';
import { GamePostgresRepository } from '../game/game.postgres.repository.js';

const pool = createPgPool(); // se crea una sola vez
export const container = {
  pool,
  gameRepository: new GamePostgresRepository(pool),
};
