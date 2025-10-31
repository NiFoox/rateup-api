import { Client } from 'pg';
import { User } from './user.entity.js';
import { UserRepository } from './user.repository.interface.js';

const client = new Client({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  user: process.env.POSTGRES_USER || 'rateup',
  password: process.env.POSTGRES_PASSWORD || 'rateup123',
  database: process.env.POSTGRES_DB || 'rateupdb',
});

client.connect();

function mapRowToUser(row: any): User {
  return new User(
    row.username,
    row.email,
    row.password_hash,
    row.is_active,
    row.created_at,
    row.id
  );
}

export class UserPostgresRepository implements UserRepository {
  async create(user: User): Promise<User> {
    const { rows } = await client.query(
      'INSERT INTO users (username, email, password_hash, is_active) VALUES ($1,$2,$3,$4) RETURNING *',
      [user.username, user.email, user.passwordHash, user.isActive]
    );
    return mapRowToUser(rows[0]);
  }

  async findById(id: number): Promise<User | null> {
    const { rows } = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] ? mapRowToUser(rows[0]) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const { rows } = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    return rows[0] ? mapRowToUser(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] ? mapRowToUser(rows[0]) : null;
  }

  async search(page: number, pageSize: number, searchTerm?: string): Promise<{ data: User[]; total: number }> {
    const offset = (page - 1) * pageSize;
    const params: any[] = [];
    let whereClause = '';

    if (searchTerm) {
      params.push(`%${searchTerm.toLowerCase()}%`);
      whereClause = 'WHERE LOWER(username) LIKE $1 OR LOWER(email) LIKE $1';
    }

    const totalQuery = `SELECT COUNT(*)::int AS count FROM users ${whereClause}`;
    const totalResult = await client.query(totalQuery, params);
    const total = Number(totalResult.rows[0]?.count ?? 0);

    const dataParams = [...params];
    dataParams.push(pageSize, offset);

    const dataQuery = `SELECT * FROM users ${whereClause} ORDER BY id LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`;
    const { rows } = await client.query(dataQuery, dataParams);
    return { data: rows.map(mapRowToUser), total };
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
    if (data.passwordHash !== undefined) {
      fields.push(`password_hash = $${index++}`);
      values.push(data.passwordHash);
    }

    if (!fields.length) {
      const existing = await this.findById(id);
      return existing ?? undefined;
    }

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
    const { rows } = await client.query(query, values);
    return rows[0] ? mapRowToUser(rows[0]) : undefined;
  }

  async delete(id: number): Promise<boolean> {
    const { rowCount } = await client.query('DELETE FROM users WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  }
}
