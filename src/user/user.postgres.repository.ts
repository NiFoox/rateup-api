import { UserWithSecrets } from './user.entity.js';
import { UserListFilters, UserRepository } from './user.repository.interface.js';

type Pool = import('pg').Pool;

function mapRow(row: any): UserWithSecrets {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    roles: (row.roles ?? []) as string[],
    active: row.active ?? row.is_active,
    createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    updatedAt: row.updated_at ?? null,
    passwordHash: row.password_hash ?? null,
  };
}

const SORT_COLUMNS: Record<NonNullable<UserListFilters['sort']>, string> = {
  name: 'name',
  email: 'email',
  createdAt: 'created_at',
  active: 'active',
};

export class UserPostgresRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async list(filters: UserListFilters): Promise<{ users: UserWithSecrets[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];

    if (filters.search) {
      values.push(`%${filters.search.toLowerCase()}%`);
      conditions.push('(LOWER(name) LIKE $' + values.length + ' OR LOWER(email) LIKE $' + values.length + ')');
    }

    if (filters.role) {
      values.push(filters.role);
      conditions.push('$' + values.length + ' = ANY(roles)');
    }

    if (typeof filters.active === 'boolean') {
      values.push(filters.active);
      conditions.push('active = $' + values.length);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalQuery = `SELECT COUNT(*)::int AS total FROM users ${whereClause}`;
    const totalResult = await this.pool.query<{ total: number }>(totalQuery, values);
    const total = totalResult.rows[0]?.total ?? 0;

    const orderColumn = filters.sort ? SORT_COLUMNS[filters.sort] ?? 'created_at' : 'created_at';
    const direction = filters.dir === 'desc' ? 'DESC' : 'ASC';

    const limitIndex = values.length + 1;
    const offsetIndex = values.length + 2;
    const dataValues = [...values, filters.limit, filters.offset];

    const dataQuery = `
      SELECT id, name, email, roles, active, password_hash, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY ${orderColumn} ${direction}
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `;

    const { rows } = await this.pool.query(dataQuery, dataValues);
    return { users: rows.map(mapRow), total };
  }

  async findById(id: string): Promise<UserWithSecrets | null> {
    const { rows } = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<UserWithSecrets | null> {
    const { rows } = await this.pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async findByName(name: string): Promise<UserWithSecrets | null> {
    const { rows } = await this.pool.query('SELECT * FROM users WHERE LOWER(name) = LOWER($1)', [name]);
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async create(data: {
    name: string;
    email: string;
    roles: string[];
    active: boolean;
    passwordHash?: string | null;
  }): Promise<UserWithSecrets> {
    const { rows } = await this.pool.query(
      `
      INSERT INTO users (name, email, roles, active, password_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, roles, active, password_hash, created_at, updated_at
    `,
      [data.name, data.email, data.roles, data.active, data.passwordHash ?? null],
    );

    if (!rows[0]) {
      throw new Error('USER_CREATE_FAILED');
    }

    // TODO: ensure users table includes name, roles (TEXT[]), active, password_hash columns.
    return mapRow(rows[0]);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      roles: string[];
      active: boolean;
      passwordHash?: string | null;
    }>,
  ): Promise<UserWithSecrets | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      values.push(data.name);
      fields.push(`name = $${values.length}`);
    }
    if (data.email !== undefined) {
      values.push(data.email);
      fields.push(`email = $${values.length}`);
    }
    if (data.roles !== undefined) {
      values.push(data.roles);
      fields.push(`roles = $${values.length}`);
    }
    if (data.active !== undefined) {
      values.push(data.active);
      fields.push(`active = $${values.length}`);
    }
    if (data.passwordHash !== undefined) {
      values.push(data.passwordHash);
      fields.push(`password_hash = $${values.length}`);
    }

    if (!fields.length) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING id, name, email, roles, active, password_hash, created_at, updated_at
    `;

    const { rows } = await this.pool.query(query, values);
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
