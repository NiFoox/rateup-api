import express from 'express';

import reviewRouter from './review/review.routes.js';
import { gameRoutes } from './game/game.routes.js';

const app = express();
app.use(express.json());
const PORT = 3000;

app.use('/reviews', reviewRouter);
app.use('/games', gameRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});