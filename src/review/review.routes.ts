import { Router } from 'express';
import { ReviewController } from './review.controller.js';
export const reviewRouter = Router();

    const router = Router();// Creamos un enrutador independiente
    const controller = new ReviewController(); // Instanciamos el controlador

   router.post('/', (req, res) => controller.create(req, res)); // Ruta para crear una reseña
    export default router; // Exportamos el enrutador para usarlo en app.ts