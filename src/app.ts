import express from 'express';
import helmet from 'helmet';
import buildGameRouter from './game/game.routes.js';
import { container } from './shared/container.js';
import { buildUserRouter } from './user/user.routes.js';
import { buildAuthRouter } from './auth/auth.routes.js';
import { buildReviewRouter } from './review/review.routes.js';

const app = express();
app.use(express.json({ limit: '100kb' }));
app.use(helmet());

app.use('/api/reviews', buildReviewRouter(container.reviewController));
app.use('/api/games', buildGameRouter(container.gameRepository));
app.use('/api/users', buildUserRouter(container.userController));
app.use('/api/auth', buildAuthRouter(container.authController));

export default app;

// Usar los types en todos los parámetros de los métodos?
// Probar llamar una api externa, con axios, got, etc. Microservicio a microservicio
// Falta hacer service?
// Falta jest
// Falta .env y config.
// Falta mejorar dockercompose, para levantar api también
// Falta manejo de errores?
// Falta exponer endpoints de healthcheck, métricas, etc.
