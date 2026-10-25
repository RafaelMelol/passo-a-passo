import { connection } from "next/server";
import { defaultDeps } from "@/lib/api/default-deps";
import { handleGetExam } from "@/lib/api/handlers/public";

export async function GET(request: Request, context: RouteContext<"/api/exams/[id]">) {
  await connection();
  const { id } = await context.params;
  return handleGetExam(request, id, defaultDeps);
}
