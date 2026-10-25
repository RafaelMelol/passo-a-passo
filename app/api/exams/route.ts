import { connection } from "next/server";
import { defaultDeps } from "@/lib/api/default-deps";
import { handleListExams } from "@/lib/api/handlers/public";

/** Provas oficiais publicadas (sem gabarito). */
export async function GET(request: Request) {
  await connection();
  return handleListExams(request, defaultDeps);
}
