import "server-only";
import type { Question } from "@/types/question";
import type { SqlClient } from "../db/client";
import { enqueueReview } from "./reviews";
import { jsonParam, toNumber } from "./util";

export async function countByStatus(db: SqlClient) {
  const exams = await db.query<{ status: string; n: number }>(
    `SELECT publication_status AS status, count(*)::int AS n FROM exams GROUP BY publication_status`,
  );
  const questions = await db.query<{ status: string; n: number }>(
    `SELECT publication_status AS status, count(*)::int AS n FROM questions GROUP BY publication_status`,
  );
  const extra = await db.query<{ duplicates: number; open_reviews: number; failed_documents: number }>(
    `SELECT (SELECT count(*)::int FROM questions WHERE duplicate_of IS NOT NULL) AS duplicates,
            (SELECT count(*)::int FROM review_queue WHERE status = 'open') AS open_reviews,
            (SELECT count(*)::int FROM documents WHERE status = 'failed') AS failed_documents`,
  );
  const toRecord = (rows: { status: string; n: number }[]) => Object.fromEntries(rows.map((row) => [row.status, toNumber(row.n)]));
  return {
    exams: toRecord(exams),
    questions: toRecord(questions),
    duplicates: toNumber(extra[0]?.duplicates),
    openReviews: toNumber(extra[0]?.open_reviews),
    failedDocuments: toNumber(extra[0]?.failed_documents),
  };
}

export async function recordLoginAttempt(db: SqlClient, clientKey: string, success: boolean, now: Date): Promise<void> {
  await db.query(`INSERT INTO admin_login_attempts (client_key, success, created_at) VALUES ($1, $2, $3)`, [clientKey, success, now.toISOString()]);
  // Mantém a tabela pequena.
  await db.query(`DELETE FROM admin_login_attempts WHERE created_at < $1`, [new Date(now.getTime() - 7 * 86_400_000).toISOString()]);
}

export async function countRecentLoginFailures(db: SqlClient, clientKey: string, since: Date): Promise<number> {
  const rows = await db.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM admin_login_attempts WHERE client_key = $1 AND success = false AND created_at >= $2`,
    [clientKey, since.toISOString()],
  );
  return toNumber(rows[0]?.n);
}

/**
 * Importação manual de questão com texto integral. Sempre entra na fila de revisão;
 * só é publicada depois da aprovação do administrador.
 */
export async function insertImportedQuestion(
  db: SqlClient,
  input: { question: Question; statementHash: string; authorization: string; importedBy: string },
  now: Date,
): Promise<{ id: string; status: "inserted" | "duplicate"; duplicateOf?: string }> {
  const id = `importada-${input.question.id}`;
  const existing = await db.query<{ id: string }>(`SELECT id FROM questions WHERE id = $1 OR statement_hash = $2 LIMIT 1`, [id, input.statementHash]);
  if (existing[0]) return { id, status: "duplicate", duplicateOf: existing[0].id };

  const q = input.question;
  const official = q.contentType === "oficial";
  const verification = official
    ? q.verification.statement === "verificada" && q.verification.answerKey === "verificada"
      ? "verified_authorized"
      : "pending"
    : "practice_authored";
  await db.query(
    `INSERT INTO questions (id, exam_id, number, subject, topic, difficulty, classification_method, classification_confidence,
       difficulty_method, difficulty_confidence, level_flags, statement, support_text, options, explanation, correct_option,
       content_type, text_storage, verification_status, publication_status, statement_hash, extraction_confidence, source, version,
       discovered_at, updated_at)
     VALUES ($1, NULL, $2, $3, $4, $5, 'informado-na-importacao', 1, 'informado-na-importacao', 1, '[]'::jsonb, $6, $7::jsonb, $8::jsonb,
       $9::jsonb, $10, $11, 'full', $12, 'pending_validation', $13, 1, $14::jsonb, 1, $15, $15)`,
    [
      id,
      q.source.originalNumber ?? null,
      q.subject,
      q.topic,
      q.difficulty,
      q.statement,
      q.supportText ? jsonParam(q.supportText) : null,
      jsonParam(q.options),
      jsonParam(q.explanation),
      q.correctOption,
      q.contentType,
      verification,
      input.statementHash,
      jsonParam({ ...q.source, authorization: input.authorization.slice(0, 500), importedBy: input.importedBy }),
      now.toISOString(),
    ],
  );
  await enqueueReview(db, {
    itemType: "question",
    itemId: id,
    reason: "importacao_manual",
    details: `Autorização declarada: ${input.authorization.slice(0, 300)}`,
    priority: 2,
  });
  return { id, status: "inserted" };
}
