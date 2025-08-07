import { Router } from 'express';
import { ReviewController } from './review.controller.js';

export const reviewRouter = Router();

const router = Router();
const controller = new ReviewController();

// Create
router.post('/', (req, res) => controller.create(req, res));

// Read

// Update

// Delete

export default router;