import { Game } from './game.entity.js';

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
  ): Promise<Game[]>;
  getAll(): Promise<Game[]>;

  // Update
  patch(id: number, game: Partial<Game>): Promise<Game | undefined>;

  // Delete
  delete(id: number): Promise<boolean>;
}

//Operaciones CRUD básicas para el repositorio de games.
