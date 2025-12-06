import { Game } from './game.entity.js';
import type { TopGameDTO } from './dto/top-game.dto.js';

export interface GameRepository {
  // Create
  create(game: Game): Promise<Game>;

  // Read
  findById(id: number): Promise<Game | null>;
  findByName(name: string): Promise<Game | null>;

  getPaginated(
    offset: number,
    limit: number,
    opts?: { search?: string; genre?: string },
  ): Promise<{ data: Game[], total: number }>;
  
  getAll(): Promise<Game[]>;

  getTopRatedGames(
    limit: number,
    minReviews?: number,
  ): Promise<TopGameDTO[]>;

  // Update
  patch(id: number, game: Partial<Game>): Promise<Game | undefined>;

  // Delete
  delete(id: number): Promise<boolean>;
}

//Operaciones CRUD básicas para el repositorio de games.
