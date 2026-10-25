import { connection } from "next/server";
import { defaultDeps } from "@/lib/api/default-deps";
import { handleRunNow } from "@/lib/api/handlers/admin";

// A coleta roda depois da resposta (after), dentro deste limite de tempo.
export const maxDuration = 300;

export async function POST(request: Request) {
  await connection();
  return handleRunNow(request, defaultDeps);
}
