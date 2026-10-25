import "server-only";
import type { SourceRunStats } from "@/lib/crawler/types";
import type { SqlClient } from "../db/client";
import { jsonParam, toIso, toJson, toNumber } from "./util";

export type RunTrigger = "cron" | "manual" | "cli";
export type RunStatus = "running" | "succeeded" | "partial" | "failed" | "interrupted";

export interface RunSummaryStats extends SourceRunStats {
  sourcesChecked: number;
  sourcesOk: number;
  sourcesFailed: string[];
}

export interface CrawlRunRecord {
  id: string;
  trigger: RunTrigger;
  status: RunStatus;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
  stats: Partial<RunSummaryStats>;
  errors: string[];
  warnings: string[];
  sources: { sourceId: string; status: string; error: string | null; stats: Partial<SourceRunStats> }[];
}

export async function createRun(db: SqlClient, id: string, trigger: RunTrigger, now: Date): Promise<void> {
  await db.query(`INSERT INTO crawl_runs (id, trigger, status, started_at, heartbeat_at) VALUES ($1, $2, 'running', $3, $3)`, [
    id,
    trigger,
    now.toISOString(),
  ]);
}

export async function heartbeatRun(db: SqlClient, id: string, now: Date): Promise<void> {
  await db.query(`UPDATE crawl_runs SET heartbeat_at = $2 WHERE id = $1 AND status = 'running'`, [id, now.toISOString()]);
}

export async function finishRun(
  db: SqlClient,
  id: string,
  result: { status: Exclude<RunStatus, "running">; stats: RunSummaryStats; errors: string[]; warnings: string[] },
  now: Date,
): Promise<void> {
  await db.query(
    `UPDATE crawl_runs SET status = $2, finished_at = $3, heartbeat_at = $3,
       duration_ms = GREATEST(0, (EXTRACT(EPOCH FROM ($3::timestamptz - started_at)) * 1000)::int),
       stats = $4::jsonb, errors = $5::jsonb, warnings = $6::jsonb
     WHERE id = $1`,
    [id, result.status, now.toISOString(), jsonParam(result.stats), jsonParam(result.errors.slice(0, 50)), jsonParam(result.warnings.slice(0, 100))],
  );
}

export async function recordRunSource(
  db: SqlClient,
  input: { runId: string; sourceId: string; status: "ok" | "partial" | "failed" | "skipped"; startedAt: Date; finishedAt: Date; stats: SourceRunStats; error?: string },
): Promise<void> {
  await db.query(
    `INSERT INTO crawl_run_sources (run_id, source_id, status, started_at, finished_at, stats, error)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)
     ON CONFLICT (run_id, source_id) DO UPDATE SET status = EXCLUDED.status, finished_at = EXCLUDED.finished_at, stats = EXCLUDED.stats, error = EXCLUDED.error`,
    [input.runId, input.sourceId, input.status, input.startedAt.toISOString(), input.finishedAt.toISOString(), jsonParam(input.stats), input.error ?? null],
  );
}

/** Execuções que pararam de dar sinal de vida (queda do servidor, tempo esgotado) viram "interrompidas". */
export async function markStaleRunsInterrupted(db: SqlClient, staleBefore: Date, now: Date): Promise<string[]> {
  const rows = await db.query<{ id: string }>(
    `UPDATE crawl_runs SET status = 'interrupted', finished_at = $2,
       errors = errors || '["Execução interrompida antes de terminar (sem sinal de atividade)."]'::jsonb
     WHERE status = 'running' AND heartbeat_at < $1 RETURNING id`,
    [staleBefore.toISOString(), now.toISOString()],
  );
  return rows.map((row) => row.id);
}

function mapRun(row: Record<string, unknown>): CrawlRunRecord {
  return {
    id: String(row.id),
    trigger: String(row.trigger) as RunTrigger,
    status: String(row.status) as RunStatus,
    startedAt: toIso(row.started_at),
    finishedAt: toIso(row.finished_at),
    durationMs: row.duration_ms === null || row.duration_ms === undefined ? null : toNumber(row.duration_ms),
    stats: toJson<Partial<RunSummaryStats>>(row.stats, {}),
    errors: toJson<string[]>(row.errors, []),
    warnings: toJson<string[]>(row.warnings, []),
    sources: [],
  };
}

export async function listRuns(db: SqlClient, limit: number, offset: number): Promise<{ items: CrawlRunRecord[]; total: number }> {
  const rows = await db.query(`SELECT * FROM crawl_runs ORDER BY started_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
  const total = await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM crawl_runs`);
  const runs = rows.map(mapRun);
  if (runs.length > 0) {
    const sourceRows = await db.query(`SELECT * FROM crawl_run_sources WHERE run_id = ANY($1::text[]) ORDER BY source_id`, [runs.map((run) => run.id)]);
    for (const run of runs) {
      run.sources = sourceRows
        .filter((row) => row.run_id === run.id)
        .map((row) => ({
          sourceId: String(row.source_id),
          status: String(row.status),
          error: (row.error as string | null) ?? null,
          stats: toJson<Partial<SourceRunStats>>(row.stats, {}),
        }));
    }
  }
  return { items: runs, total: toNumber(total[0]?.n) };
}

export async function getRun(db: SqlClient, id: string): Promise<CrawlRunRecord | null> {
  const rows = await db.query(`SELECT * FROM crawl_runs WHERE id = $1`, [id]);
  return rows[0] ? mapRun(rows[0]) : null;
}

export async function lastFinishedRun(db: SqlClient, statuses: readonly RunStatus[]): Promise<CrawlRunRecord | null> {
  const rows = await db.query(
    `SELECT * FROM crawl_runs WHERE status = ANY($1::text[]) AND finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 1`,
    [[...statuses]],
  );
  return rows[0] ? mapRun(rows[0]) : null;
}

/** Execuções agendadas iniciadas a partir de um instante (para evitar duas coletas no mesmo dia). */
export async function cronRunsSince(db: SqlClient, since: Date): Promise<CrawlRunRecord[]> {
  const rows = await db.query(
    `SELECT * FROM crawl_runs WHERE trigger = 'cron' AND started_at >= $1 AND status IN ('running','succeeded','partial') ORDER BY started_at DESC`,
    [since.toISOString()],
  );
  return rows.map(mapRun);
}
