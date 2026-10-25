import "server-only";
import type { BookletSection } from "@/lib/crawler/types";
import type { OptionLetter, Question } from "@/types/question";
import type { SqlClient } from "../db/client";
import { mapExam } from "./exams";
import { toIso, toJson, toNumber } from "./util";

/** Dados públicos de uma prova publicada (sem gabarito). */
export interface PublicExam {
  id: string;
  sourceId: string;
  title: string;
  examBoard: string;
  organization: string | null;
  role: string;
  educationLevel: string;
  year: number | null;
  examDate: string | null;
  bookletType: string;
  questionCount: number;
  optionCount: number;
  examPageUrl: string;
  bookletUrl: string;
  answerKeyUrl: string | null;
  answerKeyVersion: string;
  sections: BookletSection[];
  notes: string[];
  annulled: number[];
  publishedAt: string | null;
}

async function annulledByExam(db: SqlClient, examIds: readonly string[]): Promise<Map<string, number[]>> {
  const map = new Map<string, number[]>();
  if (examIds.length === 0) return map;
  const rows = await db.query<{ exam_id: string; number: number }>(
    `SELECT exam_id, number FROM questions WHERE exam_id = ANY($1::text[]) AND verification_status = 'annulled' ORDER BY number`,
    [[...examIds]],
  );
  for (const row of rows) {
    const list = map.get(row.exam_id) ?? [];
    list.push(toNumber(row.number));
    map.set(row.exam_id, list);
  }
  return map;
}

function toPublic(row: Record<string, unknown>, annulled: number[]): PublicExam {
  const exam = mapExam(row);
  return {
    id: exam.id,
    sourceId: exam.sourceId,
    title: exam.title,
    examBoard: exam.examBoard,
    organization: exam.organization,
    role: exam.role,
    educationLevel: exam.educationLevel,
    year: exam.year,
    examDate: exam.examDate,
    bookletType: exam.bookletType,
    questionCount: exam.questionCount,
    optionCount: exam.optionCount,
    examPageUrl: exam.examPageUrl,
    bookletUrl: exam.bookletUrl,
    answerKeyUrl: exam.answerKeyUrl,
    answerKeyVersion: exam.answerKeyVersion,
    sections: exam.sections,
    notes: exam.notes,
    annulled,
    publishedAt: exam.publishedAt,
  };
}

export async function listPublishedExams(
  db: SqlClient,
  filters: { examBoard?: string; year?: number; recentDays?: number; limit: number; offset: number },
  now: Date,
): Promise<{ items: PublicExam[]; total: number }> {
  const since = filters.recentDays ? new Date(now.getTime() - filters.recentDays * 86_400_000).toISOString() : null;
  const where = `publication_status = 'published' AND verification_status IN ('verified_official','verified_authorized')
    AND ($1::text IS NULL OR exam_board = $1) AND ($2::int IS NULL OR year = $2) AND ($3::timestamptz IS NULL OR published_at >= $3)`;
  const params = [filters.examBoard ?? null, filters.year ?? null, since];
  const rows = await db.query(`SELECT * FROM exams WHERE ${where} ORDER BY year DESC NULLS LAST, published_at DESC LIMIT $4 OFFSET $5`, [
    ...params,
    filters.limit,
    filters.offset,
  ]);
  const total = await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM exams WHERE ${where}`, params);
  const annulled = await annulledByExam(db, rows.map((row) => String(row.id)));
  return { items: rows.map((row) => toPublic(row, annulled.get(String(row.id)) ?? [])), total: toNumber(total[0]?.n) };
}

export async function getPublishedExam(db: SqlClient, id: string): Promise<PublicExam | null> {
  const rows = await db.query(
    `SELECT * FROM exams WHERE id = $1 AND publication_status = 'published' AND verification_status IN ('verified_official','verified_authorized')`,
    [id],
  );
  if (!rows[0]) return null;
  const annulled = await annulledByExam(db, [id]);
  return toPublic(rows[0], annulled.get(id) ?? []);
}

/** Gabarito de uma prova publicada — usado só no servidor, para corrigir o cartão-resposta. */
export async function getPublishedAnswerKey(
  db: SqlClient,
  examId: string,
): Promise<{ number: number; answer: OptionLetter | null; status: "valida" | "anulada"; topic: string | null; topicLabel: string | null }[]> {
  const rows = await db.query(
    `SELECT number, correct_option, verification_status, topic, source FROM questions
     WHERE exam_id = $1 AND publication_status IN ('published','annulled') ORDER BY number`,
    [examId],
  );
  return rows.map((row) => ({
    number: toNumber(row.number),
    answer: (row.correct_option as OptionLetter | null) ?? null,
    status: row.verification_status === "annulled" ? "anulada" : "valida",
    topic: (row.topic as string | null) ?? null,
    topicLabel: toJson<{ topicLabel?: string | null }>(row.source, {}).topicLabel ?? null,
  }));
}

/** Questões publicadas com texto integral autorizado, no mesmo formato usado pela área de estudos. */
export async function listPublishedQuestions(
  db: SqlClient,
  filters: {
    subject?: string;
    topic?: string;
    difficulty?: string;
    contentType?: "oficial" | "pratica-autoral";
    examBoard?: string;
    year?: number;
    recentDays?: number;
    limit: number;
    offset: number;
  },
  now: Date,
): Promise<{ items: (Question & { version: number; publishedAt: string | null })[]; total: number }> {
  const since = filters.recentDays ? new Date(now.getTime() - filters.recentDays * 86_400_000).toISOString() : null;
  const where = `text_storage = 'full' AND publication_status = 'published'
    AND verification_status IN ('verified_official','verified_authorized','practice_authored')
    AND statement IS NOT NULL AND options IS NOT NULL AND correct_option IS NOT NULL
    AND ($1::text IS NULL OR subject = $1) AND ($2::text IS NULL OR topic = $2) AND ($3::text IS NULL OR difficulty = $3)
    AND ($4::text IS NULL OR content_type = $4) AND ($5::text IS NULL OR source->>'examBoard' = $5)
    AND ($6::int IS NULL OR (source->>'year')::int = $6) AND ($7::timestamptz IS NULL OR published_at >= $7)`;
  const params = [
    filters.subject ?? null,
    filters.topic ?? null,
    filters.difficulty ?? null,
    filters.contentType ?? null,
    filters.examBoard ?? null,
    filters.year ?? null,
    since,
  ];
  const rows = await db.query(`SELECT * FROM questions WHERE ${where} ORDER BY published_at DESC, id LIMIT $8 OFFSET $9`, [
    ...params,
    filters.limit,
    filters.offset,
  ]);
  const total = await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM questions WHERE ${where}`, params);
  const items = rows.map((row) => {
    // A consulta só traz itens verificados: oficial conferido, reutilização autorizada ou prática revisada.
    const source = toJson<Question["source"] & { topicLabel?: string; authorization?: string; importedBy?: string }>(row.source, {
      description: "",
    });
    const cleanSource: Question["source"] = {
      description: source.description,
      ...(source.url ? { url: source.url } : {}),
      ...(source.examBoard ? { examBoard: source.examBoard } : {}),
      ...(source.exam ? { exam: source.exam } : {}),
      ...(source.organization ? { organization: source.organization } : {}),
      ...(source.role ? { role: source.role } : {}),
      ...(source.year ? { year: source.year } : {}),
      ...(source.originalNumber ? { originalNumber: source.originalNumber } : {}),
    };
    return {
      id: String(row.id),
      subject: String(row.subject) as Question["subject"],
      topic: String(row.topic) as Question["topic"],
      difficulty: String(row.difficulty) as Question["difficulty"],
      statement: String(row.statement),
      ...(row.support_text ? { supportText: toJson<Question["supportText"]>(row.support_text, undefined) } : {}),
      options: toJson<Question["options"]>(row.options, []),
      correctOption: String(row.correct_option) as OptionLetter,
      explanation: toJson<Question["explanation"]>(row.explanation, { summary: "" }),
      contentType: String(row.content_type) as Question["contentType"],
      source: cleanSource,
      verification: {
        statement: "verificada" as const,
        answerKey: "verificada" as const,
        ...(toIso(row.validated_at) ? { checkedAt: toIso(row.validated_at)!.slice(0, 10) } : {}),
      },
      version: toNumber(row.version, 1),
      publishedAt: toIso(row.published_at),
    };
  });
  return { items, total: toNumber(total[0]?.n) };
}

export async function getPublicFilters(db: SqlClient) {
  const topics = await db.query<{ subject: string; topic: string; difficulty: string; n: number }>(
    `SELECT subject, topic, difficulty, count(*)::int AS n FROM questions
     WHERE text_storage = 'full' AND publication_status = 'published' GROUP BY subject, topic, difficulty ORDER BY subject, topic`,
  );
  const boards = await db.query<{ exam_board: string; n: number }>(
    `SELECT exam_board, count(*)::int AS n FROM exams WHERE publication_status = 'published' GROUP BY exam_board ORDER BY exam_board`,
  );
  const years = await db.query<{ year: number; n: number }>(
    `SELECT year, count(*)::int AS n FROM exams WHERE publication_status = 'published' AND year IS NOT NULL GROUP BY year ORDER BY year DESC`,
  );
  return {
    questionTopics: topics.map((row) => ({ subject: row.subject, topic: row.topic, difficulty: row.difficulty, count: toNumber(row.n) })),
    examBoards: boards.map((row) => ({ value: row.exam_board, count: toNumber(row.n) })),
    years: years.map((row) => ({ value: toNumber(row.year), count: toNumber(row.n) })),
  };
}

export async function getUpdateStatus(db: SqlClient, now: Date) {
  const last = await db.query<{ finished_at: Date | string; status: string }>(
    `SELECT finished_at, status FROM crawl_runs WHERE status IN ('succeeded','partial') AND finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 1`,
  );
  const since = new Date(now.getTime() - 7 * 86_400_000).toISOString();
  const counts = await db.query<{ exams: number; new_exams: number; questions: number; new_questions: number }>(
    `SELECT
       (SELECT count(*)::int FROM exams WHERE publication_status = 'published') AS exams,
       (SELECT count(*)::int FROM exams WHERE publication_status = 'published' AND published_at >= $1) AS new_exams,
       (SELECT count(*)::int FROM questions WHERE text_storage = 'full' AND publication_status = 'published') AS questions,
       (SELECT count(*)::int FROM questions WHERE text_storage = 'full' AND publication_status = 'published' AND published_at >= $1) AS new_questions`,
    [since],
  );
  const row = counts[0];
  return {
    lastSuccessfulUpdateAt: last[0] ? toIso(last[0].finished_at) : null,
    publishedExams: toNumber(row?.exams),
    newExamsLast7Days: toNumber(row?.new_exams),
    publishedQuestions: toNumber(row?.questions),
    newQuestionsLast7Days: toNumber(row?.new_questions),
  };
}

export async function listRecentUpdates(db: SqlClient, limit: number) {
  const exams = await db.query(
    `SELECT id, title, role, exam_board, year, published_at FROM exams WHERE publication_status = 'published'
     ORDER BY published_at DESC NULLS LAST LIMIT $1`,
    [limit],
  );
  return exams.map((row) => ({
    type: "exam" as const,
    id: String(row.id),
    title: `${String(row.title)}`,
    role: String(row.role),
    examBoard: String(row.exam_board),
    year: row.year === null ? null : toNumber(row.year),
    publishedAt: toIso(row.published_at),
  }));
}
