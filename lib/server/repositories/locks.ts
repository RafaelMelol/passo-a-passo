import "server-only";
import type { SqlClient } from "../db/client";

/**
 * Trava distribuída simples no banco: só um processo por vez consegue a trava de um nome.
 * A trava expira sozinha (expires_at), o que permite retomar após uma queda.
 */
export async function acquireLock(db: SqlClient, name: string, holder: string, now: Date, ttlMs: number): Promise<boolean> {
  const rows = await db.query<{ holder: string }>(
    `INSERT INTO job_locks (name, holder, acquired_at, expires_at) VALUES ($1, $2, $3, $4)
     ON CONFLICT (name) DO UPDATE SET holder = EXCLUDED.holder, acquired_at = EXCLUDED.acquired_at, expires_at = EXCLUDED.expires_at
     WHERE job_locks.expires_at < EXCLUDED.acquired_at
     RETURNING holder`,
    [name, holder, now.toISOString(), new Date(now.getTime() + ttlMs).toISOString()],
  );
  return rows[0]?.holder === holder;
}

export async function extendLock(db: SqlClient, name: string, holder: string, now: Date, ttlMs: number): Promise<boolean> {
  const rows = await db.query(`UPDATE job_locks SET expires_at = $3 WHERE name = $1 AND holder = $2 RETURNING name`, [
    name,
    holder,
    new Date(now.getTime() + ttlMs).toISOString(),
  ]);
  return rows.length > 0;
}

export async function releaseLock(db: SqlClient, name: string, holder: string): Promise<void> {
  await db.query(`DELETE FROM job_locks WHERE name = $1 AND holder = $2`, [name, holder]);
}

export async function getLock(db: SqlClient, name: string): Promise<{ holder: string; expiresAt: string } | null> {
  const rows = await db.query<{ holder: string; expires_at: Date | string }>(`SELECT holder, expires_at FROM job_locks WHERE name = $1`, [name]);
  if (!rows[0]) return null;
  const expires = rows[0].expires_at instanceof Date ? rows[0].expires_at.toISOString() : String(rows[0].expires_at);
  return { holder: rows[0].holder, expiresAt: expires };
}
