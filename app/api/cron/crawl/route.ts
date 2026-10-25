import { connection } from "next/server";
import { defaultDeps } from "@/lib/api/default-deps";
import { handleCron } from "@/lib/api/handlers/cron";

// Coleta diária disparada pelo Vercel Cron (ver vercel.json). Orçamento interno: 240 s.
export const maxDuration = 300;

export async function GET(request: Request) {
  await connection();
  return handleCron(request, defaultDeps);
}
