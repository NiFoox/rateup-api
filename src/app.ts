import express from 'express';

import reviewRouter from './review/review.routes.js';
import { gameRoutes } from './game/game.routes.js';
import { userRoutes } from './user/user.routes.js';
import { authRoutes } from './auth/auth.routes.js';

const app = express();
app.use(express.json());
const PORT = 3000;

app.use('/reviews', reviewRouter);
app.use('/games', gameRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});