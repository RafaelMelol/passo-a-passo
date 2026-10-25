// @vitest-environment node
import { describe, expect, it } from "vitest";
import { classifyQuestion, classifyTopic, estimateDifficulty, levelFlags, subjectFromSection } from "@/lib/crawler/classification/classify";
import { parseAnswerKeyPages } from "@/lib/crawler/parsers/answer-key";
import { extractPdfPages } from "@/lib/crawler/parsers/pdf-text";
import {
  canonicalForHash,
  extractOptions,
  isNearDuplicate,
  normalizeExtractedText,
  similarity,
  statementHash,
} from "@/lib/crawler/normalizers/text";
import { makePdf } from "../helpers/make-pdf";

describe("normalização de enunciados", () => {
  it("junta palavras hifenizadas na quebra de linha e limpa espaços", () => {
    expect(normalizeExtractedText("A pro-\nva tem   dez\nquestões.")).toBe("A prova tem dez questões.");
  });

  it("o hash ignora acentos, maiúsculas, pontuação e espaços, mas não os números", () => {
    const a = statementHash("Quanto é 10% de 200?", [{ text: "20" }, { text: "2" }]);
    const b = statementHash("  QUANTO E 10%  de 200 ", [{ text: "20" }, { text: "2" }]);
    const c = statementHash("Quanto é 10% de 250?", [{ text: "20" }, { text: "2" }]);
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(canonicalForHash("Ação, É!")).toBe("acao e");
  });
});

describe("extração de alternativas", () => {
  it("separa enunciado e alternativas em sequência", () => {
    const result = extractOptions("Quanto é 2 + 2? (A) 3 (B) 4 (C) 5 (D) 6");
    expect(result.stem).toBe("Quanto é 2 + 2?");
    expect(result.options.map((option) => `${option.letter}:${option.text}`)).toEqual(["A:3", "B:4", "C:5", "D:6"]);
    expect(result.complete).toBe(true);
  });

  it("identifica alternativas incompletas ou fora de ordem", () => {
    expect(extractOptions("Enunciado sem alternativas").complete).toBe(false);
    const skipped = extractOptions("Pergunta? (A) um (C) três");
    expect(skipped.options.map((option) => option.letter)).toEqual(["A"]);
    expect(skipped.complete).toBe(false);
  });
});

describe("duplicidade aproximada", () => {
  it("considera iguais textos quase idênticos com os mesmos números", () => {
    expect(isNearDuplicate("Quanto é 10% de 200 reais?", "Quanto é 10% de 200 reais ?")).toBe(true);
    expect(similarity("abc def", "abc def")).toBe(1);
  });

  it("não junta questões diferentes só porque o texto é parecido", () => {
    expect(isNearDuplicate("Quanto é 10% de 200 reais?", "Quanto é 10% de 250 reais?")).toBe(false);
    expect(isNearDuplicate("Qual é o sinônimo de alegre?", "Qual é o antônimo de alegre?")).toBe(false);
  });
});

describe("gabarito sem cabeçalho legível", () => {
  it("uma sequência que recomeça vira outro bloco, sem sobrescrever o anterior", async () => {
    const row = (y: number, items: string[]) => items.map((text, i) => ({ x: 40 + i * 27, y, text }));
    const pdf = makePdf([[...row(700, ["1", "2", "3"]), ...row(680, ["A", "B", "C"]), ...row(600, ["1", "2", "3"]), ...row(580, ["D", "D", "D"])]]);
    const result = parseAnswerKeyPages(await extractPdfPages(pdf));
    expect(result.blocks.map((block) => block.entries.map((entry) => entry.answer).join(""))).toEqual(["ABC", "DDD"]);
  });
});

describe("classificação de disciplina, assunto e dificuldade", () => {
  it("a disciplina vem do título da seção do caderno", () => {
    expect(subjectFromSection("Língua Portuguesa")).toBe("portugues");
    expect(subjectFromSection("Raciocínio Lógico")).toBe("matematica");
    expect(subjectFromSection("Noções de Informática")).toBe("informatica");
    expect(subjectFromSection("Conhecimentos Gerais")).toBeNull();
  });

  it("classifica assuntos por palavras-chave", () => {
    expect(classifyTopic("matematica", "Um produto de R$ 80,00 teve desconto de 25%. Qual o novo preço?").topic).toBe("porcentagem");
    expect(classifyTopic("portugues", "Assinale a frase em que o acento grave indicativo de crase foi usado corretamente.").topic).toBe("gramatica-aplicada");
    expect(classifyTopic("informatica", "No Excel, qual fórmula soma as células A1 até A5 da planilha?").topic).toBe("excel");
  });

  it("deixa sem assunto quando não há evidência suficiente", () => {
    const result = classifyTopic("portugues", "Leia com atenção.");
    expect(result.topic).toBeNull();
  });

  it("estima dificuldade maior para questões com várias etapas e afirmativas", () => {
    expect(estimateDifficulty("Quanto é 2 + 3?").difficulty).toBe("facil");
    const hard = estimateDifficulty(
      "Analise as afirmativas I, II e III. Sabendo que João gastou 1/3 de R$ 900, depois 25% do restante e ao final pagou R$ 45 de taxa, qual afirmativa NÃO está correta considerando que cada parcela foi de 12, 18 e 30 reais?",
      5,
    );
    expect(hard.difficulty).toBe("dificil");
    expect(hard.confidence).toBeLessThanOrEqual(0.6);
  });

  it("sinaliza conteúdos acima do nível fundamental sem bloquear nada", () => {
    expect(levelFlags("Calcule o logaritmo de 100 na base 10.")).toEqual(["logaritmos"]);
    expect(levelFlags("Quanto é 3 x 4?")).toEqual([]);
  });

  it("registra o método usado", () => {
    expect(classifyQuestion({ text: "Quanto é 10% de 50?", sectionSubject: "matematica" })).toMatchObject({
      subject: "matematica",
      topic: "porcentagem",
      method: "regras-palavras-chave-v1",
    });
  });
});
