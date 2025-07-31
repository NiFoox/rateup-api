import express from 'express';
import { GameController } from './game.controller.js';

const router = express.Router();
const controller = new GameController();

router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export { router as gameRoutes };