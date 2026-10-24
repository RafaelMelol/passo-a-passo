import { SUBJECTS } from "@/data/subjects";
import type { Question, SubjectId } from "@/types/question";
import type {
  AnswerAttempt,
  SimuladoConfig,
  SimuladoItemResult,
  SimuladoResult,
  SimuladoSession,
  TopicReview,
} from "@/types/study";
import { checkAnswer, summarizeScore } from "./grading";
import { filterQuestions } from "./questions/bank";
import { createId, shuffle, type RandomSource } from "./random";

export const MAX_SIMULADO_QUESTIONS = 60;

const SUBJECT_ORDER: readonly SubjectId[] = SUBJECTS.map((subject) => subject.id);

export type CreateSimuladoResult =
  | { ok: true; session: SimuladoSession; requested: number; shortage: number }
  | { ok: false; reason: "sem-questoes" | "quantidade-invalida" };

export function availableForSimulado(questions: readonly Question[], config: Pick<SimuladoConfig, "subjects" | "difficulty">): Question[] {
  return filterQuestions(questions, { subjects: config.subjects, difficulty: config.difficulty });
}

/**
 * Sorteia as questões do simulado sem repetir nenhuma.
 * Quando há várias disciplinas, distribui de forma equilibrada entre elas.
 * No final, agrupa por disciplina (como nas provas reais).
 */
export function createSimulado(
  questions: readonly Question[],
  config: SimuladoConfig,
  random: RandomSource = Math.random,
  now: Date = new Date(),
): CreateSimuladoResult {
  if (!Number.isInteger(config.questionCount) || config.questionCount < 1 || config.questionCount > MAX_SIMULADO_QUESTIONS) {
    return { ok: false, reason: "quantidade-invalida" };
  }
  const pool = availableForSimulado(questions, config);
  if (pool.length === 0) return { ok: false, reason: "sem-questoes" };

  // Um "monte" embaralhado por disciplina; retiramos uma de cada vez, alternando.
  const piles = shuffle(SUBJECT_ORDER, random)
    .map((subject) => shuffle(pool.filter((question) => question.subject === subject), random))
    .filter((pile) => pile.length > 0);

  const selected: Question[] = [];
  const target = Math.min(config.questionCount, pool.length);
  while (selected.length < target && piles.some((pile) => pile.length > 0)) {
    for (const pile of piles) {
      const next = pile.pop();
      if (next && selected.length < target) selected.push(next);
    }
  }

  const ordered = SUBJECT_ORDER.flatMap((subject) => selected.filter((question) => question.subject === subject));

  return {
    ok: true,
    requested: config.questionCount,
    shortage: config.questionCount - ordered.length,
    session: {
      id: createId("simulado"),
      config: { ...config, questionCount: ordered.length },
      questionIds: ordered.map((question) => question.id),
      answers: {},
      currentIndex: 0,
      startedAt: now.toISOString(),
      elapsedMs: 0,
    },
  };
}

export function countAnswered(session: Pick<SimuladoSession, "questionIds" | "answers">): number {
  return session.questionIds.filter((id) => session.answers[id] !== undefined).length;
}

/** Assuntos com erro ou em branco, do que mais precisa de atenção para o que menos precisa. */
export function topicsNeedingReview(items: readonly SimuladoItemResult[]): TopicReview[] {
  const byTopic = new Map<string, TopicReview>();
  for (const item of items) {
    const current = byTopic.get(item.topic) ?? { subject: item.subject, topic: item.topic, wrong: 0, total: 0 };
    current.total++;
    if (!item.isCorrect) current.wrong++;
    byTopic.set(item.topic, current);
  }
  return [...byTopic.values()]
    .filter((review) => review.wrong > 0)
    .sort((a, b) => b.wrong / b.total - a.wrong / a.total || b.wrong - a.wrong);
}

export interface FinishedSimulado {
  result: SimuladoResult;
  attempts: AnswerAttempt[];
}

/**
 * Corrige o simulado. Questões que não existem mais no banco são ignoradas;
 * questões sem resposta contam como "em branco".
 */
export function finishSimulado(
  session: SimuladoSession,
  lookup: (id: string) => Question | undefined,
  finishedAt: Date,
  elapsedMs: number = session.elapsedMs,
): FinishedSimulado {
  const items: SimuladoItemResult[] = [];
  const attempts: AnswerAttempt[] = [];
  let correct = 0;
  let wrong = 0;
  let blank = 0;

  for (const id of session.questionIds) {
    const question = lookup(id);
    if (!question) continue;
    const selected = session.answers[id] ?? null;
    const check = checkAnswer(question, selected);
    const isCorrect = check.status === "correct";

    if (check.status === "correct") correct++;
    else if (check.status === "wrong") wrong++;
    else blank++;

    items.push({
      questionId: id,
      subject: question.subject,
      topic: question.topic,
      selected: check.status === "invalid" ? null : check.selected,
      correctOption: question.correctOption,
      isCorrect,
    });

    if (check.status !== "invalid") {
      attempts.push({
        questionId: id,
        subject: question.subject,
        topic: question.topic,
        difficulty: question.difficulty,
        selected: check.selected,
        isCorrect,
        answeredAt: finishedAt.toISOString(),
        mode: "simulado",
      });
    }
  }

  return {
    attempts,
    result: {
      id: session.id,
      config: session.config,
      startedAt: session.startedAt,
      finishedAt: finishedAt.toISOString(),
      durationMs: Math.max(0, Math.round(elapsedMs)),
      items,
      score: summarizeScore(correct, wrong, blank),
      topicsToReview: topicsNeedingReview(items),
    },
  };
}
