import { getSubject, topicName } from "@/data/subjects";
import type { Question } from "@/types/question";
import type { AnswerAttempt, PracticeFilters, PracticeProgress } from "@/types/study";
import { lastResultByQuestion } from "./history";
import { filterQuestions } from "./questions/bank";
import { shuffle, type RandomSource } from "./random";

export function practiceFilterKey(filters: PracticeFilters): string {
  return `${filters.subject}|${filters.topic}|${filters.difficulty}`;
}

export function practiceTitle(filters: PracticeFilters): string {
  const subject = getSubject(filters.subject).name;
  return filters.topic === "todos" ? `${subject} · Todos os assuntos` : `${subject} · ${topicName(filters.topic)}`;
}

export function practiceHref(filters: PracticeFilters): string {
  const params = new URLSearchParams({
    disciplina: filters.subject,
    assunto: filters.topic,
    dificuldade: filters.difficulty,
  });
  return `/praticar?${params.toString()}`;
}

/**
 * Ordem da lista de prática: primeiro as questões nunca feitas, depois as
 * que foram erradas da última vez e, por fim, as que já foram acertadas.
 */
export function buildPracticeOrder(
  questions: readonly Question[],
  attempts: readonly AnswerAttempt[],
  random: RandomSource = Math.random,
): Question[] {
  const last = lastResultByQuestion(attempts);
  const unseen = questions.filter((question) => !last.has(question.id));
  const missed = questions.filter((question) => last.get(question.id) === false);
  const mastered = questions.filter((question) => last.get(question.id) === true);
  return [...shuffle(unseen, random), ...shuffle(missed, random), ...shuffle(mastered, random)];
}

export function createPracticeProgress(
  bankQuestions: readonly Question[],
  filters: PracticeFilters,
  attempts: readonly AnswerAttempt[],
  now: Date,
  random: RandomSource = Math.random,
): PracticeProgress | null {
  const pool = filterQuestions(bankQuestions, filters);
  if (pool.length === 0) return null;
  const ordered = buildPracticeOrder(pool, attempts, random);
  return {
    filterKey: practiceFilterKey(filters),
    filters,
    questionIds: ordered.map((question) => question.id),
    currentIndex: 0,
    answers: {},
    startedAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export function isPracticeFinished(progress: PracticeProgress): boolean {
  return progress.currentIndex >= progress.questionIds.length;
}
