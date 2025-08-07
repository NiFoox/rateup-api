import express from 'express';
import reviewRouter from './review/review.routes.js';

const app = express();
app.use(express.json()); // Middleware para parsear JSON
const PORT = 3000;

app.use('/reviews', reviewRouter); // Usamos el enrutador de reseñas

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});