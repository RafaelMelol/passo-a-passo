import { describe, expect, it } from "vitest";
import { calculateScore, checkAnswer, percentage, summarizeScore } from "@/lib/grading";
import { makeQuestion } from "./fixtures";

describe("checkAnswer — correção de respostas", () => {
  it("marca como correta quando a letra escolhida é a do gabarito", () => {
    expect(checkAnswer(makeQuestion(), "B")).toEqual({ status: "correct", selected: "B", correctOption: "B" });
  });

  it("marca como incorreta e informa a letra certa", () => {
    expect(checkAnswer(makeQuestion(), "A")).toEqual({ status: "wrong", selected: "A", correctOption: "B" });
  });

  it("compara letras, não textos: alternativas com textos parecidos não confundem a correção", () => {
    const question = makeQuestion({
      options: [
        { letter: "A", text: "20" },
        { letter: "B", text: "20,0" },
        { letter: "C", text: "200" },
      ],
      correctOption: "B",
    });
    expect(checkAnswer(question, "A").status).toBe("wrong");
    expect(checkAnswer(question, "B").status).toBe("correct");
  });

  it("recusa resposta vazia ou letra inexistente", () => {
    expect(checkAnswer(makeQuestion(), null).status).toBe("invalid");
    expect(checkAnswer(makeQuestion(), "E").status).toBe("invalid");
  });

  it("não corrige questão com gabarito pendente, divergente ou anulado", () => {
    for (const answerKey of ["pendente", "divergente", "anulada"] as const) {
      const question = makeQuestion({ verification: { statement: "verificada", answerKey } });
      expect(checkAnswer(question, "B").status).toBe("invalid");
    }
  });
});

describe("percentage — percentual de acertos", () => {
  it("calcula e arredonda para inteiro", () => {
    expect(percentage(7, 10)).toBe(70);
    expect(percentage(1, 3)).toBe(33);
    expect(percentage(2, 3)).toBe(67);
    expect(percentage(10, 10)).toBe(100);
  });

  it("não divide por zero e não passa de 100", () => {
    expect(percentage(0, 0)).toBe(0);
    expect(percentage(5, 0)).toBe(0);
    expect(percentage(-1, 10)).toBe(0);
    expect(percentage(12, 10)).toBe(100);
  });
});

describe("calculateScore — pontuação", () => {
  it("conta acertos, erros e questões em branco", () => {
    const q1 = makeQuestion({ id: "q1" });
    const q2 = makeQuestion({ id: "q2", correctOption: "C" });
    const q3 = makeQuestion({ id: "q3" });
    const q4 = makeQuestion({ id: "q4", correctOption: "A" });
    const score = calculateScore([
      { question: q1, selected: "B" },
      { question: q2, selected: "A" },
      { question: q3, selected: null },
      { question: q4, selected: "A" },
    ]);
    expect(score).toEqual({ total: 4, answered: 3, correct: 2, wrong: 1, blank: 1, percentage: 50 });
  });

  it("lista vazia resulta em zero, sem erro", () => {
    expect(calculateScore([])).toEqual({ total: 0, answered: 0, correct: 0, wrong: 0, blank: 0, percentage: 0 });
  });

  it("summarizeScore soma o total corretamente", () => {
    expect(summarizeScore(3, 1, 1)).toEqual({ total: 5, answered: 4, correct: 3, wrong: 1, blank: 1, percentage: 60 });
  });
});
