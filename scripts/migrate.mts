// Aplica as migrações no banco configurado (DATABASE_URL) ou no banco local de desenvolvimento.
import { getDb } from "@/lib/server/db";

const db = await getDb();
const rows = await db.query<{ id: string; applied_at: string }>("SELECT id, applied_at FROM schema_migrations ORDER BY id");
console.log(`Banco: ${db.kind}. Migrações aplicadas:`);
for (const row of rows) console.log(` - ${row.id}`);
await db.close();
