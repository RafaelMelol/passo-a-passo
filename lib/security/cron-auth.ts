import "server-only";
import { safeEqual } from "./admin-auth";

/**
 * O agendador (Vercel Cron) envia "Authorization: Bearer <CRON_SECRET>".
 * Sem segredo configurado, a rota de agendamento fica fechada.
 */
export function isAuthorizedCronRequest(request: Request, env: Record<string, string | undefined> = process.env): boolean {
  const secret = env.CRON_SECRET ?? "";
  if (secret.length < 16) return false;
  const header = request.headers.get("authorization") ?? "";
  return safeEqual(header, `Bearer ${secret}`);
}
