import { Request, Response } from 'express';
import { ReviewMongoRepository } from './review.mongodb.repository.js';

const repository = new ReviewMongoRepository();

export class ReviewController {
    async create(req: Request, res: Response): Promise<void> {
        try {
            const review = req.body;
            const createdReview = await repository.create(review);

            if (createdReview) {
                res.status(201).json(createdReview);
            } else {
                res.status(400).json({ message: 'Error creating review' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error });
        }
    }
}

