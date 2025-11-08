import test from 'node:test';
import assert from 'node:assert/strict';
import { UserService } from '../../src/user/user.service.js';
import { User } from '../../src/user/user.entity.js';
import { UserRepository } from '../../src/user/user.repository.interface.js';
import { hashPassword } from '../../src/common/password.util.js';

class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];
  private sequence = 1;

  async create(user: User): Promise<User> {
    const created = new User(user.username, user.email, user.passwordHash, user.isActive, new Date(), this.sequence++);
    this.users.push(created);
    return created;
  }

  async findById(id: number): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.users.find((u) => u.username === username) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async search(page: number, pageSize: number, searchTerm?: string): Promise<{ data: User[]; total: number }> {
    let filtered = this.users;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((u) => u.username.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower));
    }
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);
    return { data, total };
  }

  async update(id: number, data: Partial<User>): Promise<User | undefined> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      return undefined;
    }
    const current = this.users[index];
    const updated = new User(
      data.username ?? current.username,
      data.email ?? current.email,
      data.passwordHash ?? current.passwordHash,
      data.isActive ?? current.isActive,
      current.createdAt,
      current.id
    );
    this.users[index] = updated;
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const lengthBefore = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);
    return this.users.length < lengthBefore;
  }
}

test('UserService.create crea un usuario nuevo', async () => {
  const repository = new InMemoryUserRepository();
  const service = new UserService(repository);

  const result = await service.create({ username: 'user1', email: 'user1@example.com', password: 'Secret123' });

  assert.equal(result.username, 'user1');
  assert.equal(result.email, 'user1@example.com');
  assert.equal(result.isActive, true);
  assert.ok(result.id);
});

test('UserService.create lanza error si el email existe', async () => {
  const repository = new InMemoryUserRepository();
  const service = new UserService(repository);

  await service.create({ username: 'user1', email: 'user1@example.com', password: 'Secret123' });

  await assert.rejects(() => service.create({ username: 'user2', email: 'user1@example.com', password: 'Secret123' }), {
    message: 'EMAIL_EXISTS',
  });
});

test('UserService.login valida credenciales correctas', async () => {
  const repository = new InMemoryUserRepository();
  const service = new UserService(repository);
  const passwordHash = await hashPassword('Secret123');
  await repository.create(new User('user1', 'user1@example.com', passwordHash, true));

  const response = await service.login({ usernameOrEmail: 'user1', password: 'Secret123' });

  assert.equal(response.success, true);
  assert.ok(response.token);
  assert.ok(response.expiresAt);
});

test('UserService.login falla con credenciales incorrectas', async () => {
  const repository = new InMemoryUserRepository();
  const service = new UserService(repository);
  const passwordHash = await hashPassword('Secret123');
  await repository.create(new User('user1', 'user1@example.com', passwordHash, true));

  await assert.rejects(() => service.login({ usernameOrEmail: 'user1', password: 'Wrong' }), {
    message: 'INVALID_CREDENTIALS',
  });
});

test('UserService.search devuelve paginación correcta', async () => {
  const repository = new InMemoryUserRepository();
  const service = new UserService(repository);

  for (let i = 0; i < 15; i += 1) {
    await service.create({ username: `user${i}`, email: `user${i}@example.com`, password: 'Secret123' });
  }

  const result = await service.search(2, 5);
  assert.equal(result.page, 2);
  assert.equal(result.pageSize, 5);
  assert.equal(result.total, 15);
  assert.equal(result.data.length, 5);
});
