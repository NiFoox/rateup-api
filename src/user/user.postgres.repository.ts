import { Pool } from 'pg';
import { User } from './user.entity.js';
import { UserRepository } from './user.repository.interface.js';

function mapRowToUser(row: any): User {
  return new User(
    row.username,
    row.email,
    row.password,
    row.is_active,
    row.created_at,
    row.id,
  );
}

export class UserPostgresRepository implements UserRepository {
  constructor(private readonly db: Pool) {}

  async create(user: User): Promise<User> {
    const { rows } = await this.db.query(
      'INSERT INTO users (username, email, password, is_active) VALUES ($1,$2,$3,$4) RETURNING *',
      [user.username, user.email, user.password, user.isActive],
    );
    return mapRowToUser(rows[0]);
  }

  async findById(id: number): Promise<User | null> {
    const { rows } = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] ? mapRowToUser(rows[0]) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const { rows } = await this.db.query('SELECT * FROM users WHERE username = $1', [username]);
    return rows[0] ? mapRowToUser(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] ? mapRowToUser(rows[0]) : null;
  }

  async search(
    page: number,
    pageSize: number,
    searchTerm?: string,
  ): Promise<{ data: User[]; total: number }> {
    const offset = (page - 1) * pageSize;
    const params: any[] = [];
    let whereClause = '';

    if (searchTerm) {
      params.push(`%${searchTerm.toLowerCase()}%`);
      whereClause = 'WHERE LOWER(username) LIKE $1 OR LOWER(email) LIKE $1';
    }

    const totalQuery = `SELECT COUNT(*)::int AS count FROM users ${whereClause}`;
    const totalResult = await this.db.query(totalQuery, params);
    const total = Number(totalResult.rows[0]?.count ?? 0);

    const dataQuery = `SELECT * FROM users ${whereClause} ORDER BY id LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    const dataResult = await this.db.query(dataQuery, [...params, pageSize, offset]);
    const data = dataResult.rows.map(mapRowToUser);

    return { data, total };
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
    if (data.isActive !== undefined) {
      fields.push(`is_active = $${index++}`);
      values.push(data.isActive);
    }
    if (data.password !== undefined) {
      fields.push(`password = $${index++}`);
      values.push(data.password);
    }

    if (!fields.length) {
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
