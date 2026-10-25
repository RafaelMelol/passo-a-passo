import { ALL_QUESTIONS, IMPORT_ERRORS } from "@/data/questions";
import type { ContentType, Difficulty, Question, SubjectId, TopicId } from "@/types/question";
import { isScorable, validateQuestion } from "./validation";

export interface RejectedQuestion {
  id: string;
  reasons: string[];
}

export interface QuestionBank {
  /** Questões válidas e com gabarito verificado: as únicas usadas para estudar. */
  questions: readonly Question[];
  byId: ReadonlyMap<string, Question>;
  rejected: readonly RejectedQuestion[];
}

export function buildBank(candidates: readonly Question[], importErrors: readonly string[] = []): QuestionBank {
  const questions: Question[] = [];
  const byId = new Map<string, Question>();
  const rejected: RejectedQuestion[] = importErrors.map((error) => ({ id: "importação", reasons: [error] }));

  for (const question of candidates) {
    if (byId.has(question.id)) {
      rejected.push({ id: question.id, reasons: ["ID repetido: já existe outra questão com este ID."] });
      continue;
    }
    const validation = validateQuestion(question);
    if (!validation.ok) {
      rejected.push({ id: question.id, reasons: validation.errors });
      continue;
    }
    if (!isScorable(question)) {
      rejected.push({
        id: question.id,
        reasons: [`Gabarito não verificado (status: ${question.verification.answerKey}).`],
      });
      continue;
    }
    questions.push(question);
    byId.set(question.id, question);
  }

  return { questions, byId, rejected };
}

export const questionBank: QuestionBank = buildBank(ALL_QUESTIONS, IMPORT_ERRORS);

export interface QuestionFilters {
  subject?: SubjectId;
  topic?: TopicId | "todos";
  difficulty?: Difficulty | "todas";
  /** Lista de disciplinas (usada nos simulados). Vazia = todas. */
  subjects?: readonly SubjectId[];
  contentType?: ContentType;
}

export function filterQuestions(questions: readonly Question[], filters: QuestionFilters): Question[] {
  return questions.filter((question) => {
    if (filters.subject && question.subject !== filters.subject) return false;
    if (filters.subjects && filters.subjects.length > 0 && !filters.subjects.includes(question.subject)) return false;
    if (filters.topic && filters.topic !== "todos" && question.topic !== filters.topic) return false;
    if (filters.difficulty && filters.difficulty !== "todas" && question.difficulty !== filters.difficulty) return false;
    if (filters.contentType && question.contentType !== filters.contentType) return false;
    return true;
  });
}

export function getQuestion(id: string, bank: QuestionBank = questionBank): Question | undefined {
  return bank.byId.get(id);
}
