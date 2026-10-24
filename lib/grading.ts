import type { OptionLetter, Question } from "@/types/question";
import type { ScoreSummary } from "@/types/study";
import { isScorable } from "./questions/validation";

export type AnswerCheck =
  | { status: "correct" | "wrong"; selected: OptionLetter; correctOption: OptionLetter }
  | { status: "invalid"; reason: string };

/**
 * Corrige comparando a LETRA marcada com a letra do gabarito validado —
 * nunca o texto das alternativas.
 */
export function checkAnswer(question: Question, selected: OptionLetter | null | undefined): AnswerCheck {
  if (!isScorable(question)) {
    return { status: "invalid", reason: "Esta questão não tem gabarito verificado e não pode ser corrigida." };
  }
  if (!selected || !question.options.some((option) => option.letter === selected)) {
    return { status: "invalid", reason: "Escolha uma das alternativas antes de responder." };
  }
  return {
    status: selected === question.correctOption ? "correct" : "wrong",
    selected,
    correctOption: question.correctOption,
  };
}

/** Percentual inteiro de 0 a 100. Total zero resulta em 0 (sem divisão por zero). */
export function percentage(part: number, total: number): number {
  if (!Number.isFinite(part) || !Number.isFinite(total) || total <= 0 || part <= 0) return 0;
  return Math.round((Math.min(part, total) / total) * 100);
}

export function summarizeScore(correct: number, wrong: number, blank: number): ScoreSummary {
  const total = correct + wrong + blank;
  return {
    total,
    answered: correct + wrong,
    correct,
    wrong,
    blank,
    percentage: percentage(correct, total),
  };
}

/** Pontuação de uma lista de questões. Questões em branco contam no total, mas não como acerto. */
export function calculateScore(items: readonly { question: Question; selected: OptionLetter | null }[]): ScoreSummary {
  let correct = 0;
  let wrong = 0;
  let blank = 0;
  for (const { question, selected } of items) {
    if (!selected) {
      blank++;
      continue;
    }
    const result = checkAnswer(question, selected);
    if (result.status === "correct") correct++;
    else if (result.status === "wrong") wrong++;
    else blank++;
  }
  return summarizeScore(correct, wrong, blank);
}
