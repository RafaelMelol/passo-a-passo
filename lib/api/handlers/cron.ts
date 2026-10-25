import "server-only";
import { scheduledRunAlreadyToday } from "@/lib/crawler/scheduler/run";
import { readScheduleConfig } from "@/lib/crawler/scheduler/schedule";
import { isAuthorizedCronRequest } from "@/lib/security/cron-auth";
import type { ApiDeps } from "../deps";
import { apiError, handleApiError, json } from "../http";

/**
 * Chamado uma vez por dia pelo agendador (Vercel Cron). Protegido por CRON_SECRET.
 * Se a coleta do dia já aconteceu, não roda de novo (idempotente).
 */
export async function handleCron(request: Request, deps: ApiDeps): Promise<Response> {
  if (!isAuthorizedCronRequest(request, deps.env)) return apiError(401, "nao_autorizado", "Não autorizado.");
  try {
    const db = await deps.getDb();
    const now = deps.now();
    if (await scheduledRunAlreadyToday(db, now, readScheduleConfig(deps.env))) {
      return json({ status: "skipped", reason: "A coleta agendada de hoje já foi feita." });
    }
    const outcome = await deps.crawl({ db, trigger: "cron" });
    return json(outcome);
  } catch (error) {
    return handleApiError(error);
  }
}
