import "server-only";
import type { SqlClient } from "../db/client";
import { safeErrorMessage, toIso, toNumber } from "./util";

export type DocumentKind = "listing" | "exam_page" | "booklet" | "answer_key" | "rectification" | "other";
export type DocumentStatus = "discovered" | "fetched" | "processed" | "unchanged" | "failed" | "skipped";

export interface DocumentRecord {
  id: number;
  sourceId: string;
  url: string;
  kind: DocumentKind;
  title: string | null;
  parentUrl: string | null;
  sha256: string | null;
  status: DocumentStatus;
  attempts: number;
  lastError: string | null;
  firstSeenAt: string | null;
  lastCheckedAt: string | null;
  processedAt: string | null;
}

function mapDocument(row: Record<string, unknown>): DocumentRecord {
  return {
    id: toNumber(row.id),
    sourceId: String(row.source_id),
    url: String(row.url),
    kind: String(row.kind) as DocumentKind,
    title: (row.title as string | null) ?? null,
    parentUrl: (row.parent_url as string | null) ?? null,
    sha256: (row.sha256 as string | null) ?? null,
    status: String(row.status) as DocumentStatus,
    attempts: toNumber(row.attempts),
    lastError: (row.last_error as string | null) ?? null,
    firstSeenAt: toIso(row.first_seen_at),
    lastCheckedAt: toIso(row.last_checked_at),
    processedAt: toIso(row.processed_at),
  };
}

/** Registra um documento encontrado (a URL é única: rodar de novo não duplica). */
export async function upsertDiscoveredDocument(
  db: SqlClient,
  input: { sourceId: string; url: string; kind: DocumentKind; title?: string | null; parentUrl?: string | null },
): Promise<{ document: DocumentRecord; isNew: boolean }> {
  const inserted = await db.query(
    `INSERT INTO documents (source_id, url, kind, title, parent_url) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (url) DO NOTHING RETURNING *`,
    [input.sourceId, input.url, input.kind, input.title ?? null, input.parentUrl ?? null],
  );
  if (inserted[0]) return { document: mapDocument(inserted[0]), isNew: true };
  const existing = await db.query(`UPDATE documents SET title = COALESCE($2, title) WHERE url = $1 RETURNING *`, [
    input.url,
    input.title ?? null,
  ]);
  return { document: mapDocument(existing[0]), isNew: false };
}

export async function getDocumentByUrl(db: SqlClient, url: string): Promise<DocumentRecord | null> {
  const rows = await db.query(`SELECT * FROM documents WHERE url = $1`, [url]);
  return rows[0] ? mapDocument(rows[0]) : null;
}

/** Grava o resultado do download. `changed` indica se o conteúdo mudou desde a última vez. */
export async function markDocumentFetched(
  db: SqlClient,
  url: string,
  file: { sha256: string; contentType: string; byteSize: number },
  now: Date,
): Promise<{ changed: boolean; previousSha256: string | null }> {
  const previous = await db.query<{ sha256: string | null }>(`SELECT sha256 FROM documents WHERE url = $1`, [url]);
  const previousSha256 = previous[0]?.sha256 ?? null;
  await db.query(
    `UPDATE documents SET sha256 = $2, content_type = $3, byte_size = $4, last_checked_at = $5,
       status = CASE WHEN sha256 = $2 AND status IN ('processed','unchanged') THEN 'unchanged' ELSE 'fetched' END,
       last_error = NULL
     WHERE url = $1`,
    [url, file.sha256, file.contentType, file.byteSize, now.toISOString()],
  );
  return { changed: previousSha256 !== file.sha256, previousSha256 };
}

export async function markDocumentProcessed(db: SqlClient, url: string, now: Date): Promise<void> {
  await db.query(`UPDATE documents SET status = 'processed', processed_at = $2, attempts = 0, last_error = NULL WHERE url = $1`, [
    url,
    now.toISOString(),
  ]);
}

export async function markDocumentStatus(db: SqlClient, url: string, status: DocumentStatus, now: Date, note?: string): Promise<void> {
  await db.query(`UPDATE documents SET status = $2, last_checked_at = $3, last_error = $4 WHERE url = $1`, [
    url,
    status,
    now.toISOString(),
    note ?? null,
  ]);
}

export async function markDocumentFailed(db: SqlClient, url: string, error: unknown, now: Date): Promise<void> {
  await db.query(
    `UPDATE documents SET status = 'failed', attempts = attempts + 1, last_error = $2, last_checked_at = $3 WHERE url = $1`,
    [url, safeErrorMessage(error), now.toISOString()],
  );
}

export async function listDocuments(
  db: SqlClient,
  filters: { sourceId?: string; status?: DocumentStatus; limit: number },
): Promise<DocumentRecord[]> {
  const rows = await db.query(
    `SELECT * FROM documents WHERE ($1::text IS NULL OR source_id = $1) AND ($2::text IS NULL OR status = $2)
     ORDER BY COALESCE(last_checked_at, first_seen_at) DESC LIMIT $3`,
    [filters.sourceId ?? null, filters.status ?? null, filters.limit],
  );
  return rows.map(mapDocument);
}

export async function countFailedChildren(db: SqlClient, parentUrl: string): Promise<number> {
  // Falhos ou devolvidos para a fila ("reprocessar"): têm prioridade na próxima coleta.
  const rows = await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM documents WHERE parent_url = $1 AND status IN ('failed','discovered')`, [parentUrl]);
  return toNumber(rows[0]?.n);
}

/** Quantos cadernos de prova já foram encontrados a partir de uma página (indica que o ano tem provas publicadas). */
export async function countBookletChildren(db: SqlClient, parentUrl: string): Promise<number> {
  const rows = await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM documents WHERE parent_url = $1 AND kind = 'booklet'`, [parentUrl]);
  return toNumber(rows[0]?.n);
}

/** Reprocessar: volta documentos com falha para "descoberto", para a próxima execução tentar de novo. */
export async function resetFailedDocuments(db: SqlClient, ids?: readonly number[]): Promise<number> {
  const rows = ids && ids.length > 0
    ? await db.query(`UPDATE documents SET status = 'discovered', attempts = 0 WHERE status = 'failed' AND id = ANY($1::int[]) RETURNING id`, [
        [...ids],
      ])
    : await db.query(`UPDATE documents SET status = 'discovered', attempts = 0 WHERE status = 'failed' RETURNING id`);
  return rows.length;
}
