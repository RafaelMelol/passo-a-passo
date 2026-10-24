import { describe, expect, it } from "vitest";
import { OFFICIAL_EXAMS, OFFICIAL_REPOSITORIES, getOfficialExam } from "@/data/official-exams";
import { isTopicId } from "@/data/subjects";
import { defaultSectionIds, gradeOfficialExam, validateOfficialExam } from "@/lib/official";
import { isHttpUrl } from "@/lib/questions/validation";
import type { OfficialExam } from "@/types/official";

describe("dados das provas oficiais", () => {
  it.each(OFFICIAL_EXAMS.map((exam) => [exam.id, exam] as const))("%s é coerente", (_id, exam) => {
    expect(validateOfficialExam(exam)).toEqual([]);
    for (const item of exam.answerKey) {
      if (item.topic) expect(isTopicId(item.topic)).toBe(true);
    }
  });

  it("gabarito FGV/Pró-Sangue 2013 transcrito do PDF oficial (amostra conferida com o caderno)", () => {
    const exam = getOfficialExam("fgv-prosangue-2013-auxiliar-servicos-gerais")!;
    const key = Object.fromEntries(exam.answerKey.map((item) => [item.number, item.answer]));
    // Conferidas manualmente com o caderno Tipo 1: 1 (freasse), 21 (100 mL), 24 (média 1884), 25 (R$ 40,00).
    expect([key[1], key[21], key[24], key[25]]).toEqual(["C", "E", "A", "D"]);
    expect(exam.answerKey.filter((item) => item.status === "anulada")).toEqual([]);
  });

  it("IBGE 2022: questão 17 anulada no gabarito definitivo", () => {
    const exam = getOfficialExam("fgv-ibge-2022-recenseador")!;
    const q17 = exam.answerKey.find((item) => item.number === 17)!;
    expect(q17).toMatchObject({ status: "anulada", answer: null });
    // Conferidas com o caderno Tipo 1: 12 (desconto de 16%), 13 (área 392), 19 (18 litros), 20 (R$ 430,00).
    const key = Object.fromEntries(exam.answerKey.map((item) => [item.number, item.answer]));
    expect([key[12], key[13], key[19], key[20]]).toEqual(["D", "B", "B", "A"]);
  });

  it("links de repositórios são https", () => {
    for (const repository of OFFICIAL_REPOSITORIES) expect(isHttpUrl(repository.url)).toBe(true);
  });
});

describe("validateOfficialExam detecta problemas", () => {
  const base = OFFICIAL_EXAMS[0];

  it("gabarito com tamanho errado", () => {
    const broken: OfficialExam = { ...base, answerKey: base.answerKey.slice(0, 10) };
    expect(validateOfficialExam(broken).length).toBeGreaterThan(0);
  });

  it("questão anulada com resposta e letra fora do limite", () => {
    const answerKey = base.answerKey.map((item) =>
      item.number === 1 ? { ...item, status: "anulada" as const } : item.number === 2 ? { ...item, answer: "E" as const } : item,
    );
    const fourOptions: OfficialExam = { ...base, optionCount: 4, answerKey };
    const errors = validateOfficialExam(fourOptions);
    expect(errors.some((error) => error.includes("Questão 1"))).toBe(true);
  });

  it("seções sobrepostas ou incompletas", () => {
    const overlapping: OfficialExam = {
      ...base,
      sections: [
        { id: "a", title: "A", firstQuestion: 1, lastQuestion: 30 },
        { id: "b", title: "B", firstQuestion: 25, lastQuestion: 40 },
      ],
    };
    expect(validateOfficialExam(overlapping).length).toBeGreaterThan(0);
  });
});

describe("gradeOfficialExam — cartão-resposta", () => {
  const exam = getOfficialExam("fgv-ibge-2022-recenseador")!;
  const correctAnswers = Object.fromEntries(
    exam.answerKey.filter((item) => item.answer).map((item) => [String(item.number), item.answer!]),
  );

  it("todas certas nas seções escolhidas = 100%, e a anulada não conta", () => {
    const result = gradeOfficialExam(exam, correctAnswers, ["portugues", "matematica"]);
    expect(result.score).toMatchObject({ total: 19, correct: 19, percentage: 100 });
    expect(result.annulled).toEqual([17]);
    expect(result.items.find((item) => item.number === 17)?.status).toBe("anulada");
  });

  it("marcar qualquer letra na anulada não muda a nota", () => {
    const withAnnulled = { ...correctAnswers, "17": "A" as const };
    expect(gradeOfficialExam(exam, withAnnulled, ["matematica"]).score.correct).toBe(9);
  });

  it("conta erradas e em branco, e indica assuntos para praticar", () => {
    const answers = { ...correctAnswers, "12": "A" as const };
    delete (answers as Record<string, string>)["20"];
    const result = gradeOfficialExam(exam, answers, ["matematica"]);
    expect(result.score).toMatchObject({ total: 9, correct: 7, wrong: 1, blank: 1 });
    expect(result.topicsToPractice).toEqual([{ topic: "porcentagem", wrong: 2 }]);
  });

  it("sem seções escolhidas, nada é corrigido", () => {
    expect(gradeOfficialExam(exam, correctAnswers, []).score.total).toBe(0);
  });

  it("seções padrão são as das disciplinas do site", () => {
    expect(defaultSectionIds(exam)).toEqual(["portugues", "matematica"]);
  });
});
