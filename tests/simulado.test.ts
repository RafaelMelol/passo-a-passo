import { describe, expect, it } from "vitest";
import { questionBank } from "@/lib/questions/bank";
import { seededRandom } from "@/lib/random";
import { countAnswered, createSimulado, finishSimulado, topicsNeedingReview } from "@/lib/simulado";
import type { Question } from "@/types/question";
import type { SimuladoConfig } from "@/types/study";
import { makeQuestion } from "./fixtures";

const baseConfig: SimuladoConfig = { questionCount: 10, subjects: [], difficulty: "todas", timerEnabled: false };
const NOW = new Date("2026-10-23T15:00:00.000Z");

describe("createSimulado", () => {
  it("sorteia a quantidade pedida, sem repetir questões", () => {
    const result = createSimulado(questionBank.questions, { ...baseConfig, questionCount: 30 }, seededRandom(1), NOW);
    if (!result.ok) throw new Error("deveria criar");
    expect(result.session.questionIds).toHaveLength(30);
    expect(new Set(result.session.questionIds).size).toBe(30);
    expect(result.shortage).toBe(0);
    expect(result.session.startedAt).toBe(NOW.toISOString());
  });

  it("mistura as disciplinas de forma equilibrada e agrupa por disciplina", () => {
    const result = createSimulado(questionBank.questions, { ...baseConfig, questionCount: 9 }, seededRandom(7), NOW);
    if (!result.ok) throw new Error("deveria criar");
    const subjects = result.session.questionIds.map((id) => questionBank.byId.get(id)?.subject);
    expect(subjects.filter((s) => s === "portugues")).toHaveLength(3);
    expect(subjects.filter((s) => s === "matematica")).toHaveLength(3);
    expect(subjects.filter((s) => s === "informatica")).toHaveLength(3);
    expect(subjects).toEqual([...subjects].sort((a, b) => ["portugues", "matematica", "informatica"].indexOf(a!) - ["portugues", "matematica", "informatica"].indexOf(b!)));
  });

  it("respeita a disciplina e a dificuldade escolhidas", () => {
    const result = createSimulado(
      questionBank.questions,
      { ...baseConfig, subjects: ["informatica"], difficulty: "facil", questionCount: 5 },
      seededRandom(3),
      NOW,
    );
    if (!result.ok) throw new Error("deveria criar");
    for (const id of result.session.questionIds) {
      const question = questionBank.byId.get(id)!;
      expect(question.subject).toBe("informatica");
      expect(question.difficulty).toBe("facil");
    }
  });

  it("com banco insuficiente, usa todas as disponíveis e informa a falta", () => {
    const small = [makeQuestion({ id: "q1" }), makeQuestion({ id: "q2" }), makeQuestion({ id: "q3" })];
    const result = createSimulado(small, { ...baseConfig, questionCount: 10 }, seededRandom(2), NOW);
    if (!result.ok) throw new Error("deveria criar");
    expect(result.session.questionIds.sort()).toEqual(["q1", "q2", "q3"]);
    expect(result.shortage).toBe(7);
    expect(result.session.config.questionCount).toBe(3);
  });

  it("com banco vazio ou filtros sem questões, não cria o simulado", () => {
    expect(createSimulado([], baseConfig, seededRandom(1), NOW)).toEqual({ ok: false, reason: "sem-questoes" });
    const onlyMath = [makeQuestion()];
    expect(createSimulado(onlyMath, { ...baseConfig, subjects: ["portugues"] }, seededRandom(1), NOW)).toEqual({
      ok: false,
      reason: "sem-questoes",
    });
  });

  it("recusa quantidade inválida", () => {
    for (const questionCount of [0, -1, 2.5, 1000]) {
      expect(createSimulado(questionBank.questions, { ...baseConfig, questionCount }, seededRandom(1), NOW)).toEqual({
        ok: false,
        reason: "quantidade-invalida",
      });
    }
  });
});

describe("finishSimulado", () => {
  const questions: Question[] = [
    makeQuestion({ id: "q1", topic: "porcentagem", correctOption: "B" }),
    makeQuestion({ id: "q2", topic: "porcentagem", correctOption: "C" }),
    makeQuestion({ id: "q3", topic: "medidas", correctOption: "A" }),
    makeQuestion({ id: "q4", subject: "portugues", topic: "ortografia", correctOption: "D" }),
  ];
  const lookup = (id: string) => questions.find((question) => question.id === id);
  const session = {
    id: "simulado-teste",
    config: { ...baseConfig, questionCount: 4 },
    questionIds: ["q1", "q2", "q3", "q4"],
    answers: { q1: "B", q2: "A", q3: "A" } as const,
    currentIndex: 3,
    startedAt: "2026-10-23T14:00:00.000Z",
    elapsedMs: 600_000,
  };

  it("calcula acertos, erros, em branco, aproveitamento e tempo", () => {
    const { result } = finishSimulado({ ...session, answers: { ...session.answers } }, lookup, NOW, 754_321);
    expect(result.score).toEqual({ total: 4, answered: 3, correct: 2, wrong: 1, blank: 1, percentage: 50 });
    expect(result.durationMs).toBe(754_321);
    expect(result.finishedAt).toBe(NOW.toISOString());
    expect(result.items.map((item) => item.isCorrect)).toEqual([true, false, true, false]);
    expect(result.items[3].selected).toBeNull();
  });

  it("registra no histórico apenas as questões respondidas", () => {
    const { attempts } = finishSimulado({ ...session, answers: { ...session.answers } }, lookup, NOW);
    expect(attempts.map((attempt) => attempt.questionId)).toEqual(["q1", "q2", "q3"]);
    expect(attempts.every((attempt) => attempt.mode === "simulado")).toBe(true);
  });

  it("indica os assuntos que precisam de mais estudo (piores primeiro)", () => {
    const { result } = finishSimulado({ ...session, answers: { ...session.answers } }, lookup, NOW);
    expect(result.topicsToReview).toEqual([
      { subject: "portugues", topic: "ortografia", wrong: 1, total: 1 },
      { subject: "matematica", topic: "porcentagem", wrong: 1, total: 2 },
    ]);
  });

  it("ignora questões que não existem mais no banco", () => {
    const { result } = finishSimulado({ ...session, questionIds: [...session.questionIds, "removida"], answers: { ...session.answers } }, lookup, NOW);
    expect(result.items).toHaveLength(4);
  });

  it("countAnswered conta só as questões do simulado com resposta", () => {
    expect(countAnswered({ questionIds: ["q1", "q2", "q3"], answers: { q1: "A", q3: "B", outra: "C" } })).toBe(2);
  });

  it("topicsNeedingReview não lista assuntos sem erros", () => {
    expect(
      topicsNeedingReview([{ questionId: "q1", subject: "matematica", topic: "porcentagem", selected: "B", correctOption: "B", isCorrect: true }]),
    ).toEqual([]);
  });
});
