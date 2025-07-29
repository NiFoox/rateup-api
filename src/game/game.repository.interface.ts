import { Game } from './game.entity.js';

export interface GameRepository {
    create(game: Game): Promise<Game>;
    update(id: number, game: Partial<Game>): Promise<Game | undefined>;
    delete(id: number): Promise<boolean>;
    findByName(name: string): Promise<Game | null>;
}

//Operaciones CRUD básicas para el repositorio de games.