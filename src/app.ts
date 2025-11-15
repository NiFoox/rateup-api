import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import buildGameRouter from './game/game.routes.js';
import { container } from './shared/container.js';
import { buildUserRouter } from './user/user.routes.js';
import { buildAuthRouter } from './auth/auth.routes.js';
import { buildReviewRouter } from './review/review.routes.js';

const app = express();

app.use(express.json({ limit: '100kb' }));
app.use(helmet());

// CORS: solo esto
app.use(
  cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  })
);

// NO pongas app.options('/(.*)', cors()); ni variantes
// app.options('/(.*)', cors());  // <- eliminar

app.use('/api/reviews', buildReviewRouter(container.reviewController));
app.use('/api/games', buildGameRouter(container.gameRepository));
app.use('/api/users', buildUserRouter(container.userController));
app.use('/api/auth', buildAuthRouter(container.authController));

export default app;