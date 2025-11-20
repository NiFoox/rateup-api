import { Request, Response } from 'express';
import type { GameRepository } from '../game/game.repository.interface.js';
import type { ReviewRepository } from '../review/review.repository.interface.js';
import { logger } from '../shared/logger.js';

export class HomeController {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly reviewRepository: ReviewRepository,
  ) {}

  // GET /api/home/top-games
  async getTopGames(req: Request, res: Response): Promise<void> {
    try {
      const rawLimit = req.query.limit;
      const rawMinReviews = req.query.minReviews;

      let limit =
        typeof rawLimit === 'string' ? Number(rawLimit) : 10;
      let minReviews =
        typeof rawMinReviews === 'string' ? Number(rawMinReviews) : 1;

      if (!Number.isFinite(limit) || limit <= 0 || limit > 50) {
        limit = 10;
      }
      if (!Number.isFinite(minReviews) || minReviews < 0) {
        minReviews = 1;
      }

      const games = await this.gameRepository.getTopRatedGames(
        limit,
        minReviews,
      );

      res.json({
        limit,
        minReviews,
        count: games.length,
        items: games,
      });
    } catch (error) {
      logger.error({ error }, '[HomeController] topGames failed');
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // GET /api/home/trending-reviews
  async getTrendingReviews(req: Request, res: Response): Promise<void> {
    try {
      const rawLimit = req.query.limit;
      const rawDays = req.query.days;

      let limit =
        typeof rawLimit === 'string' ? Number(rawLimit) : 10;
      let days =
        typeof rawDays === 'string' ? Number(rawDays) : 7;

      if (!Number.isFinite(limit) || limit <= 0 || limit > 50) {
        limit = 10;
      }
      if (!Number.isFinite(days) || days <= 0 || days > 30) {
        days = 7;
      }

      const reviews = await this.reviewRepository.getTrendingReviews(
        limit,
        days,
      );

      res.json({
        limit,
        days,
        count: reviews.length,
        items: reviews,
      });
    } catch (error) {
      logger.error({ error }, '[HomeController] trendingReviews failed');
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
