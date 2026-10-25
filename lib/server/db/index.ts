import "server-only";
import { CRAWLER_SOURCES } from "@/data/crawler-sources";
import { syncSources } from "../repositories/sources";
import { createPgClient, createPgliteClient, type SqlClient } from "./client";
import { migrate } from "./migrations";

export type { SqlClient } from "./client";

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("Banco central não configurado: defina DATABASE_URL (PostgreSQL) no ambiente de produção.");
    this.name = "DatabaseNotConfiguredError";
  }
}

let dbPromise: Promise<SqlClient> | null = null;

/** Prepara um banco recém-aberto: aplica migrações e registra as fontes configuradas. */
export async function prepareDatabase(db: SqlClient): Promise<SqlClient> {
  await migrate(db);
  await syncSources(db, CRAWLER_SOURCES);
  return db;
}

/**
 * Banco central:
 * - DATABASE_URL definido → PostgreSQL (produção, ex.: Neon/Vercel Postgres);
 * - sem DATABASE_URL fora de produção → PGlite gravado em .data/pglite (desenvolvimento);
 * - sem DATABASE_URL em produção → erro claro (o estudo continua funcionando com o banco local do site).
 */
export function getDb(): Promise<SqlClient> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const url = process.env.DATABASE_URL;
      if (url) return prepareDatabase(await createPgClient(url));
      if (process.env.NODE_ENV === "production" && process.env.ALLOW_EMBEDDED_DB !== "1") {
        throw new DatabaseNotConfiguredError();
      }
      return prepareDatabase(await createPgliteClient(process.env.PGLITE_DATA_DIR ?? ".data/pglite"));
    })().catch((error: unknown) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

/** Usado nos testes para injetar um banco em memória. */
export function setDbForTests(db: SqlClient | null): void {
  dbPromise = db ? Promise.resolve(db) : null;
}

export function isDatabaseConfigError(error: unknown): boolean {
  return error instanceof DatabaseNotConfiguredError;
}
