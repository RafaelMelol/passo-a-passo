import "server-only";
import type { SourceConfig } from "@/lib/crawler/types";
import type { SqlClient } from "../db/client";
import { safeErrorMessage, toIso, toNumber } from "./util";

export interface SourceState {
  id: string;
  enabled: boolean;
  health: "unknown" | "ok" | "degraded" | "failing" | "disabled";
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  nextRunAt: string | null;
  consecutiveFailures: number;
  lastError: string | null;
}

function canAutomate(config: SourceConfig): boolean {
  return config.automation.allowed;
}

/**
 * Registra fontes novas e garante que fontes sem permissão de coleta automatizada
 * nunca fiquem ativas, mesmo que alguém tenha mudado o banco manualmente.
 */
export async function syncSources(db: SqlClient, configs: readonly SourceConfig[]): Promise<void> {
  for (const config of configs) {
    const enabled = config.kind === "manual" ? config.defaultEnabled : canAutomate(config) && config.defaultEnabled;
    await db.query(
      `INSERT INTO sources (id, enabled, health) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
      [config.id, enabled, canAutomate(config) || config.kind === "manual" ? "unknown" : "disabled"],
    );
    if (!canAutomate(config) && config.kind !== "manual") {
      await db.query(`UPDATE sources SET enabled = false, health = 'disabled' WHERE id = $1 AND (enabled OR health <> 'disabled')`, [
        config.id,
      ]);
    }
  }
}

function mapState(row: Record<string, unknown>): SourceState {
  return {
    id: String(row.id),
    enabled: Boolean(row.enabled),
    health: String(row.health) as SourceState["health"],
    lastRunAt: toIso(row.last_run_at),
    lastSuccessAt: toIso(row.last_success_at),
    nextRunAt: toIso(row.next_run_at),
    consecutiveFailures: toNumber(row.consecutive_failures),
    lastError: (row.last_error as string | null) ?? null,
  };
}

export async function listSourceStates(db: SqlClient): Promise<SourceState[]> {
  const rows = await db.query(`SELECT * FROM sources ORDER BY id`);
  return rows.map(mapState);
}

export async function getSourceState(db: SqlClient, id: string): Promise<SourceState | null> {
  const rows = await db.query(`SELECT * FROM sources WHERE id = $1`, [id]);
  return rows[0] ? mapState(rows[0]) : null;
}

export async function setSourceEnabled(db: SqlClient, id: string, enabled: boolean): Promise<void> {
  await db.query(
    `UPDATE sources SET enabled = $2, health = CASE WHEN $2 THEN 'unknown' ELSE 'disabled' END, updated_at = now() WHERE id = $1`,
    [id, enabled],
  );
}

export async function recordSourceSuccess(db: SqlClient, id: string, now: Date, nextRunAt: Date, partial: boolean): Promise<void> {
  await db.query(
    `UPDATE sources SET last_run_at = $2, last_success_at = $2, next_run_at = $3, consecutive_failures = 0,
       last_error = NULL, health = $4, updated_at = $2 WHERE id = $1`,
    [id, now.toISOString(), nextRunAt.toISOString(), partial ? "degraded" : "ok"],
  );
}

export async function recordSourceFailure(db: SqlClient, id: string, now: Date, error: unknown, nextRunAt: Date): Promise<void> {
  await db.query(
    `UPDATE sources SET last_run_at = $2, next_run_at = $3, consecutive_failures = consecutive_failures + 1,
       last_error = $4, health = CASE WHEN consecutive_failures + 1 >= 3 THEN 'failing' ELSE 'degraded' END, updated_at = $2
     WHERE id = $1`,
    [id, now.toISOString(), nextRunAt.toISOString(), safeErrorMessage(error)],
  );
}
