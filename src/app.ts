import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import buildGameRouter from './game/game.routes.js';
import buildReviewRouter from './review/review.routes.js';
import buildUserRouter from './user/user.routes.js';
import buildAuthRouter from './auth/auth.routes.js';
import buildReviewCommentRouter from './review-comment/review-comment.routes.js';
import buildReviewVoteRouter from './review-vote/review-vote.routes.js';
import buildHomeRouter from './home/home.routes.js';
import { container } from './shared/container.js';

const app = express();

app.use(
  cors({
    origin: '*', // Para producción poner dominio real
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: false,
  }),
);

app.use(express.json({ limit: '100kb' }));
app.use(helmet());

app.use('/api/games', buildGameRouter(container.gameRepository));
app.use('/api/reviews',   buildReviewRouter(
    container.reviewRepository,
    container.reviewCommentRepository,
    container.reviewVoteRepository,
  ),
);

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
app.use('/api/auth', buildAuthRouter(
  container.authService,
  container.userService,
));

app.use(
  '/api/home',
  buildHomeRouter(
    container.gameRepository,
    container.reviewRepository,
  ),
);

export default app;

// TODO:
// - Refactor dto (matar validators y meter todo en dto por separado)
// - Usar ORM tipo TypeORM o Prisma?
// - Middleware de error handling global?
// - Usar más los types en vez de tanto any?
// - Más tests
// - Levantar api en docker?
// - Probar llamar api externa?
