declare module 'pg' {
  export interface QueryResult<T = any> {
    rows: T[];
    rowCount?: number;
  }

  export class Client {
    constructor(config: any);
    connect(): Promise<void>;
    query<T = any>(queryText: string, values?: any[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }

  export interface PoolConfig {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    connect(): Promise<Client>;
    query<T = any>(queryText: string, values?: any[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }
}
