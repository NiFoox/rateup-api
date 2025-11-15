// src/shared/container.ts
// Composition root
import { createPgPool } from './db.js';
import { GamePostgresRepository } from '../game/game.postgres.repository.js';
import { UserPostgresRepository } from '../user/user.postgres.repository.js';
import { UserService } from '../user/user.service.js';
import { ReviewPostgresRepository } from '../review/review.postgres.repository.js';

const pool = createPgPool();

const gameRepository = new GamePostgresRepository(pool);
const userRepository = new UserPostgresRepository(pool);
const userService = new UserService(userRepository);
const reviewRepository = new ReviewPostgresRepository(pool);

export const container = {
  gameRepository,
  userRepository,
  userService,
  reviewRepository,
};
