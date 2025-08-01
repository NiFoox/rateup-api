import { Game } from './game.entity.js';

export interface GameRepository {
    create(game: Game): Promise<Game>;
    findById(id: number): Promise<Game | null>;
    findByName(name: string): Promise<Game | null>;
    getAll(): Promise<Game[]>;
    update(id: number, game: Partial<Game>): Promise<Game | undefined>;
    delete(id: number): Promise<boolean>;
}

//Operaciones CRUD básicas para el repositorio de games.