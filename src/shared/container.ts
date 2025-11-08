// Composition root
import { createPgPool } from './db.js';
import { GamePostgresRepository } from '../game/game.postgres.repository.js';

const pool = createPgPool();
const newRepository = new GamePostgresRepository(pool);
export const container = {
  gameRepository: newRepository,
};
