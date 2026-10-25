import { connection } from "next/server";
import { defaultDeps } from "@/lib/api/default-deps";
import { handleToggleSource } from "@/lib/api/handlers/admin";

export async function PATCH(request: Request, context: RouteContext<"/api/admin/crawler/sources/[id]">) {
  await connection();
  const { id } = await context.params;
  return handleToggleSource(request, id, defaultDeps);
}
