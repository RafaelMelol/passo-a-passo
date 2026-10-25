import "server-only";
import { CRAWLER_SOURCES } from "@/data/crawler-sources";
import type { SqlClient } from "@/lib/server/db/client";
import { acquireLock, extendLock, releaseLock } from "@/lib/server/repositories/locks";
import {
  createRun,
  cronRunsSince,
  finishRun,
  heartbeatRun,
  markStaleRunsInterrupted,
  recordRunSource,
  type RunStatus,
  type RunSummaryStats,
  type RunTrigger,
} from "@/lib/server/repositories/runs";
import { listSourceStates, recordSourceFailure, recordSourceSuccess } from "@/lib/server/repositories/sources";
import { safeErrorMessage } from "@/lib/server/repositories/util";
import { createId } from "@/lib/random";
import { ADAPTERS } from "../adapters";
import type { SourceAdapter } from "../adapters/types";
import { createFetcher, crawlerUserAgent, type Fetcher } from "../http/fetcher";
import { createAdapterContext, runAdapter } from "../pipeline";
import { emptySourceStats, type SourceConfig } from "../types";
import { failureBackoffMs, nextDailyRun, readScheduleConfig, startOfZonedDay, type ScheduleConfig } from "./schedule";

export const CRAWLER_LOCK = "coletor-diario";
/** Uma execução sem sinal de vida há mais que isso é considerada interrompida. */
export const STALE_RUN_MS = 15 * 60_000;
export const DEFAULT_BUDGET_MS = 240_000;

export interface CrawlOptions {
  db: SqlClient;
  trigger: RunTrigger;
  sources?: readonly SourceConfig[];
  adapters?: Readonly<Record<string, SourceAdapter>>;
  fetcher?: Fetcher;
  now?: () => Date;
  budgetMs?: number;
  schedule?: ScheduleConfig;
  /** Execução manual de uma única fonte. */
  onlySourceId?: string;
}

export type CrawlOutcome =
  | { status: "skipped"; reason: string }
  | { status: Exclude<RunStatus, "running">; runId: string; stats: RunSummaryStats; errors: string[]; warnings: string[] };

/** Já houve coleta agendada hoje (no fuso configurado)? Evita duas coletas no mesmo dia. */
export async function scheduledRunAlreadyToday(db: SqlClient, now: Date, schedule: ScheduleConfig = readScheduleConfig()): Promise<boolean> {
  const runs = await cronRunsSince(db, startOfZonedDay(now, schedule.timezone));
  return runs.length > 0;
}

function emptySummary(): RunSummaryStats {
  return { ...emptySourceStats(), sourcesChecked: 0, sourcesOk: 0, sourcesFailed: [] };
}

/**
 * Executa a coleta: trava contra execuções simultâneas, marca execuções interrompidas,
 * roda cada fonte ativa isoladamente (a falha de uma não para as outras),
 * respeita o orçamento de tempo e registra tudo no histórico.
 */
export async function runCrawl(options: CrawlOptions): Promise<CrawlOutcome> {
  const now = options.now ?? (() => new Date());
  const { db } = options;
  const budgetMs = options.budgetMs ?? DEFAULT_BUDGET_MS;
  const schedule = options.schedule ?? readScheduleConfig();
  const sources = options.sources ?? CRAWLER_SOURCES;
  const adapters = options.adapters ?? ADAPTERS;
  const runId = createId("coleta");
  const startedAt = now();
  const deadline = startedAt.getTime() + budgetMs;

  await markStaleRunsInterrupted(db, new Date(startedAt.getTime() - STALE_RUN_MS), startedAt);
  const locked = await acquireLock(db, CRAWLER_LOCK, runId, startedAt, budgetMs + STALE_RUN_MS);
  if (!locked) return { status: "skipped", reason: "Outra coleta já está em andamento." };

  const summary = emptySummary();
  const errors: string[] = [];
  const warnings: string[] = [];
  try {
    await createRun(db, runId, options.trigger, startedAt);
    const fetcher = options.fetcher ?? createFetcher({ userAgent: crawlerUserAgent() });
    const states = new Map((await listSourceStates(db)).map((state) => [state.id, state]));

    const eligible = sources.filter((source) => {
      if (!source.automation.allowed) return false;
      if (options.onlySourceId && source.id !== options.onlySourceId) return false;
      const state = states.get(source.id);
      if (!state?.enabled) return false;
      // Coletas agendadas respeitam a espera após falhas; coletas manuais não.
      if (options.trigger === "cron" && state.nextRunAt && Date.parse(state.nextRunAt) > startedAt.getTime() + 60 * 60_000) return false;
      return true;
    });
    if (eligible.length === 0) warnings.push("Nenhuma fonte ativa e liberada para esta execução.");

    for (const source of eligible) {
      const sourceStarted = now();
      const stats = emptySourceStats();
      summary.sourcesChecked++;
      const adapter = source.automation.allowed ? adapters[source.automation.adapter] : undefined;
      if (!adapter) {
        const message = `[${source.id}] Adaptador não encontrado.`;
        errors.push(message);
        summary.sourcesFailed.push(source.id);
        await recordRunSource(db, { runId, sourceId: source.id, status: "failed", startedAt: sourceStarted, finishedAt: now(), stats, error: message });
        continue;
      }
      if (now().getTime() > deadline - 20_000) {
        warnings.push(`[${source.id}] Sem tempo restante nesta execução; fica para a próxima.`);
        await recordRunSource(db, { runId, sourceId: source.id, status: "skipped", startedAt: sourceStarted, finishedAt: now(), stats });
        continue;
      }

      const sourceWarnings: string[] = [];
      try {
        const context = createAdapterContext({ db, source, fetcher, now, deadline, stats, warnings: sourceWarnings });
        const result = await runAdapter(adapter, context, db, now, async () => {
          await heartbeatRun(db, runId, now());
          await extendLock(db, CRAWLER_LOCK, runId, now(), budgetMs + STALE_RUN_MS);
        });
        const partial = result.errors.length > 0 || sourceWarnings.some((warning) => /pr[oó]xima (coleta|execu)/.test(warning));
        errors.push(...result.errors.map((error) => `[${source.id}] ${error}`));
        warnings.push(...sourceWarnings);
        summary.sourcesOk++;
        await recordSourceSuccess(db, source.id, now(), nextDailyRun(now(), schedule), partial);
        await recordRunSource(db, { runId, sourceId: source.id, status: partial ? "partial" : "ok", startedAt: sourceStarted, finishedAt: now(), stats });
      } catch (error) {
        const message = safeErrorMessage(error);
        errors.push(`[${source.id}] ${message}`);
        warnings.push(...sourceWarnings);
        summary.sourcesFailed.push(source.id);
        const failures = (states.get(source.id)?.consecutiveFailures ?? 0) + 1;
        await recordSourceFailure(db, source.id, now(), error, new Date(now().getTime() + failureBackoffMs(failures)));
        await recordRunSource(db, { runId, sourceId: source.id, status: "failed", startedAt: sourceStarted, finishedAt: now(), stats, error: message });
      }

      for (const key of Object.keys(stats) as (keyof typeof stats)[]) summary[key] += stats[key];
      await heartbeatRun(db, runId, now());
    }

    const status: Exclude<RunStatus, "running"> =
      summary.sourcesChecked > 0 && summary.sourcesOk === 0
        ? "failed"
        : summary.sourcesFailed.length > 0 || errors.length > 0
          ? "partial"
          : "succeeded";
    await finishRun(db, runId, { status, stats: summary, errors, warnings }, now());
    return { status, runId, stats: summary, errors, warnings };
  } catch (error) {
    const message = safeErrorMessage(error);
    errors.push(message);
    await finishRun(db, runId, { status: "failed", stats: summary, errors, warnings }, now()).catch(() => undefined);
    return { status: "failed", runId, stats: summary, errors, warnings };
  } finally {
    await releaseLock(db, CRAWLER_LOCK, runId);
  }
}
