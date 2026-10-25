import { connection } from "next/server";
import { defaultDeps } from "@/lib/api/default-deps";
import { handleListQuestions } from "@/lib/api/handlers/public";

/** Questões publicadas com texto integral autorizado (filtros, paginação). */
export async function GET(request: Request) {
  await connection();
  return handleListQuestions(request, defaultDeps);
}
