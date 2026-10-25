import "server-only";
import { after } from "next/server";
import { runCrawl } from "@/lib/crawler/scheduler/run";
import { getDb } from "@/lib/server/db";
import type { ApiDeps } from "./deps";

/** Dependências reais usadas pelas rotas do Next.js. */
export const defaultDeps: ApiDeps = {
  getDb,
  now: () => new Date(),
  env: process.env,
  runInBackground: (task) =>
    after(async () => {
      try {
        await task();
      } catch (error) {
        console.error("[coletor] falha na execução em segundo plano:", error instanceof Error ? error.message.slice(0, 300) : "desconhecida");
      }
    }),
  crawl: runCrawl,
};
