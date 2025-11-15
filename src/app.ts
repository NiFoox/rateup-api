import express from 'express';
import helmet from 'helmet';
import reviewRouter from './review/review.routes.js';
import buildGameRouter from './game/game.routes.js';
import { container } from './shared/container.js';
import { userRoutes } from './user/user.routes.js';
import { authRoutes } from './auth/auth.routes.js';

const app = express();
app.use(express.json({ limit: '100kb' })); // Limitar tamaño de cuerpo
app.use(helmet()); // Seguridad básica

app.use('/api/reviews', reviewRouter);
app.use('/api/games', buildGameRouter(container.gameRepository));
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

export default app;

// Usar los types en todos los parámetros de los métodos?
// Probar llamar una api externa, con axios, got, etc. Microservicio a microservicio
// Falta hacer service?
// Falta jest
// Falta .env y config.
// Falta mejorar dockercompose, para levantar api también
// Falta manejo de errores?
// Falta exponer endpoints de healthcheck, métricas, etc.
