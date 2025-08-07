import { Client } from 'pg';
import { Review } from "./review.entity.js";
import { ReviewRepository } from "./review.repository.interface.js";

const client = new Client({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  user: process.env.POSTGRES_USER || 'rateup',
  password: process.env.POSTGRES_PASSWORD || 'rateup123',
  database: process.env.POSTGRES_DB || 'rateupdb',
});

client.connect();

export class ReviewPostgresRepository implements ReviewRepository {  
    async create(review: Review): Promise<Review> {
    const { rows } = await client.query<Review>(
        'INSERT INTO reviews (gameTitle, content, score, author) VALUES ($1,$2,$3,$4) RETURNING *',
        [review.gameTitle, review.content, review.score, review.author]
    );
    return rows[0];
    }
}