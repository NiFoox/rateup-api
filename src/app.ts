import express from 'express';
import helmet from 'helmet';
import reviewRouter from './review/review.routes.js';
import gameRouter from './game/game.routes.js';

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '100kb' })); // Limitar tamaño de cuerpo

app.use(helmet()); // Seguridad básica

app.use('/reviews', reviewRouter);
app.use('/games', gameRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});