import { Game } from '../../game/game.entity.js';

describe('Game entity', () => {
    it('should create a Game with correct properties', async () => {
        const game = new Game('Zelda', 'An epic adventure game', 'RPG', 1);
        expect(game.name).toBe('Zelda');
        expect(game.description).toBe('An epic adventure game');
        expect(game.genre).toBe('RPG');
        expect(game.id).toBe(1);
    });

    it('should create a Game without id', async () => {
        const game = new Game('Zelda', 'An epic adventure game', 'RPG');
        expect(game.name).toBe('Zelda');
        expect(game.description).toBe('An epic adventure game');
        expect(game.genre).toBe('RPG');
        expect(game.id).toBeUndefined();
    });
});