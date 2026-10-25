import { connection } from "next/server";
import { defaultDeps } from "@/lib/api/default-deps";
import { handleReprocess } from "@/lib/api/handlers/admin";

export async function POST(request: Request) {
  await connection();
  return handleReprocess(request, defaultDeps);
}
