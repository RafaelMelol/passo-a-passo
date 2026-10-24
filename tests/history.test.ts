import { describe, expect, it } from "vitest";
import {
  MAX_ATTEMPTS,
  dailyEvolution,
  localDateKey,
  overallStats,
  recordAttempt,
  recordAttempts,
  reviewSuggestions,
  statsBySubject,
  statsByTopic,
  studyStreak,
  uniqueQuestionsAnswered,
} from "@/lib/history";
import { createEmptyStudyData } from "@/lib/storage";
import { makeAttempt } from "./fixtures";

describe("registro do histórico", () => {
  it("recordAttempt adiciona a resposta sem alterar os dados originais", () => {
    const data = createEmptyStudyData();
    const next = recordAttempt(data, makeAttempt());
    expect(next.attempts).toHaveLength(1);
    expect(data.attempts).toHaveLength(0);
  });

  it("mantém só as respostas mais recentes quando passa do limite", () => {
    const data = { ...createEmptyStudyData(), attempts: Array.from({ length: MAX_ATTEMPTS }, (_, i) => makeAttempt({ questionId: `q${i}` })) };
    const next = recordAttempts(data, [makeAttempt({ questionId: "nova" })]);
    expect(next.attempts).toHaveLength(MAX_ATTEMPTS);
    expect(next.attempts.at(-1)?.questionId).toBe("nova");
    expect(next.attempts[0].questionId).toBe("q1");
  });

  it("lista vazia de tentativas não cria novo objeto", () => {
    const data = createEmptyStudyData();
    expect(recordAttempts(data, [])).toBe(data);
  });
});

describe("estatísticas", () => {
  const attempts = [
    makeAttempt({ questionId: "m1", isCorrect: true, answeredAt: "2026-10-20T10:00:00.000Z" }),
    makeAttempt({ questionId: "m2", isCorrect: false, selected: "A", answeredAt: "2026-10-20T11:00:00.000Z" }),
    makeAttempt({ questionId: "m1", isCorrect: true, answeredAt: "2026-10-21T10:00:00.000Z" }),
    makeAttempt({ questionId: "p1", subject: "portugues", topic: "ortografia", isCorrect: false, selected: "C", answeredAt: "2026-10-21T12:00:00.000Z" }),
  ];

  it("totais e percentual geral", () => {
    expect(overallStats(attempts)).toEqual({ answered: 4, correct: 2, wrong: 2, percentage: 50 });
    expect(overallStats([])).toEqual({ answered: 0, correct: 0, wrong: 0, percentage: 0 });
  });

  it("desempenho por disciplina inclui todas as disciplinas", () => {
    const bySubject = statsBySubject(attempts);
    expect(bySubject.matematica).toEqual({ answered: 3, correct: 2, wrong: 1, percentage: 67 });
    expect(bySubject.portugues).toEqual({ answered: 1, correct: 0, wrong: 1, percentage: 0 });
    expect(bySubject.informatica.answered).toBe(0);
  });

  it("desempenho por assunto", () => {
    const byTopic = statsByTopic(attempts);
    const porcentagem = byTopic.find((item) => item.topic === "porcentagem");
    expect(porcentagem).toMatchObject({ answered: 3, correct: 2, percentage: 67, lastWasWrong: false });
  });

  it("sugere revisar assuntos fracos ou com erro recente, os piores primeiro", () => {
    // ortografia: 0% (última errada); porcentagem: 67% (abaixo de 70%).
    expect(reviewSuggestions(attempts).map((item) => item.topic)).toEqual(["ortografia", "porcentagem"]);
  });

  it("não sugere assunto com bom aproveitamento e última resposta certa", () => {
    const good = [
      makeAttempt({ questionId: "m1", isCorrect: true, answeredAt: "2026-10-20T10:00:00.000Z" }),
      makeAttempt({ questionId: "m2", isCorrect: false, selected: "A", answeredAt: "2026-10-20T11:00:00.000Z" }),
      makeAttempt({ questionId: "m3", isCorrect: true, answeredAt: "2026-10-20T12:00:00.000Z" }),
      makeAttempt({ questionId: "m4", isCorrect: true, answeredAt: "2026-10-20T13:00:00.000Z" }),
    ];
    expect(reviewSuggestions(good)).toEqual([]);
  });

  it("questões diferentes respondidas (ignora repetidas e removidas do banco)", () => {
    expect(uniqueQuestionsAnswered(attempts)).toBe(3);
    expect(uniqueQuestionsAnswered(attempts, new Set(["m1", "p1"]))).toBe(2);
  });
});

describe("evolução ao longo do tempo", () => {
  it("agrupa por dia e preenche os dias sem estudo", () => {
    const today = new Date(2026, 9, 23, 18, 0);
    const attempts = [
      makeAttempt({ answeredAt: new Date(2026, 9, 23, 9, 0).toISOString(), isCorrect: true }),
      makeAttempt({ answeredAt: new Date(2026, 9, 23, 10, 0).toISOString(), isCorrect: false }),
      makeAttempt({ answeredAt: new Date(2026, 9, 21, 10, 0).toISOString(), isCorrect: true }),
    ];
    const points = dailyEvolution(attempts, 3, today);
    expect(points).toEqual([
      { date: "2026-10-21", answered: 1, correct: 1, percentage: 100 },
      { date: "2026-10-22", answered: 0, correct: 0, percentage: 0 },
      { date: "2026-10-23", answered: 2, correct: 1, percentage: 50 },
    ]);
  });

  it("conta dias seguidos de estudo", () => {
    const today = new Date(2026, 9, 23, 18, 0);
    const day = (d: number) => makeAttempt({ answeredAt: new Date(2026, 9, d, 12, 0).toISOString() });
    expect(studyStreak([day(23), day(22), day(21), day(19)], today)).toBe(3);
    expect(studyStreak([day(22), day(21)], today)).toBe(2);
    expect(studyStreak([day(20)], today)).toBe(0);
    expect(localDateKey(today)).toBe("2026-10-23");
  });
});
