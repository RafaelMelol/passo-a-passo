import { connection } from "next/server";
import { defaultDeps } from "@/lib/api/default-deps";
import { handleImportExam } from "@/lib/api/handlers/admin";

export const maxDuration = 120;

export async function POST(request: Request) {
  await connection();
  return handleImportExam(request, defaultDeps);
}
