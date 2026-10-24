import { describe, expect, it } from "vitest";
import { ALL_QUESTIONS, IMPORT_ERRORS } from "@/data/questions";
import { SUBJECTS } from "@/data/subjects";
import { definePracticeQuestions } from "@/data/questions/helpers";
import { buildBank, filterQuestions, questionBank } from "@/lib/questions/bank";
import { parseQuestionList } from "@/lib/questions/parse";
import { isScorable, isVerifiedOfficial, validateQuestion } from "@/lib/questions/validation";
import { makeOfficialQuestion, makeQuestion } from "./fixtures";

describe("validateQuestion", () => {
  it("aceita uma questão completa", () => {
    expect(validateQuestion(makeQuestion())).toEqual({ ok: true, errors: [] });
  });

  it("recusa resposta correta que não existe nas alternativas", () => {
    const result = validateQuestion(makeQuestion({ correctOption: "E" }));
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/resposta correta/i);
  });

  it("recusa menos de duas alternativas", () => {
    const result = validateQuestion(makeQuestion({ options: [{ letter: "A", text: "Única" }], correctOption: "A" }));
    expect(result.ok).toBe(false);
  });

  it("recusa letras fora de sequência, alternativas vazias ou repetidas", () => {
    expect(
      validateQuestion(
        makeQuestion({
          options: [
            { letter: "A", text: "1" },
            { letter: "C", text: "2" },
          ],
          correctOption: "A",
        }),
      ).ok,
    ).toBe(false);
    expect(
      validateQuestion(
        makeQuestion({
          options: [
            { letter: "A", text: "1" },
            { letter: "B", text: "  " },
          ],
          correctOption: "A",
        }),
      ).ok,
    ).toBe(false);
    expect(
      validateQuestion(
        makeQuestion({
          options: [
            { letter: "A", text: "Sim" },
            { letter: "B", text: "sim" },
          ],
          correctOption: "A",
        }),
      ).ok,
    ).toBe(false);
  });

  it("recusa assunto que não pertence à disciplina", () => {
    const result = validateQuestion(makeQuestion({ subject: "portugues", topic: "porcentagem" }));
    expect(result.ok).toBe(false);
  });

  it("recusa questão sem explicação", () => {
    expect(validateQuestion(makeQuestion({ explanation: { summary: "" } })).ok).toBe(false);
  });

  it("questão oficial precisa de link, banca, concurso e ano", () => {
    expect(validateQuestion(makeOfficialQuestion()).ok).toBe(true);
    const semLink = makeOfficialQuestion({ source: { description: "Prova", examBoard: "X", exam: "Y", year: 2020 } });
    expect(validateQuestion(semLink).ok).toBe(false);
    const linkInvalido = makeOfficialQuestion({
      source: { description: "Prova", url: "javascript:alert(1)", examBoard: "X", exam: "Y", year: 2020 },
    });
    expect(validateQuestion(linkInvalido).ok).toBe(false);
    const semAno = makeOfficialQuestion({ source: { description: "Prova", url: "https://a.gov.br", examBoard: "X", exam: "Y" } });
    expect(validateQuestion(semAno).ok).toBe(false);
  });

  it("questão autoral não pode ser atribuída a banca ou concurso", () => {
    const fakeOfficial = makeQuestion({ source: { description: "Prática", examBoard: "FGV", exam: "Concurso X" } });
    const result = validateQuestion(fakeOfficial);
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/autoral/i);
  });
});

describe("isScorable / isVerifiedOfficial", () => {
  it("só pontua questões válidas com gabarito verificado", () => {
    expect(isScorable(makeQuestion())).toBe(true);
    expect(isScorable(makeQuestion({ verification: { statement: "verificada", answerKey: "pendente" } }))).toBe(false);
    expect(isScorable(makeQuestion({ verification: { statement: "verificada", answerKey: "anulada" } }))).toBe(false);
    expect(isScorable(makeQuestion({ correctOption: "E" }))).toBe(false);
  });

  it("questão oficial com enunciado não conferido não é tratada como verificada", () => {
    const naoConferida = makeOfficialQuestion({ verification: { statement: "pendente", answerKey: "verificada" } });
    expect(isScorable(naoConferida)).toBe(false);
    expect(isVerifiedOfficial(naoConferida)).toBe(false);
    expect(isVerifiedOfficial(makeOfficialQuestion())).toBe(true);
    expect(isVerifiedOfficial(makeQuestion())).toBe(false);
  });
});

describe("buildBank", () => {
  it("separa questões válidas das rejeitadas e recusa IDs repetidos", () => {
    const bank = buildBank([
      makeQuestion({ id: "a" }),
      makeQuestion({ id: "a" }),
      makeQuestion({ id: "b", correctOption: "E" }),
      makeQuestion({ id: "c", verification: { statement: "verificada", answerKey: "divergente" } }),
    ]);
    expect(bank.questions.map((q) => q.id)).toEqual(["a"]);
    expect(bank.rejected.map((r) => r.id)).toEqual(["a", "b", "c"]);
    expect(bank.byId.get("a")).toBeDefined();
  });

  it("banco vazio funciona sem erros", () => {
    const bank = buildBank([]);
    expect(bank.questions).toHaveLength(0);
    expect(filterQuestions(bank.questions, { subject: "portugues" })).toEqual([]);
  });
});

describe("definePracticeQuestions", () => {
  it("rascunho sem resposta certa (ou com duas) fica pendente e fora do banco", () => {
    const [semResposta, duasRespostas] = definePracticeQuestions("matematica", [
      {
        id: "rascunho-1",
        topic: "operacoes",
        difficulty: "facil",
        statement: "Quanto é 1 + 1?",
        options: [{ text: "1" }, { text: "2" }],
        explanation: { summary: "1 + 1 = 2" },
      },
      {
        id: "rascunho-2",
        topic: "operacoes",
        difficulty: "facil",
        statement: "Quanto é 1 + 1?",
        options: [{ text: "2", correct: true }, { text: "dois", correct: true }],
        explanation: { summary: "1 + 1 = 2" },
      },
    ]);
    expect(semResposta.verification.answerKey).toBe("pendente");
    expect(duasRespostas.verification.answerKey).toBe("pendente");
    expect(buildBank([semResposta, duasRespostas]).questions).toHaveLength(0);
  });
});

describe("parseQuestionList (importação de JSON)", () => {
  it("aceita objetos bem formados e aponta os malformados", () => {
    const valid = makeOfficialQuestion();
    const { questions, errors } = parseQuestionList([valid, { id: "x" }, 42]);
    expect(questions).toHaveLength(1);
    expect(errors).toHaveLength(2);
  });

  it("recusa conteúdo que não é uma lista", () => {
    expect(parseQuestionList({}).errors).toHaveLength(1);
  });
});

describe("integridade do banco de questões do site", () => {
  it("todas as questões cadastradas passam na validação", () => {
    expect(IMPORT_ERRORS).toEqual([]);
    expect(questionBank.rejected).toEqual([]);
    expect(questionBank.questions.length).toBe(ALL_QUESTIONS.length);
  });

  it("os IDs são únicos", () => {
    const ids = ALL_QUESTIONS.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("todos os assuntos de todas as disciplinas têm pelo menos 4 questões", () => {
    for (const subject of SUBJECTS) {
      for (const topic of subject.topics) {
        const count = filterQuestions(questionBank.questions, { subject: subject.id, topic: topic.id }).length;
        expect(count, `${subject.id}/${topic.id}`).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it("cada disciplina tem questões fáceis, médias e difíceis", () => {
    for (const subject of SUBJECTS) {
      for (const difficulty of ["facil", "medio", "dificil"] as const) {
        expect(filterQuestions(questionBank.questions, { subject: subject.id, difficulty }).length).toBeGreaterThan(0);
      }
    }
  });

  it("a letra correta varia entre as questões (nenhuma letra concentra mais de 40%)", () => {
    const counts = new Map<string, number>();
    for (const question of questionBank.questions) counts.set(question.correctOption, (counts.get(question.correctOption) ?? 0) + 1);
    for (const count of counts.values()) expect(count / questionBank.questions.length).toBeLessThanOrEqual(0.4);
  });

  it("nenhuma questão de prática se apresenta como oficial", () => {
    for (const question of questionBank.questions.filter((q) => q.contentType === "pratica-autoral")) {
      expect(question.source.examBoard).toBeUndefined();
      expect(question.source.exam).toBeUndefined();
    }
  });

  it("questões de Matemática têm cálculo passo a passo ou explicação detalhada", () => {
    for (const question of filterQuestions(questionBank.questions, { subject: "matematica" })) {
      expect(question.explanation.summary.length, question.id).toBeGreaterThan(20);
    }
  });
});
