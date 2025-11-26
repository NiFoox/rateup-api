import { Pool } from 'pg';
import { User } from './user.entity.js';
import type { UserRole } from './user.entity.js';
import { UserRepository } from './user.repository.interface.js';

function mapRowToUser(row: any): User {
  const roles: UserRole[] = Array.isArray(row.roles) ? row.roles : ['USER'];

  return new User(
    row.username,
    row.email,
    row.password_hash,
    roles,
    row.is_active,
    row.created_at ? new Date(row.created_at) : new Date(),
    row.id,
  );
}

export class UserPostgresRepository implements UserRepository {
  constructor(private readonly db: Pool) {
    this.db = db;
  }

  async create(user: User): Promise<User> {
    const { username, email, passwordHash, roles, isActive } = user;

    const { rows } = await this.db.query(
      `INSERT INTO users (username, email, password_hash, roles, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [username, email, passwordHash, roles, isActive],
    );

    return mapRowToUser(rows[0]);
  }

  async findById(id: number): Promise<User | null> {
    const { rows } = await this.db.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [
      id,
    ]);

    return rows[0] ? mapRowToUser(rows[0]) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const { rows } = await this.db.query(
      'SELECT * FROM users WHERE username = $1 LIMIT 1',
      [username],
    );

    return rows[0] ? mapRowToUser(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await this.db.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email],
    );

    return rows[0] ? mapRowToUser(rows[0]) : null;
  }

  async search(
    page: number,
    pageSize: number,
    searchTerm?: string,
  ): Promise<{ data: User[]; total: number }> {
    const offset = (page - 1) * pageSize;
    const params: any[] = [];
    const where: string[] = [];

    if (searchTerm) {
      params.push(`%${searchTerm}%`);
      where.push('(username ILIKE $1 OR email ILIKE $1)');
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*)::int AS total FROM users ${whereClause}`;
    const dataQuery = `SELECT * FROM users ${whereClause} ORDER BY id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    const countParams = [...params];
    const dataParams = [...params, pageSize, offset];

    const countResult = await this.db.query<{ total: number }>(countQuery, countParams);
    const { rows } = await this.db.query(dataQuery, dataParams);

    return {
      data: rows.map(mapRowToUser),
      total: countResult.rows[0]?.total ?? 0,
    };
  }

  async update(id: number, data: Partial<User>): Promise<User | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (data.username !== undefined) {
      fields.push(`username = $${index++}`);
      values.push(data.username);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${index++}`);
      values.push(data.email);
    }
    if (data.passwordHash !== undefined) {
      fields.push(`password_hash = $${index++}`);
      values.push(data.passwordHash);
    }
    if (data.roles !== undefined) {
      fields.push(`roles = $${index++}`);
      values.push(data.roles);
    }
    if (data.isActive !== undefined) {
      fields.push(`is_active = $${index++}`);
      values.push(data.isActive);
    }

    if (fields.length === 0) {
      const existing = await this.findById(id);
      return existing ?? undefined;
    }

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
    const { rows } = await this.db.query(query, values);

    return rows[0] ? mapRowToUser(rows[0]) : undefined;
  }

  async delete(id: number): Promise<boolean> {
    const { rowCount } = await this.db.query('DELETE FROM users WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  }
}
