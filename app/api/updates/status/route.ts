import { connection } from "next/server";
import { defaultDeps } from "@/lib/api/default-deps";
import { handleUpdateStatus } from "@/lib/api/handlers/public";

/** Status público da última atualização do banco central. */
export async function GET(request: Request) {
  await connection();
  return handleUpdateStatus(request, defaultDeps);
}
