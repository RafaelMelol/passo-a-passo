import { connection } from "next/server";
import { defaultDeps } from "@/lib/api/default-deps";
import { handleRecentUpdates } from "@/lib/api/handlers/public";

export async function GET(request: Request) {
  await connection();
  return handleRecentUpdates(request, defaultDeps);
}
