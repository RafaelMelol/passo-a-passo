import type { Question } from "@/types/question";

/**
 * Leitura de questões vindas de JSON (importação manual estruturada).
 * Aqui conferimos apenas os tipos dos campos; a coerência do conteúdo
 * é conferida depois por validateQuestion().
 */

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === "string";
}

function isOptionalNumber(value: unknown): boolean {
  return value === undefined || (typeof value === "number" && Number.isFinite(value));
}

function describeShapeProblem(item: unknown): string | null {
  if (!isRecord(item)) return "não é um objeto";
  const required = ["id", "subject", "topic", "difficulty", "statement", "correctOption", "contentType"];
  for (const key of required) {
    if (typeof item[key] !== "string") return `campo "${key}" ausente ou não é texto`;
  }
  if (!Array.isArray(item.options)) return 'campo "options" deve ser uma lista';
  for (const option of item.options) {
    if (!isRecord(option) || typeof option.letter !== "string" || typeof option.text !== "string") {
      return "alternativa sem letra ou texto";
    }
    if (!isOptionalString(option.whyWrong)) return 'campo "whyWrong" deve ser texto';
  }
  const explanation = item.explanation;
  if (!isRecord(explanation) || typeof explanation.summary !== "string") return 'falta "explanation.summary"';
  if (explanation.steps !== undefined && !(Array.isArray(explanation.steps) && explanation.steps.every((s) => typeof s === "string"))) {
    return '"explanation.steps" deve ser uma lista de textos';
  }
  if (!isOptionalString(explanation.tip)) return '"explanation.tip" deve ser texto';

  if (item.supportText !== undefined) {
    const support = item.supportText;
    if (!isRecord(support) || typeof support.body !== "string") return '"supportText.body" deve ser texto';
    if (!isOptionalString(support.title) || !isOptionalString(support.credit)) return "texto de apoio com campos inválidos";
  }

  const source = item.source;
  if (!isRecord(source) || typeof source.description !== "string") return 'falta "source.description"';
  for (const key of ["url", "examBoard", "exam", "organization", "role"]) {
    if (!isOptionalString(source[key])) return `"source.${key}" deve ser texto`;
  }
  if (!isOptionalNumber(source.year) || !isOptionalNumber(source.originalNumber)) {
    return '"source.year" e "source.originalNumber" devem ser números';
  }

  const verification = item.verification;
  if (!isRecord(verification) || typeof verification.statement !== "string" || typeof verification.answerKey !== "string") {
    return 'falta "verification.statement" ou "verification.answerKey"';
  }
  if (!isOptionalString(verification.checkedAt) || !isOptionalString(verification.notes)) {
    return "dados de verificação inválidos";
  }
  return null;
}

export interface ParsedQuestionList {
  questions: Question[];
  errors: string[];
}

export function parseQuestionList(raw: unknown): ParsedQuestionList {
  if (!Array.isArray(raw)) {
    return { questions: [], errors: ["O arquivo de questões deve conter uma lista (array)."] };
  }
  const questions: Question[] = [];
  const errors: string[] = [];
  raw.forEach((item, index) => {
    const problem = describeShapeProblem(item);
    if (problem) {
      const id = isRecord(item) && typeof item.id === "string" ? item.id : `posição ${index}`;
      errors.push(`Questão ${id}: ${problem}.`);
    } else {
      // Os tipos foram conferidos campo a campo acima.
      questions.push(item as unknown as Question);
    }
  });
  return { questions, errors };
}
