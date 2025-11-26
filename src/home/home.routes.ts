import { Router } from 'express';
import type { GameRepository } from '../game/game.repository.interface.js';
import type { ReviewRepository } from '../review/review.repository.interface.js';
import { HomeController } from './home.controller.js';

export default function buildHomeRouter(
  gameRepository: GameRepository,
  reviewRepository: ReviewRepository,
) {
  const router = Router();
  const controller = new HomeController(
    gameRepository,
    reviewRepository,
  );

  // /api/home/top-games
  router.get('/top-games', controller.getTopGames.bind(controller));

  // /api/home/trending-reviews
  router.get(
    '/trending-reviews',
    controller.getTrendingReviews.bind(controller),
  );

  return router;
}
