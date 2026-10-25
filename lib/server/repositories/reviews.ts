import "server-only";
import type { SqlClient } from "../db/client";
import { toIso, toNumber } from "./util";

export type ReviewReason =
  | "gabarito_preliminar"
  | "contagem_divergente"
  | "letra_invalida"
  | "bloco_incerto"
  | "sem_texto_no_pdf"
  | "estrutura_incompleta"
  | "retificacao_posterior"
  | "nivel_nao_confirmado"
  | "conteudo_acima_do_nivel"
  | "importacao_manual"
  | "possivel_duplicata";

export const REVIEW_REASON_LABELS: Record<ReviewReason, string> = {
  gabarito_preliminar: "Só há gabarito preliminar (aguardando o definitivo)",
  contagem_divergente: "Número de questões do caderno diferente do gabarito",
  letra_invalida: "Gabarito com letra fora das alternativas do caderno",
  bloco_incerto: "Não foi possível ter certeza de qual bloco do gabarito corresponde ao caderno",
  sem_texto_no_pdf: "PDF sem texto selecionável (precisaria de OCR)",
  estrutura_incompleta: "Questões ou alternativas incompletas na extração",
  retificacao_posterior: "Retificação publicada depois do gabarito",
  nivel_nao_confirmado: "Escolaridade do cargo não confirmada",
  conteudo_acima_do_nivel: "Possível conteúdo acima do nível fundamental",
  importacao_manual: "Item importado manualmente",
  possivel_duplicata: "Possível duplicata de questão existente",
};

export interface ReviewItem {
  id: number;
  itemType: "exam" | "question";
  itemId: string;
  itemTitle: string | null;
  reason: ReviewReason;
  reasonLabel: string;
  details: string | null;
  priority: number;
  status: "open" | "approved" | "rejected" | "dismissed";
  resolutionNote: string | null;
  createdAt: string | null;
  resolvedAt: string | null;
}

export async function enqueueReview(
  db: SqlClient,
  item: { itemType: "exam" | "question"; itemId: string; reason: ReviewReason; details?: string; priority?: number },
): Promise<boolean> {
  const rows = await db.query(
    `INSERT INTO review_queue (item_type, item_id, reason, details, priority) VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (item_type, item_id, reason) WHERE status = 'open' DO NOTHING RETURNING id`,
    [item.itemType, item.itemId, item.reason, item.details ?? null, item.priority ?? 2],
  );
  return rows.length > 0;
}

/** Fecha pendências que deixaram de valer (ex.: saiu o gabarito definitivo). */
export async function dismissResolvedReviews(
  db: SqlClient,
  itemType: "exam" | "question",
  itemId: string,
  stillOpen: readonly ReviewReason[],
  now: Date,
): Promise<number> {
  const rows = await db.query(
    `UPDATE review_queue SET status = 'dismissed', resolved_at = $3, resolution_note = 'Resolvido automaticamente: a pendência deixou de existir.'
     WHERE item_type = $1 AND item_id = $2 AND status = 'open' AND NOT (reason = ANY($4::text[])) RETURNING id`,
    [itemType, itemId, now.toISOString(), [...stillOpen]],
  );
  return rows.length;
}

function mapReview(row: Record<string, unknown>): ReviewItem {
  const reason = String(row.reason) as ReviewReason;
  return {
    id: toNumber(row.id),
    itemType: String(row.item_type) as ReviewItem["itemType"],
    itemId: String(row.item_id),
    itemTitle: (row.item_title as string | null) ?? null,
    reason,
    reasonLabel: REVIEW_REASON_LABELS[reason] ?? reason,
    details: (row.details as string | null) ?? null,
    priority: toNumber(row.priority),
    status: String(row.status) as ReviewItem["status"],
    resolutionNote: (row.resolution_note as string | null) ?? null,
    createdAt: toIso(row.created_at),
    resolvedAt: toIso(row.resolved_at),
  };
}

export async function listReviews(
  db: SqlClient,
  filters: { status: ReviewItem["status"]; limit: number; offset: number },
): Promise<{ items: ReviewItem[]; total: number }> {
  const rows = await db.query(
    `SELECT r.*, COALESCE(e.title || ' — ' || e.role, q.source->>'description') AS item_title
     FROM review_queue r
     LEFT JOIN exams e ON r.item_type = 'exam' AND e.id = r.item_id
     LEFT JOIN questions q ON r.item_type = 'question' AND q.id = r.item_id
     WHERE r.status = $1 ORDER BY r.priority ASC, r.created_at ASC LIMIT $2 OFFSET $3`,
    [filters.status, filters.limit, filters.offset],
  );
  const total = await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM review_queue WHERE status = $1`, [filters.status]);
  return { items: rows.map(mapReview), total: toNumber(total[0]?.n) };
}

export class ReviewActionError extends Error {}

/**
 * Aprovação/rejeição humana. Aprovar uma prova só é possível com gabarito oficial final
 * (definitivo ou único): uma aprovação nunca transforma gabarito preliminar em oficial.
 */
export async function resolveReview(
  db: SqlClient,
  input: { id: number; action: "approve" | "reject"; note: string; resolvedBy: string },
  now: Date,
): Promise<ReviewItem> {
  return db.transaction(async (tx) => {
    const rows = await tx.query(`SELECT * FROM review_queue WHERE id = $1 FOR UPDATE`, [input.id]);
    const row = rows[0];
    if (!row) throw new ReviewActionError("Item da fila não encontrado.");
    if (row.status !== "open") throw new ReviewActionError("Este item já foi resolvido.");
    const itemType = String(row.item_type);
    const itemId = String(row.item_id);
    const nowIso = now.toISOString();

    if (itemType === "exam") {
      const exams = await tx.query<{ answer_key_version: string }>(`SELECT answer_key_version FROM exams WHERE id = $1`, [itemId]);
      if (!exams[0]) throw new ReviewActionError("Prova não encontrada.");
      if (input.action === "approve") {
        if (exams[0].answer_key_version !== "definitivo" && exams[0].answer_key_version !== "oficial-unico") {
          throw new ReviewActionError("Não é possível aprovar: a prova ainda não tem gabarito oficial definitivo.");
        }
        await tx.query(
          `UPDATE exams SET publication_status = 'published', verification_status = 'verified_official',
             validated_at = COALESCE(validated_at, $2), published_at = COALESCE(published_at, $2), updated_at = $2 WHERE id = $1`,
          [itemId, nowIso],
        );
        await tx.query(
          `UPDATE questions SET publication_status = CASE WHEN verification_status = 'annulled' THEN 'annulled' ELSE 'published' END,
             verification_status = CASE WHEN verification_status = 'pending' THEN 'verified_official' ELSE verification_status END,
             published_at = COALESCE(published_at, $2), updated_at = $2
           WHERE exam_id = $1 AND verification_status <> 'rejected'`,
          [itemId, nowIso],
        );
      } else {
        await tx.query(`UPDATE exams SET publication_status = 'rejected', verification_status = 'rejected', updated_at = $2 WHERE id = $1`, [
          itemId,
          nowIso,
        ]);
        await tx.query(`UPDATE questions SET publication_status = 'rejected', updated_at = $2 WHERE exam_id = $1`, [itemId, nowIso]);
      }
    } else {
      if (input.action === "approve") {
        await tx.query(
          `UPDATE questions SET publication_status = 'published', published_at = COALESCE(published_at, $2), validated_at = COALESCE(validated_at, $2), updated_at = $2
           WHERE id = $1 AND verification_status IN ('verified_official','verified_authorized','practice_authored')`,
          [itemId, nowIso],
        );
      } else {
        await tx.query(`UPDATE questions SET publication_status = 'rejected', verification_status = 'rejected', updated_at = $2 WHERE id = $1`, [
          itemId,
          nowIso,
        ]);
      }
    }

    // A decisão vale para todas as pendências abertas do mesmo item.
    const status = input.action === "approve" ? "approved" : "rejected";
    await tx.query(
      `UPDATE review_queue SET status = $3, resolution_note = $4, resolved_by = $5, resolved_at = $6
       WHERE item_type = $1 AND item_id = $2 AND status = 'open'`,
      [itemType, itemId, status, input.note.slice(0, 500), input.resolvedBy, nowIso],
    );
    const updated = await tx.query(`SELECT * FROM review_queue WHERE id = $1`, [input.id]);
    return mapReview(updated[0]);
  });
}
