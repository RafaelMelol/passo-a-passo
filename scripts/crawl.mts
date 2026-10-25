// Coleta pela linha de comando (desenvolvimento, servidor próprio ou GitHub Actions).
// Uso: npm run crawl -- [--fonte inep-encceja] [--orcamento 240]
import { runCrawl } from "@/lib/crawler/scheduler/run";
import { getDb } from "@/lib/server/db";

const args = process.argv.slice(2);
const value = (flag: string) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};
const budgetSeconds = Number(value("--orcamento") ?? 240);
const db = await getDb();
const outcome = await runCrawl({
  db,
  trigger: "cli",
  budgetMs: Number.isFinite(budgetSeconds) ? budgetSeconds * 1000 : 240_000,
  ...(value("--fonte") ? { onlySourceId: value("--fonte") } : {}),
});
console.log(JSON.stringify(outcome, null, 2));
await db.close();
process.exit(outcome.status === "failed" ? 1 : 0);
