// @vitest-environment node
import { describe, expect, it } from "vitest";
import { chooseYearPages, parseInepIndex, parseInepYearPage } from "@/lib/crawler/adapters/inep-encceja";
import type { AdapterContext } from "@/lib/crawler/adapters/types";
import { isContiguous, parseAnswerKeyPages } from "@/lib/crawler/parsers/answer-key";
import { matchSectionHeading, parseBookletPages } from "@/lib/crawler/parsers/booklet";
import { extractPdfPages } from "@/lib/crawler/parsers/pdf-text";
import { INEP_INDEX, INEP_INDEX_HTML, INEP_KEY, INEP_YEAR, INEP_YEAR_HTML, INEP_BOOKLET } from "../helpers/crawler";
import { inepAnswerKeyPdf, inepBookletPdf, makePdf } from "../helpers/make-pdf";

describe("gabarito em PDF", () => {
  it("lê o formato da FGV (linha de números + linha de letras), com anulada e versão do cabeçalho", async () => {
    const numbers = Array.from({ length: 10 }, (_, i) => ({ x: 40 + i * 27, y: 670, text: String(i + 1) }));
    const letters = "CBEEBA*CAE".split("").map((letter, i) => ({ x: 40 + i * 27, y: 649, text: letter }));
    const numbers2 = Array.from({ length: 10 }, (_, i) => ({ x: 40 + i * 27, y: 560, text: String(i + 1) }));
    const letters2 = "ABCDEABCDE".split("").map((letter, i) => ({ x: 40 + i * 27, y: 540, text: letter }));
    const pdf = makePdf([
      [
        { x: 200, y: 760, text: "GABARITOS DEFINITIVOS" },
        { x: 36, y: 690, text: "Auxiliar de Serviços Gerais – Tipo 1" },
        ...numbers,
        ...letters,
        { x: 36, y: 600, text: "Auxiliar Administrativo – Tipo 2" },
        ...numbers2,
        ...letters2,
        { x: 36, y: 500, text: "(*) Questão anulada" },
      ],
    ]);
    const result = parseAnswerKeyPages(await extractPdfPages(pdf));
    expect(result.headerVersion).toBe("definitivo");
    expect(result.blocks).toHaveLength(2);
    const [first, second] = result.blocks;
    expect(first.label).toBe("Auxiliar de Serviços Gerais");
    expect(first.bookletType).toBe("Tipo 1");
    expect(first.entries.map((entry) => entry.answer ?? "*").join("")).toBe("CBEEBA*CAE");
    expect(first.entries[6]).toEqual({ number: 7, answer: null });
    expect(second.bookletType).toBe("Tipo 2");
    expect(isContiguous(first.entries)).toBe(true);
  });

  it("lê o formato do Inep (pares número e letra)", async () => {
    const result = parseAnswerKeyPages(await extractPdfPages(inepAnswerKeyPdf(31, "BCDAB")));
    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0].entries).toEqual([
      { number: 31, answer: "B" },
      { number: 32, answer: "C" },
      { number: 33, answer: "D" },
      { number: 34, answer: "A" },
      { number: 35, answer: "B" },
    ]);
    expect(result.headerVersion).toBeNull();
  });

  it("PDF sem texto (escaneado) não gera gabarito inventado", async () => {
    const result = parseAnswerKeyPages(await extractPdfPages(makePdf([[]])));
    expect(result.hasText).toBe(false);
    expect(result.blocks).toEqual([]);
  });
});

describe("caderno de prova em PDF", () => {
  it("encontra as questões 'QUESTÃO N', ignora números de página e lê as alternativas", async () => {
    const booklet = parseBookletPages(await extractPdfPages(inepBookletPdf(31, 5)), { defaultOptionCount: 4 });
    expect(booklet.firstQuestion).toBe(31);
    expect(booklet.lastQuestion).toBe(35);
    expect(booklet.questionCount).toBe(5);
    expect(booklet.optionCount).toBe(4);
    expect(booklet.questions[0].options.map((option) => option.letter)).toEqual(["A", "B", "C", "D"]);
    expect(booklet.questions[0].text).toContain("Uma loja vendeu 31 cadernos");
    expect(booklet.sections).toEqual([{ id: "secao-1", title: "Matemática", subject: "matematica", firstQuestion: 31, lastQuestion: 35 }]);
    expect(booklet.warnings).toEqual([]);
  });

  it("lê caderno em duas colunas com títulos de seção e alternativas '(A)'", async () => {
    const left = [
      { x: 36, y: 800, text: "Língua Portuguesa" },
      { x: 36, y: 780, text: "01" },
      { x: 36, y: 765, text: "Assinale a palavra escrita corretamente." },
      { x: 36, y: 750, text: "(A) excessão" },
      { x: 36, y: 735, text: "(B) exceção" },
      { x: 36, y: 720, text: "(C) esceção" },
      { x: 36, y: 700, text: "02" },
      { x: 36, y: 685, text: "Qual é o antônimo de alegre?" },
      { x: 36, y: 670, text: "(A) triste" },
      { x: 36, y: 655, text: "(B) contente" },
      { x: 36, y: 640, text: "(C) feliz" },
    ];
    const right = [
      { x: 320, y: 800, text: "Matemática" },
      { x: 320, y: 780, text: "03" },
      { x: 320, y: 765, text: "Quanto é 10% de 200?" },
      { x: 320, y: 750, text: "(A) 2" },
      { x: 320, y: 735, text: "(B) 20" },
      { x: 320, y: 720, text: "(C) 200" },
    ];
    const booklet = parseBookletPages(await extractPdfPages(makePdf([[...left, ...right]])));
    expect(booklet.questionCount).toBe(3);
    expect(booklet.optionCount).toBe(3);
    expect(booklet.sections.map((section) => [section.title, section.subject, section.firstQuestion, section.lastQuestion])).toEqual([
      ["Língua Portuguesa", "portugues", 1, 2],
      ["Matemática", "matematica", 3, 3],
    ]);
  });

  it("avisa quando as alternativas estão incompletas", async () => {
    const pdf = makePdf([
      [
        { x: 30, y: 800, text: "QUESTÃO 1" },
        { x: 30, y: 780, text: "Enunciado completo da primeira questão de teste." },
        { x: 30, y: 760, text: "(A) um" },
        { x: 30, y: 745, text: "(B) dois" },
        { x: 30, y: 730, text: "(C) três" },
        { x: 30, y: 700, text: "QUESTÃO 2" },
        { x: 30, y: 680, text: "Enunciado da segunda questão, com alternativas faltando." },
        { x: 30, y: 660, text: "(A) um" },
        { x: 30, y: 600, text: "QUESTÃO 3" },
        { x: 30, y: 580, text: "Terceira questão de teste." },
        { x: 30, y: 560, text: "(A) um" },
        { x: 30, y: 545, text: "(B) dois" },
        { x: 30, y: 530, text: "(C) três" },
      ],
    ]);
    const booklet = parseBookletPages(await extractPdfPages(pdf));
    expect(booklet.optionCount).toBe(3);
    expect(booklet.warnings.join(" ")).toMatch(/incompletas.*2/);
  });

  it("reconhece títulos de seção e recusa frases comuns", () => {
    expect(matchSectionHeading("Noções de Informática")).toEqual({ title: "Informática", subject: "informatica" });
    expect(matchSectionHeading("Conhecimentos Gerais")).toEqual({ title: "Conhecimentos Gerais", subject: "conhecimentos-gerais" });
    expect(matchSectionHeading("CIÊNCIAS NATURAIS")).toEqual({ title: "Ciências Naturais", subject: "conhecimentos-gerais" });
    expect(matchSectionHeading("História e Geografia")).toEqual({ title: "História e Geografia", subject: "conhecimentos-gerais" });
    expect(matchSectionHeading("Conhecimentos Específicos")).toEqual({ title: "Conhecimentos Específicos" });
    expect(matchSectionHeading("língua portuguesa sobre o tema do texto")).toBeNull();
    expect(matchSectionHeading("Matemática 2020")).toBeNull();
  });
});

describe("rodízio de anos do Inep", () => {
  const years = [2026, 2025, 2024, 2023, 2020, 2018, 2017].map((year) => ({ year, url: `https://www.gov.br/inep/encceja/${year}` }));

  function fakeContext(pages: Record<number, { checked?: string; booklets?: number; failed?: number }>): AdapterContext {
    const byUrl = (url: string) => pages[Number(url.split("/").pop())] ?? {};
    return {
      documentStatus: async (url: string) => {
        const page = byUrl(url);
        return page.checked ? { status: "processed", processedAt: page.checked, lastCheckedAt: page.checked } : null;
      },
      failedChildren: async (url: string) => byUrl(url).failed ?? 0,
      bookletChildren: async (url: string) => byUrl(url).booklets ?? 0,
    } as unknown as AdapterContext;
  }

  it("revisita primeiro os anos com cadernos lidos antes das áreas novas, depois os nunca vistos", async () => {
    const chosen = await chooseYearPages(
      fakeContext({
        2024: { checked: "2026-10-25T10:00:00Z" },
        2023: { checked: "2026-10-25T10:00:00Z" },
        2020: { checked: "2026-10-25T10:00:00Z", booklets: 4 },
        2018: { checked: "2026-10-28T19:00:00Z", booklets: 8 },
      }),
      years,
    );
    // 2026 e 2025 sempre; 2020 tem cadernos e foi lido antes da mudança; 2017 nunca foi visitado.
    expect(chosen.map((link) => link.year)).toEqual([2026, 2025, 2020, 2017]);
  });

  it("anos com documentos que falharam continuam na frente", async () => {
    const chosen = await chooseYearPages(fakeContext({ 2023: { checked: "2026-10-29T10:00:00Z", failed: 2 }, 2020: { checked: "2026-10-25T10:00:00Z", booklets: 4 } }), years);
    expect(chosen.map((link) => link.year)).toEqual([2026, 2025, 2023, 2020]);
  });
});

describe("páginas do Inep (HTML)", () => {
  it("lê os links por ano da página principal", () => {
    expect(parseInepIndex(INEP_INDEX_HTML, INEP_INDEX)).toEqual([{ year: 2020, url: INEP_YEAR }]);
  });

  it("separa grupos, ignora variantes acessíveis e pega só prova e gabarito principais", () => {
    const groups = parseInepYearPage(INEP_YEAR_HTML, INEP_YEAR, 2020);
    expect(groups.map((group) => [group.level, group.area, Boolean(group.bookletUrl), Boolean(group.answerKeyUrl)])).toEqual([
      ["fundamental", "matematica", true, true],
      ["fundamental", "ciencias", true, true],
      ["medio", "matematica", true, true],
      ["fundamental", "portugues", false, true],
    ]);
    expect(groups[0]).toMatchObject({ bookletUrl: INEP_BOOKLET, answerKeyUrl: INEP_KEY, application: "Aplicação regular" });
  });
});
