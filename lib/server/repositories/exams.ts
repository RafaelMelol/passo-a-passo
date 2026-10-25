import "server-only";
import type { BookletSection } from "@/lib/crawler/types";
import type { OptionLetter } from "@/types/question";
import type { SqlClient } from "../db/client";
import { jsonParam, toIso, toJson, toNumber } from "./util";

export type ExamPublicationStatus = "pending_validation" | "published" | "rejected" | "outdated";
export type ExamVerificationStatus = "pending" | "verified_official" | "verified_authorized" | "disputed" | "rejected";
export type QuestionVerificationStatus =
  | "pending"
  | "verified_official"
  | "verified_authorized"
  | "practice_authored"
  | "disputed"
  | "annulled"
  | "rejected";

export interface PersistQuestionInput {
  number: number;
  subject: string | null;
  topic: string | null;
  difficulty: "facil" | "medio" | "dificil";
  classificationMethod: string;
  classificationConfidence: number;
  difficultyMethod: string;
  difficultyConfidence: number;
  levelFlags: string[];
  correctOption: OptionLetter | null;
  /** Resposta no gabarito preliminar, quando conhecida e diferente da definitiva. */
  preliminaryOption?: OptionLetter | null;
  verificationStatus: QuestionVerificationStatus;
  statementHash: string | null;
  extractionConfidence: number;
  page: number | null;
  topicLabel: string | null;
}

export interface PersistExamInput {
  examId: string;
  sourceId: string;
  dedupeKey: string;
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
  bookletSha256: string | null;
  answerKeyUrl: string | null;
  answerKeySha256: string | null;
  answerKeyVersion: "nenhum" | "preliminar" | "definitivo" | "oficial-unico";
  sections: BookletSection[];
  reusePolicy: string;
  publicationStatus: ExamPublicationStatus;
  verificationStatus: ExamVerificationStatus;
  confidence: number;
  notes: string[];
  questions: PersistQuestionInput[];
}

export interface PersistExamResult {
  examId: string;
  created: boolean;
  questionsInserted: number;
  questionsUpdated: number;
  revisions: number;
  duplicates: number;
}

function questionPublicationStatus(examStatus: ExamPublicationStatus, verification: QuestionVerificationStatus) {
  if (examStatus === "rejected") return "rejected";
  if (verification === "annulled") return "annulled";
  if (examStatus === "published") return "published";
  return "pending_validation";
}

/**
 * Grava (ou atualiza) uma prova e suas questões numa transação.
 * - A chave `dedupe_key` e o par (prova, número) impedem duplicidade em novas execuções.
 * - Mudanças de gabarito ou de status geram uma revisão e aumentam a versão da questão.
 */
export async function persistExam(db: SqlClient, input: PersistExamInput, now: Date): Promise<PersistExamResult> {
  return db.transaction(async (tx) => {
    const nowIso = now.toISOString();
    const existing = await tx.query<{ id: string; publication_status: string }>(
      `SELECT id, publication_status FROM exams WHERE dedupe_key = $1`,
      [input.dedupeKey],
    );
    const created = existing.length === 0;
    const examId = existing[0]?.id ?? input.examId;
    const wasPublished = existing[0]?.publication_status === "published";
    const publishedAt = input.publicationStatus === "published" ? (wasPublished ? null : nowIso) : null;

    if (created) {
      await tx.query(
        `INSERT INTO exams (id, source_id, dedupe_key, title, exam_board, organization, role, education_level, year, exam_date,
           booklet_type, question_count, option_count, exam_page_url, booklet_url, booklet_sha256, answer_key_url, answer_key_sha256,
           answer_key_version, sections, reuse_policy, publication_status, verification_status, confidence, notes,
           discovered_at, validated_at, published_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20::jsonb,$21,$22,$23,$24,$25::jsonb,$26,$27,$28,$26)`,
        [
          examId, input.sourceId, input.dedupeKey, input.title, input.examBoard, input.organization, input.role, input.educationLevel,
          input.year, input.examDate, input.bookletType, input.questionCount, input.optionCount, input.examPageUrl, input.bookletUrl,
          input.bookletSha256, input.answerKeyUrl, input.answerKeySha256, input.answerKeyVersion, jsonParam(input.sections),
          input.reusePolicy, input.publicationStatus, input.verificationStatus, input.confidence, jsonParam(input.notes), nowIso,
          input.verificationStatus === "verified_official" ? nowIso : null, publishedAt,
        ],
      );
    } else {
      await tx.query(
        `UPDATE exams SET title = $2, organization = $3, role = $4, year = $5, exam_date = $6, question_count = $7, option_count = $8,
           booklet_url = $9, booklet_sha256 = $10, answer_key_url = $11, answer_key_sha256 = $12, answer_key_version = $13,
           sections = $14::jsonb, reuse_policy = $15, publication_status = $16, verification_status = $17, confidence = $18,
           notes = $19::jsonb, updated_at = $20,
           validated_at = CASE WHEN $17 = 'verified_official' THEN COALESCE(validated_at, $20) ELSE validated_at END,
           published_at = CASE WHEN $16 = 'published' THEN COALESCE(published_at, $20) ELSE published_at END
         WHERE id = $1`,
        [
          examId, input.title, input.organization, input.role, input.year, input.examDate, input.questionCount, input.optionCount,
          input.bookletUrl, input.bookletSha256, input.answerKeyUrl, input.answerKeySha256, input.answerKeyVersion,
          jsonParam(input.sections), input.reusePolicy, input.publicationStatus, input.verificationStatus, input.confidence,
          jsonParam(input.notes), nowIso,
        ],
      );
    }

    let questionsInserted = 0;
    let questionsUpdated = 0;
    let revisions = 0;
    let duplicates = 0;

    const currentRows = await tx.query<{ id: string; number: number; correct_option: string | null; verification_status: string; version: number }>(
      `SELECT id, number, correct_option, verification_status, version FROM questions WHERE exam_id = $1`,
      [examId],
    );
    const current = new Map(currentRows.map((row) => [toNumber(row.number), row]));

    for (const question of input.questions) {
      const id = `${examId}-q${question.number}`;
      const publication = questionPublicationStatus(input.publicationStatus, question.verificationStatus);
      const source = {
        description: `${input.title} — questão ${question.number}`,
        url: input.bookletUrl,
        examBoard: input.examBoard,
        exam: input.title,
        organization: input.organization,
        role: input.role,
        year: input.year,
        originalNumber: question.number,
        topicLabel: question.topicLabel,
      };

      // Mesma questão (mesmo enunciado normalizado) já vista em outra prova: guarda o vínculo com a canônica.
      let duplicateOf: string | null = null;
      if (question.statementHash) {
        const dup = await tx.query<{ id: string }>(
          `SELECT id FROM questions WHERE statement_hash = $1 AND (exam_id IS DISTINCT FROM $2) AND duplicate_of IS NULL
           ORDER BY discovered_at ASC LIMIT 1`,
          [question.statementHash, examId],
        );
        if (dup[0]) {
          duplicateOf = dup[0].id;
          duplicates++;
        }
      }

      const existingQuestion = current.get(question.number);
      if (!existingQuestion) {
        const changedFromPreliminary =
          question.preliminaryOption !== undefined && question.preliminaryOption !== question.correctOption;
        const version = changedFromPreliminary ? 2 : 1;
        await tx.query(
          `INSERT INTO questions (id, exam_id, number, subject, topic, difficulty, classification_method, classification_confidence,
             difficulty_method, difficulty_confidence, level_flags, correct_option, content_type, text_storage, verification_status,
             publication_status, statement_hash, extraction_confidence, source, page, version, duplicate_of, discovered_at,
             validated_at, published_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,'oficial','link-only',$13,$14,$15,$16,$17::jsonb,$18,$19,$20,$21,$22,$23,$21)`,
          [
            id, examId, question.number, question.subject, question.topic, question.difficulty, question.classificationMethod,
            question.classificationConfidence, question.difficultyMethod, question.difficultyConfidence, jsonParam(question.levelFlags),
            question.correctOption, question.verificationStatus, publication, question.statementHash, question.extractionConfidence,
            jsonParam(source), question.page, version, duplicateOf, nowIso,
            question.verificationStatus === "verified_official" || question.verificationStatus === "annulled" ? nowIso : null,
            publication === "published" ? nowIso : null,
          ],
        );
        questionsInserted++;
        if (changedFromPreliminary) {
          await tx.query(
            `INSERT INTO question_revisions (question_id, from_version, to_version, field, previous_value, new_value, reason, source_url, created_at)
             VALUES ($1, 1, 2, 'correct_option', $2::jsonb, $3::jsonb, $4, $5, $6)`,
            [
              id,
              jsonParam(question.preliminaryOption),
              jsonParam(question.correctOption),
              question.correctOption === null ? "Questão anulada no gabarito definitivo" : "Gabarito definitivo diferente do preliminar",
              input.answerKeyUrl,
              nowIso,
            ],
          );
          revisions++;
        }
        continue;
      }

      // Questão já existente: registra revisões apenas quando o gabarito ou o status mudam.
      const changes: { field: string; previous: unknown; next: unknown; reason: string }[] = [];
      if ((existingQuestion.correct_option ?? null) !== question.correctOption) {
        changes.push({
          field: "correct_option",
          previous: existingQuestion.correct_option ?? null,
          next: question.correctOption,
          reason: question.correctOption === null ? "Questão anulada pela banca" : "Alteração do gabarito oficial",
        });
      }
      if (existingQuestion.verification_status !== question.verificationStatus) {
        changes.push({
          field: "verification_status",
          previous: existingQuestion.verification_status,
          next: question.verificationStatus,
          reason: "Atualização do estado de verificação",
        });
      }
      const fromVersion = toNumber(existingQuestion.version, 1);
      const toVersion = changes.length > 0 ? fromVersion + 1 : fromVersion;
      for (const change of changes) {
        await tx.query(
          `INSERT INTO question_revisions (question_id, from_version, to_version, field, previous_value, new_value, reason, source_url, created_at)
           VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8,$9)`,
          [existingQuestion.id, fromVersion, toVersion, change.field, jsonParam(change.previous), jsonParam(change.next), change.reason, input.answerKeyUrl, nowIso],
        );
        revisions++;
      }
      await tx.query(
        `UPDATE questions SET subject = $2, topic = $3, difficulty = $4, classification_method = $5, classification_confidence = $6,
           difficulty_method = $7, difficulty_confidence = $8, level_flags = $9::jsonb, correct_option = $10, verification_status = $11,
           publication_status = $12, statement_hash = COALESCE($13, statement_hash), extraction_confidence = $14, source = $15::jsonb,
           page = $16, version = $17, duplicate_of = COALESCE(duplicate_of, $18), updated_at = $19,
           validated_at = CASE WHEN $11 IN ('verified_official','annulled') THEN COALESCE(validated_at, $19) ELSE validated_at END,
           published_at = CASE WHEN $12 = 'published' THEN COALESCE(published_at, $19) ELSE published_at END
         WHERE id = $1`,
        [
          existingQuestion.id, question.subject, question.topic, question.difficulty, question.classificationMethod,
          question.classificationConfidence, question.difficultyMethod, question.difficultyConfidence, jsonParam(question.levelFlags),
          question.correctOption, question.verificationStatus, publication, question.statementHash, question.extractionConfidence,
          jsonParam(source), question.page, toVersion, duplicateOf, nowIso,
        ],
      );
      if (changes.length > 0) questionsUpdated++;
    }

    return { examId, created, questionsInserted, questionsUpdated, revisions, duplicates };
  });
}

export interface ExamRow {
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
  reusePolicy: string;
  publicationStatus: string;
  verificationStatus: string;
  confidence: number;
  notes: string[];
  discoveredAt: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
}

export function mapExam(row: Record<string, unknown>): ExamRow {
  return {
    id: String(row.id),
    sourceId: String(row.source_id),
    title: String(row.title),
    examBoard: String(row.exam_board),
    organization: (row.organization as string | null) ?? null,
    role: String(row.role),
    educationLevel: String(row.education_level),
    year: row.year === null || row.year === undefined ? null : toNumber(row.year),
    examDate: (row.exam_date as string | null) ?? null,
    bookletType: String(row.booklet_type),
    questionCount: toNumber(row.question_count),
    optionCount: toNumber(row.option_count),
    examPageUrl: String(row.exam_page_url),
    bookletUrl: String(row.booklet_url),
    answerKeyUrl: (row.answer_key_url as string | null) ?? null,
    answerKeyVersion: String(row.answer_key_version),
    sections: toJson<BookletSection[]>(row.sections, []),
    reusePolicy: String(row.reuse_policy),
    publicationStatus: String(row.publication_status),
    verificationStatus: String(row.verification_status),
    confidence: toNumber(row.confidence),
    notes: toJson<string[]>(row.notes, []),
    discoveredAt: toIso(row.discovered_at),
    publishedAt: toIso(row.published_at),
    updatedAt: toIso(row.updated_at),
  };
}

export async function getExam(db: SqlClient, id: string): Promise<ExamRow | null> {
  const rows = await db.query(`SELECT * FROM exams WHERE id = $1`, [id]);
  return rows[0] ? mapExam(rows[0]) : null;
}

export interface ExamQuestionRow {
  id: string;
  number: number;
  subject: string | null;
  topic: string | null;
  topicLabel: string | null;
  difficulty: string | null;
  correctOption: OptionLetter | null;
  verificationStatus: QuestionVerificationStatus;
  publicationStatus: string;
  version: number;
  levelFlags: string[];
}

export async function getExamQuestions(db: SqlClient, examId: string): Promise<ExamQuestionRow[]> {
  const rows = await db.query(
    `SELECT id, number, subject, topic, difficulty, correct_option, verification_status, publication_status, version, level_flags, source
     FROM questions WHERE exam_id = $1 ORDER BY number`,
    [examId],
  );
  return rows.map((row) => ({
    id: String(row.id),
    number: toNumber(row.number),
    subject: (row.subject as string | null) ?? null,
    topic: (row.topic as string | null) ?? null,
    topicLabel: toJson<{ topicLabel?: string | null }>(row.source, {}).topicLabel ?? null,
    difficulty: (row.difficulty as string | null) ?? null,
    correctOption: (row.correct_option as OptionLetter | null) ?? null,
    verificationStatus: String(row.verification_status) as QuestionVerificationStatus,
    publicationStatus: String(row.publication_status),
    version: toNumber(row.version, 1),
    levelFlags: toJson<string[]>(row.level_flags, []),
  }));
}

export async function listRevisions(db: SqlClient, examId: string) {
  const rows = await db.query(
    `SELECT r.* FROM question_revisions r JOIN questions q ON q.id = r.question_id WHERE q.exam_id = $1 ORDER BY r.id`,
    [examId],
  );
  return rows.map((row) => ({
    questionId: String(row.question_id),
    fromVersion: toNumber(row.from_version),
    toVersion: toNumber(row.to_version),
    field: String(row.field),
    // Os drivers já entregam o JSONB convertido (inclusive textos simples como "C").
    previousValue: row.previous_value ?? null,
    newValue: row.new_value ?? null,
    reason: String(row.reason),
    sourceUrl: (row.source_url as string | null) ?? null,
    createdAt: toIso(row.created_at),
  }));
}
