import { connection } from "next/server";
import { defaultDeps } from "@/lib/api/default-deps";
import { handleResolveReview } from "@/lib/api/handlers/admin";

export async function POST(request: Request, context: RouteContext<"/api/admin/review/[id]">) {
  await connection();
  const { id } = await context.params;
  return handleResolveReview(request, id, defaultDeps);
}
