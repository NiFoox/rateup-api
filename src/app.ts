import express from 'express';
import { gameRoutes } from './game/game.routes.js'

const app = express();
app.use(express.json());
const PORT = 3000;

app.use('/games', gameRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});