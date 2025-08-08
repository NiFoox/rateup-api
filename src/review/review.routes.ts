import { Router } from 'express';
import { ReviewController } from './review.controller.js';

export const reviewRouter = Router();

const router = Router();
const controller = new ReviewController();

// Create
router.post('/', (req, res) => controller.create(req, res));

// Read

// Update
router.put('/:id', (req, res) => controller.update(req, res));
// Delete

export default router;