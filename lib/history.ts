import { SUBJECTS } from "@/data/subjects";
import type { SubjectId, TopicId } from "@/types/question";
import type { AnswerAttempt, StudyData } from "@/types/study";
import { percentage } from "./grading";

/** Limite para o histórico não crescer sem fim no navegador. */
export const MAX_ATTEMPTS = 10_000;
export const MAX_SIMULADOS = 100;
export const MAX_OFFICIAL_ATTEMPTS = 50;

export function recordAttempts(data: StudyData, attempts: readonly AnswerAttempt[]): StudyData {
  if (attempts.length === 0) return data;
  const all = [...data.attempts, ...attempts];
  return { ...data, attempts: all.length > MAX_ATTEMPTS ? all.slice(all.length - MAX_ATTEMPTS) : all };
}

export function recordAttempt(data: StudyData, attempt: AnswerAttempt): StudyData {
  return recordAttempts(data, [attempt]);
}

export interface PerformanceStats {
  answered: number;
  correct: number;
  wrong: number;
  percentage: number;
}

function toStats(answered: number, correct: number): PerformanceStats {
  return { answered, correct, wrong: answered - correct, percentage: percentage(correct, answered) };
}

export function overallStats(attempts: readonly AnswerAttempt[]): PerformanceStats {
  return toStats(attempts.length, attempts.filter((attempt) => attempt.isCorrect).length);
}

export function statsBySubject(attempts: readonly AnswerAttempt[]): Record<SubjectId, PerformanceStats> {
  const entries = SUBJECTS.map((subject) => {
    const own = attempts.filter((attempt) => attempt.subject === subject.id);
    return [subject.id, overallStats(own)] as const;
  });
  return Object.fromEntries(entries) as Record<SubjectId, PerformanceStats>;
}

export interface TopicStats extends PerformanceStats {
  subject: SubjectId;
  topic: TopicId;
  /** Se a última resposta neste assunto foi errada. */
  lastWasWrong: boolean;
}

export function statsByTopic(attempts: readonly AnswerAttempt[]): TopicStats[] {
  const byTopic = new Map<TopicId, { subject: SubjectId; answered: number; correct: number; last: AnswerAttempt }>();
  for (const attempt of attempts) {
    const current = byTopic.get(attempt.topic);
    if (current) {
      current.answered++;
      if (attempt.isCorrect) current.correct++;
      if (attempt.answeredAt >= current.last.answeredAt) current.last = attempt;
    } else {
      byTopic.set(attempt.topic, { subject: attempt.subject, answered: 1, correct: attempt.isCorrect ? 1 : 0, last: attempt });
    }
  }
  return [...byTopic.entries()].map(([topic, value]) => ({
    subject: value.subject,
    topic,
    ...toStats(value.answered, value.correct),
    lastWasWrong: !value.last.isCorrect,
  }));
}

/**
 * Sugestões de revisão: assuntos com aproveitamento abaixo do limite
 * (com pelo menos `minAnswered` respostas) ou cuja última resposta foi errada.
 * Os piores aparecem primeiro.
 */
export function reviewSuggestions(
  attempts: readonly AnswerAttempt[],
  { threshold = 70, minAnswered = 2, limit = 5 }: { threshold?: number; minAnswered?: number; limit?: number } = {},
): TopicStats[] {
  return statsByTopic(attempts)
    .filter((stats) => (stats.answered >= minAnswered && stats.percentage < threshold) || stats.lastWasWrong)
    .sort((a, b) => a.percentage - b.percentage || b.wrong - a.wrong)
    .slice(0, limit);
}

/** Questões diferentes já respondidas (para o progresso geral). */
export function uniqueQuestionsAnswered(attempts: readonly AnswerAttempt[], validIds?: ReadonlySet<string>): number {
  const ids = new Set(attempts.map((attempt) => attempt.questionId));
  if (!validIds) return ids.size;
  let count = 0;
  for (const id of ids) if (validIds.has(id)) count++;
  return count;
}

/** Última resposta de cada questão, usada para priorizar a prática. */
export function lastResultByQuestion(attempts: readonly AnswerAttempt[]): Map<string, boolean> {
  const result = new Map<string, boolean>();
  for (const attempt of attempts) result.set(attempt.questionId, attempt.isCorrect);
  return result;
}

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface DailyPoint {
  date: string;
  answered: number;
  correct: number;
  percentage: number;
}

/** Respostas por dia nos últimos `days` dias (incluindo hoje), em horário local. */
export function dailyEvolution(attempts: readonly AnswerAttempt[], days: number, today: Date): DailyPoint[] {
  const counts = new Map<string, { answered: number; correct: number }>();
  for (const attempt of attempts) {
    const key = localDateKey(new Date(attempt.answeredAt));
    const current = counts.get(key) ?? { answered: 0, correct: 0 };
    current.answered++;
    if (attempt.isCorrect) current.correct++;
    counts.set(key, current);
  }
  const points: DailyPoint[] = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
    const key = localDateKey(date);
    const value = counts.get(key) ?? { answered: 0, correct: 0 };
    points.push({ date: key, ...value, percentage: percentage(value.correct, value.answered) });
  }
  return points;
}

/** Dias seguidos com estudo, terminando hoje ou ontem. */
export function studyStreak(attempts: readonly AnswerAttempt[], today: Date): number {
  const days = new Set(attempts.map((attempt) => localDateKey(new Date(attempt.answeredAt))));
  let streak = 0;
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!days.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(localDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
