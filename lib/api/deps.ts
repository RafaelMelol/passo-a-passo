import "server-only";
import type { CrawlOptions, CrawlOutcome } from "@/lib/crawler/scheduler/run";
import type { SqlClient } from "@/lib/server/db/client";

/** Dependências injetáveis dos manipuladores de API (facilita os testes). */
export interface ApiDeps {
  getDb: () => Promise<SqlClient>;
  now: () => Date;
  env: Record<string, string | undefined>;
  /** Executa trabalho depois de responder (em produção: `after` do Next.js). */
  runInBackground: (task: () => Promise<void>) => void;
  crawl: (options: CrawlOptions) => Promise<CrawlOutcome>;
}
