// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { ExamCandidate, ParsedAnswerKey, ParsedBooklet } from "@/lib/crawler/types";
import { validateExamCandidate } from "@/lib/crawler/validators/exam";
import { checkProvenance } from "@/lib/crawler/validators/provenance";
import { INEP_BOOKLET, INEP_KEY, INEP_YEAR, inepSource } from "../helpers/crawler";

function booklet(overrides: Partial<ParsedBooklet> = {}): ParsedBooklet {
  const questions = [31, 32, 33].map((number) => ({
    number,
    text: `Questão ${number} sobre porcentagem com texto suficiente para o hash.`,
    options: (["A", "B", "C", "D"] as const).map((letter) => ({ letter, text: `${letter} opção` })),
    page: 2,
    sectionTitle: "Matemática",
  }));
  return {
    url: INEP_BOOKLET,
    sha256: "b",
    firstQuestion: 31,
    lastQuestion: 33,
    questionCount: 3,
    optionCount: 4,
    sections: [{ id: "secao-1", title: "Matemática", subject: "matematica", firstQuestion: 31, lastQuestion: 33 }],
    questions,
    hasTextLayer: true,
    warnings: [],
    ...overrides,
  };
}

function key(overrides: Partial<ParsedAnswerKey> = {}): ParsedAnswerKey {
  return {
    url: INEP_KEY,
    sha256: "k",
    version: "oficial-unico",
    entries: [
      { number: 31, answer: "B" },
      { number: 32, answer: null },
      { number: 33, answer: "D" },
    ],
    blockLabel: "Matemática",
    matchConfidence: 1,
    ...overrides,
  };
}

function candidate(overrides: Partial<ExamCandidate> = {}): ExamCandidate {
  return {
    sourceId: "inep-encceja",
    dedupeKey: "teste|1",
    title: "Prova de teste",
    examBoard: "Inep",
    role: "Teste",
    educationLevel: "fundamental",
    year: 2020,
    bookletType: "Caderno único",
    examPageUrl: INEP_YEAR,
    bookletUrl: INEP_BOOKLET,
    booklet: booklet(),
    answerKey: key(),
    laterRectifications: [],
    warnings: [],
    ...overrides,
  };
}

const source = inepSource();

describe("validação de provas candidatas", () => {
  it("publica quando tudo confere e registra as anuladas", () => {
    const decision = validateExamCandidate(candidate(), source);
    expect(decision).toMatchObject({ action: "persist", publicationStatus: "published", verificationStatus: "verified_official" });
    expect(decision.notes.join(" ")).toMatch(/anuladas: 32/);
  });

  it("gabarito apenas preliminar fica pendente, sem verificação oficial", () => {
    const decision = validateExamCandidate(candidate({ answerKey: key({ version: "preliminar" }) }), source);
    expect(decision.publicationStatus).toBe("pending_validation");
    expect(decision.verificationStatus).toBe("pending");
    expect(decision.reviews.map((review) => review.reason)).toContain("gabarito_preliminar");
  });

  it("gabarito com número de questões diferente do caderno é contestado", () => {
    const decision = validateExamCandidate(candidate({ answerKey: key({ entries: [{ number: 31, answer: "A" }, { number: 32, answer: "B" }] }) }), source);
    expect(decision.publicationStatus).toBe("pending_validation");
    expect(decision.verificationStatus).toBe("disputed");
    expect(decision.reviews.map((review) => review.reason)).toContain("contagem_divergente");
  });

  it("letra inexistente no caderno (E em prova de 4 alternativas) não é publicada", () => {
    const decision = validateExamCandidate(
      candidate({ answerKey: key({ entries: [{ number: 31, answer: "E" }, { number: 32, answer: "A" }, { number: 33, answer: "B" }] }) }),
      source,
    );
    expect(decision.verificationStatus).toBe("disputed");
    expect(decision.reviews.map((review) => review.reason)).toContain("letra_invalida");
  });

  it("documento fora do site oficial da fonte é recusado (procedência)", () => {
    const decision = validateExamCandidate(candidate({ bookletUrl: "https://espelho-nao-oficial.com/prova.pdf" }), source);
    expect(decision.action).toBe("skip");
    expect(decision.skipReason).toMatch(/Procedência/);
  });

  it("fonte sem permissão de reutilização não grava nada", () => {
    const decision = validateExamCandidate(candidate(), { ...source, reusePolicy: { ...source.reusePolicy, mode: "none" } });
    expect(decision.action).toBe("skip");
  });

  it("provas de outro nível ou sem as disciplinas do site ficam de fora", () => {
    expect(validateExamCandidate(candidate({ educationLevel: "medio" }), source).action).toBe("skip");
    const noSubject = booklet({ sections: [{ id: "s", title: "Conhecimentos Gerais", firstQuestion: 31, lastQuestion: 33 }] });
    expect(validateExamCandidate(candidate({ booklet: noSubject }), source).action).toBe("skip");
  });

  it("gabarito escaneado (sem texto) vai para revisão em vez de ser ignorado ou inventado", () => {
    const decision = validateExamCandidate(candidate({ answerKey: null, answerKeyHasText: false }), source);
    expect(decision).toMatchObject({ action: "persist", publicationStatus: "pending_validation", verificationStatus: "pending" });
    expect(decision.reviews.map((review) => review.reason)).toEqual(["sem_texto_no_pdf"]);
  });

  it("retificação posterior ao gabarito exige revisão humana", () => {
    const decision = validateExamCandidate(candidate({ laterRectifications: [{ url: INEP_YEAR, title: "Retificação do gabarito" }] }), source);
    expect(decision.publicationStatus).toBe("pending_validation");
    expect(decision.reviews.map((review) => review.reason)).toContain("retificacao_posterior");
  });

  it("muitas alternativas incompletas na extração impedem a publicação automática", () => {
    const broken = booklet();
    broken.questions = broken.questions.map((question) => ({ ...question, options: question.options.slice(0, 2) }));
    expect(validateExamCandidate(candidate({ booklet: broken }), source).reviews.map((review) => review.reason)).toContain("estrutura_incompleta");
  });
});

describe("procedência", () => {
  it("aceita só HTTPS nos hosts oficiais da fonte", () => {
    expect(checkProvenance([INEP_BOOKLET, INEP_YEAR], source).ok).toBe(true);
    expect(checkProvenance(["http://download.inep.gov.br/x.pdf"], source).ok).toBe(false);
    expect(checkProvenance(["https://www.google.com/search?q=prova"], source).ok).toBe(false);
  });
});
