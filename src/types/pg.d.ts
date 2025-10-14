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
}
