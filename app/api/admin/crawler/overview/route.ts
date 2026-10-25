import { connection } from "next/server";
import { defaultDeps } from "@/lib/api/default-deps";
import { handleOverview } from "@/lib/api/handlers/admin";

export async function GET(request: Request) {
  await connection();
  return handleOverview(request, defaultDeps);
}
