import express from 'express';
import { GameController } from './game.controller.js';

const router = express.Router();
const controller = new GameController();

//Create
router.post('/', (req, res) => controller.create(req, res));

//Read
router.get('/:id', (req, res) => controller.get(req, res));
router.get('/', (req, res) => controller.getAll(req, res));

//Update
router.put('/:id', (req, res) => controller.update(req, res));

//Delete
router.delete('/:id', (req, res) => controller.delete(req, res));

export { router as gameRoutes };