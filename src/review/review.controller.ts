import { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service.js';
import { extractBearerToken } from '../auth/token.utils.js';
import { ReviewService } from './review.service.js';
import {
  CommentBodyDto,
  CommentListQuery,
  CommentIdParams,
  ReviewIdParams,
  ReviewListQuery,
  VoteRequestDto,
} from './validators/review.validation.js';

export class ReviewController {
  constructor(private readonly service: ReviewService, private readonly authService: AuthService) {}

  private async resolveAuthUser(req: Request) {
    const token = extractBearerToken(req);
    return this.authService.getUserFromToken(token);
  }

  list = async (req: Request, res: Response) => {
    const query = res.locals.validated?.query as ReviewListQuery;
    const authUser = await this.resolveAuthUser(req);
    const offset = (query.page - 1) * query.limit;
    const result = await this.service.list({
      offset,
      limit: query.limit,
      search: query.search,
      tag: query.tag,
      game: query.game,
      sort: query.sort,
      userId: authUser?.id,
    });
    return res.status(200).json(result);
  };

  getById = async (req: Request, res: Response) => {
    const { reviewId } = res.locals.validated.params as ReviewIdParams;
    const authUser = await this.resolveAuthUser(req);
    const review = await this.service.getById(reviewId, authUser?.id);
    if (!review) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }
    return res.status(200).json(review);
  };

  vote = async (req: Request, res: Response) => {
    const authUser = await this.resolveAuthUser(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Sesión no válida' });
    }
    const { reviewId } = res.locals.validated.params as ReviewIdParams;
    const { value } = req.body as VoteRequestDto;

    try {
      const result = await this.service.vote(reviewId, authUser.id, value);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'REVIEW_NOT_FOUND') {
        return res.status(404).json({ error: 'Reseña no encontrada' });
      }
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  getComments = async (req: Request, res: Response) => {
    const { reviewId } = res.locals.validated.params as ReviewIdParams;
    const query = res.locals.validated?.query as CommentListQuery;
    const offset = (query.page - 1) * query.limit;
    const result = await this.service.getComments({ reviewId, offset, limit: query.limit });
    return res.status(200).json(result);
  };

  addComment = async (req: Request, res: Response) => {
    const authUser = await this.resolveAuthUser(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Sesión no válida' });
    }
    const { reviewId } = res.locals.validated.params as ReviewIdParams;
    const { body } = req.body as CommentBodyDto;
    try {
      const comment = await this.service.addComment(reviewId, authUser.id, authUser.name, body);
      return res.status(201).json(comment);
    } catch (error) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  updateComment = async (req: Request, res: Response) => {
    const authUser = await this.resolveAuthUser(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Sesión no válida' });
    }
    const { reviewId, commentId } = res.locals.validated.params as CommentIdParams;
    const { body } = req.body as CommentBodyDto;
    const comment = await this.service.updateComment(reviewId, commentId, authUser.id, body);
    if (!comment) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }
    return res.status(200).json(comment);
  };

  deleteComment = async (req: Request, res: Response) => {
    const authUser = await this.resolveAuthUser(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Sesión no válida' });
    }
    const { reviewId, commentId } = res.locals.validated.params as CommentIdParams;
    const deleted = await this.service.deleteComment(reviewId, commentId, authUser.id);
    return deleted ? res.status(204).send() : res.status(404).json({ error: 'Comentario no encontrado' });
  };
}
