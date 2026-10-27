import type { SubjectId } from "@/data/subjects";
import {
  OPTION_LETTERS,
  type Difficulty,
  type Question,
  type QuestionExplanation,
  type QuestionSource,
  type QuestionVerification,
  type SupportText,
  type TopicId,
} from "@/types/question";

/**
 * Questões autorais de prática: escritas para este site, sem atribuição
 * a banca, concurso ou órgão. A alternativa certa é marcada com
 * `correct: true` e a letra é calculada automaticamente.
 */

export const PRACTICE_SOURCE: QuestionSource = {
  description: "Questão de prática elaborada para estudo. Não foi retirada de prova oficial.",
};

const PRACTICE_VERIFICATION: QuestionVerification = {
  statement: "verificada",
  answerKey: "verificada",
  checkedAt: "2026-10-23",
  notes: "Questão autoral: gabarito e explicação revisados pelo autor.",
};

export interface DraftOption {
  text: string;
  correct?: true;
  whyWrong?: string;
}

export interface PracticeDraft {
  id: string;
  topic: TopicId;
  difficulty: Difficulty;
  statement: string;
  supportText?: SupportText;
  options: DraftOption[];
  explanation: QuestionExplanation;
}

/** `checkedAt` registra quando o lote foi conferido (padrão: data do primeiro lote). */
export function definePracticeQuestions(
  subject: SubjectId,
  drafts: PracticeDraft[],
  { checkedAt }: { checkedAt?: string } = {},
): Question[] {
  const verification = checkedAt ? { ...PRACTICE_VERIFICATION, checkedAt } : PRACTICE_VERIFICATION;
  return drafts.map((draft) => {
    const options = draft.options.map((option, index) => ({
      letter: OPTION_LETTERS[index],
      text: option.text,
      ...(option.whyWrong ? { whyWrong: option.whyWrong } : {}),
    }));
    const correctIndexes = draft.options.flatMap((option, index) => (option.correct ? [index] : []));
    const hasSingleAnswer = correctIndexes.length === 1;

    return {
      id: draft.id,
      subject,
      topic: draft.topic,
      difficulty: draft.difficulty,
      statement: draft.statement,
      ...(draft.supportText ? { supportText: draft.supportText } : {}),
      options,
      correctOption: OPTION_LETTERS[hasSingleAnswer ? correctIndexes[0] : 0],
      explanation: draft.explanation,
      contentType: "pratica-autoral",
      source: PRACTICE_SOURCE,
      // Rascunho com zero ou várias respostas certas fica pendente e não é usado.
      verification: hasSingleAnswer
        ? verification
        : {
            ...verification,
            answerKey: "pendente",
            notes: `Rascunho inválido: ${correctIndexes.length} alternativas marcadas como corretas.`,
          },
    };
  });
}
