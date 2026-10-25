import { isDifficulty, isSubjectId, isTopicId } from "@/data/subjects";
import { OPTION_LETTERS, type OptionLetter } from "@/types/question";
import type {
  AnswerAttempt,
  LastActivity,
  OfficialExamAttempt,
  OfficialExamDraft,
  PracticeProgress,
  ScoreSummary,
  SimuladoConfig,
  SimuladoItemResult,
  SimuladoResult,
  SimuladoSession,
  StudyData,
} from "@/types/study";
import { MAX_ATTEMPTS, MAX_OFFICIAL_ATTEMPTS, MAX_SIMULADOS } from "./history";

/**
 * Persistência no localStorage.
 * Tudo que é lido do navegador é tratado como "desconhecido" e conferido
 * campo a campo: dados corrompidos ou de versões antigas nunca quebram o site.
 */

export const STORAGE_KEY = "passo-a-passo:dados:v1";

export function createEmptyStudyData(): StudyData {
  return {
    version: 1,
    attempts: [],
    practice: null,
    activeSimulado: null,
    simulados: [],
    officialDrafts: {},
    officialAttempts: [],
    lastActivity: null,
    settings: { name: "" },
  };
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isString(value: unknown): value is string {
  return typeof value === "string";
}
function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
function isIsoDate(value: unknown): value is string {
  return isString(value) && !Number.isNaN(Date.parse(value));
}
function isOptionLetter(value: unknown): value is OptionLetter {
  return OPTION_LETTERS.includes(value as OptionLetter);
}
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function parseAnswers(value: unknown): Record<string, OptionLetter> {
  if (!isRecord(value)) return {};
  const answers: Record<string, OptionLetter> = {};
  for (const [key, letter] of Object.entries(value)) {
    if (isOptionLetter(letter)) answers[key] = letter;
  }
  return answers;
}

function parseAttempt(value: unknown): AnswerAttempt | null {
  if (!isRecord(value)) return null;
  const { questionId, subject, topic, difficulty, selected, isCorrect, answeredAt, mode, questionVersion } = value;
  if (
    isString(questionId) &&
    isSubjectId(subject) &&
    isTopicId(topic) &&
    isDifficulty(difficulty) &&
    isOptionLetter(selected) &&
    typeof isCorrect === "boolean" &&
    isIsoDate(answeredAt) &&
    (mode === "pratica" || mode === "simulado")
  ) {
    return {
      questionId,
      subject,
      topic,
      difficulty,
      selected,
      isCorrect,
      answeredAt,
      mode,
      ...(isNumber(questionVersion) && questionVersion >= 1 ? { questionVersion: Math.floor(questionVersion) } : {}),
    };
  }
  return null;
}

function parseScore(value: unknown): ScoreSummary | null {
  if (!isRecord(value)) return null;
  const { total, answered, correct, wrong, blank, percentage } = value;
  if ([total, answered, correct, wrong, blank, percentage].every(isNumber)) {
    return value as unknown as ScoreSummary;
  }
  return null;
}

function parseSimuladoConfig(value: unknown): SimuladoConfig | null {
  if (!isRecord(value)) return null;
  const { questionCount, subjects, difficulty, timerEnabled } = value;
  if (
    isNumber(questionCount) &&
    Array.isArray(subjects) &&
    subjects.every(isSubjectId) &&
    (difficulty === "todas" || isDifficulty(difficulty)) &&
    typeof timerEnabled === "boolean"
  ) {
    return { questionCount, subjects, difficulty, timerEnabled };
  }
  return null;
}

function parseSimuladoSession(value: unknown): SimuladoSession | null {
  if (!isRecord(value)) return null;
  const config = parseSimuladoConfig(value.config);
  const { id, questionIds, currentIndex, startedAt, elapsedMs } = value;
  if (!config || !isString(id) || !isStringArray(questionIds) || questionIds.length === 0) return null;
  if (!isNumber(currentIndex) || !isIsoDate(startedAt) || !isNumber(elapsedMs)) return null;
  return {
    id,
    config,
    questionIds,
    answers: parseAnswers(value.answers),
    currentIndex: Math.min(Math.max(0, Math.floor(currentIndex)), questionIds.length - 1),
    startedAt,
    elapsedMs: Math.max(0, elapsedMs),
  };
}

function parseSimuladoItem(value: unknown): SimuladoItemResult | null {
  if (!isRecord(value)) return null;
  const { questionId, subject, topic, selected, correctOption, isCorrect } = value;
  if (
    isString(questionId) &&
    isSubjectId(subject) &&
    isTopicId(topic) &&
    (selected === null || isOptionLetter(selected)) &&
    isOptionLetter(correctOption) &&
    typeof isCorrect === "boolean"
  ) {
    return { questionId, subject, topic, selected, correctOption, isCorrect };
  }
  return null;
}

function parseSimuladoResult(value: unknown): SimuladoResult | null {
  if (!isRecord(value)) return null;
  const config = parseSimuladoConfig(value.config);
  const score = parseScore(value.score);
  const { id, startedAt, finishedAt, durationMs, items, topicsToReview } = value;
  if (!config || !score || !isString(id) || !isIsoDate(startedAt) || !isIsoDate(finishedAt) || !isNumber(durationMs)) {
    return null;
  }
  if (!Array.isArray(items)) return null;
  const parsedItems = items.map(parseSimuladoItem).filter((item): item is SimuladoItemResult => item !== null);
  const reviews = Array.isArray(topicsToReview)
    ? topicsToReview.filter(
        (review): review is SimuladoResult["topicsToReview"][number] =>
          isRecord(review) && isSubjectId(review.subject) && isTopicId(review.topic) && isNumber(review.wrong) && isNumber(review.total),
      )
    : [];
  return { id, config, startedAt, finishedAt, durationMs, items: parsedItems, score, topicsToReview: reviews };
}

function parsePractice(value: unknown): PracticeProgress | null {
  if (!isRecord(value) || !isRecord(value.filters)) return null;
  const { subject, topic, difficulty, origin } = value.filters;
  const { filterKey, questionIds, currentIndex, startedAt, updatedAt } = value;
  if (!isSubjectId(subject) || !(topic === "todos" || isTopicId(topic)) || !(difficulty === "todas" || isDifficulty(difficulty))) {
    return null;
  }
  if (!isString(filterKey) || !isStringArray(questionIds) || !isNumber(currentIndex) || !isIsoDate(startedAt) || !isIsoDate(updatedAt)) {
    return null;
  }
  return {
    filterKey,
    filters: { subject, topic, difficulty, ...(origin === "oficiais" || origin === "pratica" ? { origin } : {}) },
    questionIds,
    currentIndex: Math.min(Math.max(0, Math.floor(currentIndex)), questionIds.length),
    answers: parseAnswers(value.answers),
    startedAt,
    updatedAt,
  };
}

function parseOfficialDrafts(value: unknown): Record<string, OfficialExamDraft> {
  if (!isRecord(value)) return {};
  const drafts: Record<string, OfficialExamDraft> = {};
  for (const [key, draft] of Object.entries(value)) {
    if (isRecord(draft) && isString(draft.examId) && isStringArray(draft.sectionIds) && isIsoDate(draft.updatedAt)) {
      drafts[key] = {
        examId: draft.examId,
        sectionIds: draft.sectionIds,
        answers: parseAnswers(draft.answers),
        updatedAt: draft.updatedAt,
      };
    }
  }
  return drafts;
}

function parseOfficialAttempt(value: unknown): OfficialExamAttempt | null {
  if (!isRecord(value)) return null;
  const score = parseScore(value.score);
  const { id, examId, sectionIds, finishedAt } = value;
  if (!score || !isString(id) || !isString(examId) || !isStringArray(sectionIds) || !isIsoDate(finishedAt)) return null;
  return { id, examId, sectionIds, answers: parseAnswers(value.answers), finishedAt, score };
}

function parseLastActivity(value: unknown): LastActivity | null {
  if (!isRecord(value)) return null;
  const { kind, title, href, at } = value;
  if ((kind === "pratica" || kind === "simulado" || kind === "prova-oficial") && isString(title) && isString(href) && href.startsWith("/") && isIsoDate(at)) {
    return { kind, title, href, at };
  }
  return null;
}

function parseList<T>(value: unknown, parser: (item: unknown) => T | null, max: number): T[] {
  if (!Array.isArray(value)) return [];
  const parsed = value.map(parser).filter((item): item is T => item !== null);
  return parsed.length > max ? parsed.slice(parsed.length - max) : parsed;
}

/** Converte qualquer valor lido do armazenamento em dados válidos (descartando o que estiver errado). */
export function parseStudyData(raw: unknown): StudyData {
  if (!isRecord(raw) || raw.version !== 1) return createEmptyStudyData();
  const settings = isRecord(raw.settings) && isString(raw.settings.name) ? { name: raw.settings.name.slice(0, 60) } : { name: "" };
  return {
    version: 1,
    attempts: parseList(raw.attempts, parseAttempt, MAX_ATTEMPTS),
    practice: parsePractice(raw.practice),
    activeSimulado: parseSimuladoSession(raw.activeSimulado),
    simulados: parseList(raw.simulados, parseSimuladoResult, MAX_SIMULADOS),
    officialDrafts: parseOfficialDrafts(raw.officialDrafts),
    officialAttempts: parseList(raw.officialAttempts, parseOfficialAttempt, MAX_OFFICIAL_ATTEMPTS),
    lastActivity: parseLastActivity(raw.lastActivity),
    settings,
  };
}

export type LoadWarning = "corrompido" | "indisponivel";

export interface LoadResult {
  data: StudyData;
  warning: LoadWarning | null;
}

/** Acesso seguro ao localStorage: no servidor ou com o armazenamento bloqueado, devolve null. */
export function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadStudyData(storage: Storage | null): LoadResult {
  if (!storage) return { data: createEmptyStudyData(), warning: "indisponivel" };
  let text: string | null;
  try {
    text = storage.getItem(STORAGE_KEY);
  } catch {
    return { data: createEmptyStudyData(), warning: "indisponivel" };
  }
  if (text === null) return { data: createEmptyStudyData(), warning: null };
  try {
    return { data: parseStudyData(JSON.parse(text)), warning: null };
  } catch {
    return { data: createEmptyStudyData(), warning: "corrompido" };
  }
}

export type SaveError = "sem-espaco" | "indisponivel";

export function saveStudyData(storage: Storage | null, data: StudyData): { ok: true } | { ok: false; error: SaveError } {
  if (!storage) return { ok: false, error: "indisponivel" };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { ok: true };
  } catch (error) {
    const isQuota = error instanceof DOMException && (error.name === "QuotaExceededError" || error.code === 22);
    return { ok: false, error: isQuota ? "sem-espaco" : "indisponivel" };
  }
}

/** Cópia de segurança em JSON, para guardar ou levar para outro aparelho. */
export function exportStudyData(data: StudyData, now: Date): string {
  return JSON.stringify({ app: "passo-a-passo", exportedAt: now.toISOString(), data }, null, 2);
}

export function importStudyData(text: string): { ok: true; data: StudyData } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "O arquivo não é uma cópia de segurança válida." };
  }
  if (!isRecord(parsed) || parsed.app !== "passo-a-passo" || !isRecord(parsed.data) || parsed.data.version !== 1) {
    return { ok: false, error: "Este arquivo não parece ser uma cópia de segurança deste site." };
  }
  return { ok: true, data: parseStudyData(parsed.data) };
}
