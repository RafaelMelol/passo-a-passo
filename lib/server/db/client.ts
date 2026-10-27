import "server-only";

/**
 * Interface mínima de acesso ao PostgreSQL, comum ao driver `pg` (produção)
 * e ao PGlite (Postgres embutido, usado em desenvolvimento e nos testes).
 * Todo SQL do projeto é escrito para o PostgreSQL e usa parâmetros ($1, $2…).
 */
export interface SqlClient {
  query<T = Record<string, unknown>>(sql: string, params?: readonly unknown[]): Promise<T[]>;
  /** Executa um script com vários comandos (sem parâmetros), como as migrações. */
  exec(sql: string): Promise<void>;
  transaction<T>(fn: (tx: SqlClient) => Promise<T>): Promise<T>;
  close(): Promise<void>;
  readonly kind: "postgres" | "pglite";
}

/**
 * O `pg` já trata sslmode=prefer/require/verify-ca como verify-full, mas avisa a cada conexão que isso vai mudar.
 * Deixar verify-full explícito mantém a verificação completa do certificado e silencia o aviso.
 * Quem pediu a semântica do libpq (`uselibpqcompat=true`) fica como está.
 */
export function withExplicitSslMode(connectionString: string): string {
  if (/[?&]uselibpqcompat=true(&|$)/i.test(connectionString)) return connectionString;
  return connectionString.replace(/([?&]sslmode=)(prefer|require|verify-ca)(?=&|$)/i, "$1verify-full");
}

export async function createPgClient(connectionString: string): Promise<SqlClient> {
  const { Pool } = await import("pg");
  const pool = new Pool({
    connectionString: withExplicitSslMode(connectionString),
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  function wrap(runner: { query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }> }, inTransaction: boolean): SqlClient {
    const client: SqlClient = {
      kind: "postgres",
      async query<T>(sql: string, params: readonly unknown[] = []) {
        const result = await runner.query(sql, [...params]);
        return result.rows as T[];
      },
      async exec(sql: string) {
        await runner.query(sql);
      },
      async transaction<T>(fn: (tx: SqlClient) => Promise<T>) {
        if (inTransaction) return fn(client);
        const connection = await pool.connect();
        try {
          await connection.query("BEGIN");
          const result = await fn(wrap(connection, true));
          await connection.query("COMMIT");
          return result;
        } catch (error) {
          await connection.query("ROLLBACK");
          throw error;
        } finally {
          connection.release();
        }
      },
      async close() {
        if (!inTransaction) await pool.end();
      },
    };
    return client;
  }

  return wrap(pool, false);
}

/** `dataDir` vazio = banco só em memória (testes). */
export async function createPgliteClient(dataDir?: string): Promise<SqlClient> {
  const { PGlite } = await import("@electric-sql/pglite");
  if (dataDir) {
    const { mkdir } = await import("node:fs/promises");
    const { dirname } = await import("node:path");
    await mkdir(dirname(dataDir), { recursive: true });
  }
  const db = dataDir ? new PGlite(dataDir) : new PGlite();

  type Runner = { query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>; exec: (sql: string) => Promise<unknown> };

  function wrap(runner: Runner, inTransaction: boolean): SqlClient {
    const client: SqlClient = {
      kind: "pglite",
      async query<T>(sql: string, params: readonly unknown[] = []) {
        const result = await runner.query(sql, [...params]);
        return result.rows as T[];
      },
      async exec(sql: string) {
        await runner.exec(sql);
      },
      async transaction<T>(fn: (tx: SqlClient) => Promise<T>) {
        if (inTransaction) return fn(client);
        return db.transaction((tx) => fn(wrap(tx as unknown as Runner, true)));
      },
      async close() {
        if (!inTransaction) await db.close();
      },
    };
    return client;
  }

  return wrap(db as unknown as Runner, false);
}
