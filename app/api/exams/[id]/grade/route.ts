import { connection } from "next/server";
import { defaultDeps } from "@/lib/api/default-deps";
import { handleGradeExam } from "@/lib/api/handlers/public";

/** Corrige o cartão-resposta no servidor (o gabarito não vai para o navegador antes do envio). */
export async function POST(request: Request, context: RouteContext<"/api/exams/[id]/grade">) {
  await connection();
  const { id } = await context.params;
  return handleGradeExam(request, id, defaultDeps);
}
