import { describe, expect, it } from "vitest";
import { buildPracticeOrder, createPracticeProgress, isPracticeFinished, practiceFilterKey, practiceHref } from "@/lib/practice";
import { questionBank } from "@/lib/questions/bank";
import { seededRandom } from "@/lib/random";
import { makeAttempt, makeQuestion } from "./fixtures";

describe("lista de prática", () => {
  it("prioriza questões nunca feitas, depois as erradas, depois as acertadas", () => {
    const questions = ["nova", "errada", "certa"].map((id) => makeQuestion({ id }));
    const attempts = [
      makeAttempt({ questionId: "certa", isCorrect: true }),
      makeAttempt({ questionId: "errada", isCorrect: false, selected: "A" }),
    ];
    expect(buildPracticeOrder(questions, attempts, seededRandom(1)).map((q) => q.id)).toEqual(["nova", "errada", "certa"]);
  });

  it("considera só a última resposta de cada questão", () => {
    const questions = [makeQuestion({ id: "q" }), makeQuestion({ id: "nova" })];
    const attempts = [
      makeAttempt({ questionId: "q", isCorrect: false, selected: "A" }),
      makeAttempt({ questionId: "q", isCorrect: true }),
    ];
    expect(buildPracticeOrder(questions, attempts, seededRandom(1)).map((q) => q.id)).toEqual(["nova", "q"]);
  });

  it("cria a lista com os filtros escolhidos", () => {
    const progress = createPracticeProgress(
      questionBank.questions,
      { subject: "portugues", topic: "pontuacao", difficulty: "todas" },
      [],
      new Date("2026-10-23T10:00:00.000Z"),
      seededRandom(5),
    );
    expect(progress).not.toBeNull();
    expect(progress!.questionIds.length).toBeGreaterThan(0);
    for (const id of progress!.questionIds) expect(questionBank.byId.get(id)?.topic).toBe("pontuacao");
    expect(progress!.filterKey).toBe("portugues|pontuacao|todas");
    expect(isPracticeFinished(progress!)).toBe(false);
    expect(isPracticeFinished({ ...progress!, currentIndex: progress!.questionIds.length })).toBe(true);
  });

  it("sem questões para os filtros, não cria lista", () => {
    expect(createPracticeProgress([], { subject: "matematica", topic: "todos", difficulty: "todas" }, [], new Date())).toBeNull();
  });

  it("monta o endereço e a chave da lista", () => {
    const filters = { subject: "matematica", topic: "porcentagem", difficulty: "facil" } as const;
    expect(practiceFilterKey(filters)).toBe("matematica|porcentagem|facil");
    expect(practiceHref(filters)).toBe("/praticar?disciplina=matematica&assunto=porcentagem&dificuldade=facil");
  });
});
