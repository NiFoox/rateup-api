// Composition root
import { createPgPool } from './db.js';
import { GamePostgresRepository } from '../game/game.postgres.repository.js';
import { UserPostgresRepository } from '../user/user.postgres.repository.js';
import { UserService } from '../user/user.service.js';
import { UserController } from '../user/user.controller.js';
import { AuthService } from '../auth/auth.service.js';
import { AuthController } from '../auth/auth.controller.js';
import { ReviewPostgresRepository } from '../review/review.postgres.repository.js';
import { ReviewService } from '../review/review.service.js';
import { ReviewController } from '../review/review.controller.js';

const pool = createPgPool();

const gameRepository = new GamePostgresRepository(pool);

const userRepository = new UserPostgresRepository(pool);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

const reviewRepository = new ReviewPostgresRepository(pool);
const reviewService = new ReviewService(reviewRepository);
const reviewController = new ReviewController(reviewService, authService);

export const container = {
  pool,
  gameRepository,
  userRepository,
  userService,
  userController,
  authService,
  authController,
  reviewRepository,
  reviewService,
  reviewController,
};
