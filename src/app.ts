import express from 'express';
import helmet from 'helmet';
import buildGameRouter from './game/game.routes.js';
import buildReviewRouter from './review/review.routes.js';
import buildUserRouter from './user/user.routes.js';
import buildAuthRouter from './auth/auth.routes.js';
import buildReviewCommentRouter from './review-comment/review-comment.routes.js';
import buildReviewVoteRouter from './review-vote/review-vote.routes.js';
import { container } from './shared/container.js';

const app = express();
app.use(express.json({ limit: '100kb' }));
app.use(helmet());

app.use('/api/games', buildGameRouter(container.gameRepository));
app.use('/api/reviews', buildReviewRouter(container.reviewRepository));

// comentarios de review
app.use(
  '/api/reviews/:reviewId/comments',
  buildReviewCommentRouter(container.reviewCommentRepository),
);

// votos de review
app.use(
  '/api/reviews/:reviewId/votes',
  buildReviewVoteRouter(container.reviewVoteRepository),
);

app.use('/api/users', buildUserRouter(container.userService));
app.use('/api/auth', buildAuthRouter(container.userService));

export default app;

// Usar los types en todos los parámetros de los métodos?
// Probar llamar una api externa, con axios, got, etc. Microservicio a microservicio
// Falta hacer service?
// Falta jest
// Falta .env y config.
// Falta mejorar dockercompose, para levantar api también
// Falta manejo de errores?
// Falta exponer endpoints de healthcheck, métricas, etc.
