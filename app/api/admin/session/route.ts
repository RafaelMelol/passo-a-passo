import { connection } from "next/server";
import { defaultDeps } from "@/lib/api/default-deps";
import { handleLogin, handleLogout, handleSessionStatus } from "@/lib/api/handlers/admin";

export async function GET(request: Request) {
  await connection();
  return handleSessionStatus(request, defaultDeps);
}

export async function POST(request: Request) {
  await connection();
  return handleLogin(request, defaultDeps);
}

export async function DELETE(request: Request) {
  await connection();
  return handleLogout(request, defaultDeps);
}
