import type { Question } from "@/types/question";
import type { AnswerAttempt } from "@/types/study";

export function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: "teste-01",
    subject: "matematica",
    topic: "porcentagem",
    difficulty: "facil",
    statement: "Quanto é 10% de 200?",
    options: [
      { letter: "A", text: "2" },
      { letter: "B", text: "20" },
      { letter: "C", text: "200" },
      { letter: "D", text: "10" },
    ],
    correctOption: "B",
    explanation: { summary: "10% de 200 é 200 ÷ 10 = 20." },
    contentType: "pratica-autoral",
    source: { description: "Questão de prática elaborada para estudo." },
    verification: { statement: "verificada", answerKey: "verificada", checkedAt: "2026-10-23" },
    ...overrides,
  };
}

export function makeOfficialQuestion(overrides: Partial<Question> = {}): Question {
  return makeQuestion({
    id: "oficial-01",
    contentType: "oficial",
    source: {
      description: "Prova oficial",
      url: "https://exemplo.gov.br/prova.pdf",
      examBoard: "Banca Exemplo",
      exam: "Concurso Exemplo",
      year: 2022,
      originalNumber: 12,
    },
    ...overrides,
  });
}

export function makeAttempt(overrides: Partial<AnswerAttempt> = {}): AnswerAttempt {
  return {
    questionId: "teste-01",
    subject: "matematica",
    topic: "porcentagem",
    difficulty: "facil",
    selected: "B",
    isCorrect: true,
    answeredAt: "2026-10-20T12:00:00.000Z",
    mode: "pratica",
    ...overrides,
  };
}

/** Armazenamento em memória que imita o localStorage. */
export class MemoryStorage implements Storage {
  private items = new Map<string, string>();
  constructor(private readonly options: { throwOnSet?: Error; throwOnGet?: boolean } = {}) {}
  get length() {
    return this.items.size;
  }
  clear() {
    this.items.clear();
  }
  getItem(key: string) {
    if (this.options.throwOnGet) throw new Error("bloqueado");
    return this.items.get(key) ?? null;
  }
  key(index: number) {
    return [...this.items.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.items.delete(key);
  }
  setItem(key: string, value: string) {
    if (this.options.throwOnSet) throw this.options.throwOnSet;
    this.items.set(key, value);
  }
}
