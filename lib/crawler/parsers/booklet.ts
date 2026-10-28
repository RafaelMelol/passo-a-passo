import { OPTION_LETTERS, type OptionLetter, type SubjectId } from "@/types/question";
import type { BookletQuestionDraft, BookletSection } from "../types";
import { foldText } from "../normalizers/text";
import { readingOrderLines, type PdfLine, type PdfPage } from "./pdf-text";

/**
 * Leitura de cadernos de prova: encontra o início de cada questão
 * ("QUESTÃO 31", "Questão 01 -" ou um número sozinho na linha, sempre em sequência),
 * as alternativas (A–E) e os títulos de seção (Língua Portuguesa, Matemática…).
 */

export interface ParsedBookletContent {
  firstQuestion: number;
  lastQuestion: number;
  questionCount: number;
  optionCount: number;
  sections: BookletSection[];
  questions: BookletQuestionDraft[];
  hasTextLayer: boolean;
  warnings: string[];
}

interface HeadingMatch {
  title: string;
  subject?: SubjectId;
}

const OTHER_HEADINGS = [
  "conhecimentos especificos",
  "conhecimentos tecnicos",
  "legislacao",
  "etica no servico publico",
  "nocoes de administracao publica",
];

/** Seções que o site estuda como "Conhecimentos gerais", com o título canônico de cada uma. */
const GENERAL_KNOWLEDGE_HEADINGS: [prefix: string, title: string][] = [
  ["conhecimentos gerais", "Conhecimentos Gerais"],
  ["atualidades", "Atualidades"],
  ["ciencias naturais", "Ciências Naturais"],
  ["ciencias humanas", "Ciências Humanas"],
  ["historia e geografia", "História e Geografia"],
];

/** Reconhece uma linha que é título de seção. */
export function matchSectionHeading(text: string): HeadingMatch | null {
  const clean = text.trim();
  // Títulos são curtos, começam com maiúscula e não têm números nem pontuação final.
  if (clean.length < 4 || clean.length > 90 || /[?.:;]$/.test(clean) || /\d/.test(clean)) return null;
  if (!/^\p{Lu}/u.test(clean) || clean.split(/\s+/).length > 12) return null;
  const folded = foldText(clean);
  if (folded.startsWith("lingua portuguesa") || folded === "portugues" || folded === "conhecimentos de lingua portuguesa") {
    return { title: /estrangeira|artes|educacao fisica/.test(folded) ? "Língua Portuguesa (com língua estrangeira, artes e educação física)" : "Língua Portuguesa", subject: "portugues" };
  }
  if (folded.startsWith("matematica") || folded.startsWith("raciocinio logico") || folded === "conhecimentos de matematica") {
    return { title: folded.startsWith("raciocinio") ? "Raciocínio Lógico" : "Matemática", subject: "matematica" };
  }
  if (/^(nocoes de |conhecimentos de |conhecimentos basicos de )?informatica( basica)?$/.test(folded)) {
    return { title: "Informática", subject: "informatica" };
  }
  const general = GENERAL_KNOWLEDGE_HEADINGS.find(([prefix]) => folded.startsWith(prefix));
  if (general) return { title: general[1], subject: "conhecimentos-gerais" };
  if (OTHER_HEADINGS.some((heading) => folded.startsWith(heading))) return { title: clean };
  return null;
}

const QUESTION_START = /^quest[aã]o\s*0*(\d{1,3})\b\s*[-–.:)]?\s*(.*)$/i;
const BARE_NUMBER = /^0*(\d{1,3})$/;

function detectOption(line: PdfLine, expected: OptionLetter): string | null {
  const first = line.items[0];
  if (!first) return null;
  const firstText = first.text.trim();
  // "(A) texto" no mesmo trecho
  const parenthesized = /^\(([A-E])\)\s*(.*)$/.exec(firstText);
  if (parenthesized && parenthesized[1] === expected) {
    const rest = [parenthesized[2], ...line.items.slice(1).map((item) => item.text)].join(" ").trim();
    return rest;
  }
  // "A) texto"
  const closing = /^([A-E])\)\s*(.*)$/.exec(firstText);
  if (closing && closing[1] === expected) return [closing[2], ...line.items.slice(1).map((item) => item.text)].join(" ").trim();
  // Letra isolada como trecho separado, seguida do texto um pouco à direita (formato do Inep).
  if (firstText === expected && line.items.length > 1) {
    const gap = line.items[1].x - (first.x + first.width);
    if (gap >= 2) return line.items.slice(1).map((item) => item.text).join(" ").trim();
  }
  return null;
}

export function parseBookletPages(pages: readonly PdfPage[], options: { defaultSection?: HeadingMatch; defaultOptionCount?: number } = {}): ParsedBookletContent {
  const warnings: string[] = [];
  const questions: (BookletQuestionDraft & { lines: string[]; nextOption: number })[] = [];
  let pendingSection: HeadingMatch | null = options.defaultSection ?? null;
  let currentSection: HeadingMatch | null = pendingSection;
  let expected: number | null = null;
  let hasTextLayer = false;

  const pageLines = pages.map((page) => ({ page, lines: readingOrderLines(page) }));
  // Se o caderno usa "QUESTÃO N", números soltos (como os de página) são ignorados.
  const explicitCount = pageLines.reduce((sum, { lines }) => sum + lines.filter((line) => QUESTION_START.test(line.text)).length, 0);
  const explicitOnly = explicitCount >= 3;

  for (const { page, lines } of pageLines) {
    if (lines.length > 0) hasTextLayer = true;
    for (const line of lines) {
      const text = line.text;
      const heading = matchSectionHeading(text);
      if (heading) {
        pendingSection = heading;
        continue;
      }

      const explicit = QUESTION_START.exec(text);
      const bare = BARE_NUMBER.exec(text);
      let startNumber: number | null = null;
      let rest = "";
      if (explicit) {
        const n = Number(explicit[1]);
        if (expected === null || n === expected) {
          startNumber = n;
          rest = explicit[2] ?? "";
        }
      } else if (bare && !explicitOnly) {
        const n = Number(bare[1]);
        if ((expected === null && n === 1) || (expected !== null && n === expected)) startNumber = n;
      }

      if (startNumber !== null) {
        if (pendingSection) currentSection = pendingSection;
        pendingSection = null;
        questions.push({
          number: startNumber,
          text: "",
          options: [],
          page: page.number,
          sectionTitle: currentSection?.title,
          lines: rest ? [rest] : [],
          nextOption: 0,
        });
        expected = startNumber + 1;
        continue;
      }

      const current = questions[questions.length - 1];
      if (!current) continue;
      const expectedLetter = OPTION_LETTERS[current.nextOption];
      const optionText = expectedLetter ? detectOption(line, expectedLetter) : null;
      if (optionText !== null && expectedLetter) {
        current.options.push({ letter: expectedLetter, text: optionText });
        current.nextOption++;
        continue;
      }
      if (current.options.length > 0) {
        // Continuação da última alternativa.
        const last = current.options[current.options.length - 1];
        last.text = `${last.text} ${text}`.trim();
      } else {
        current.lines.push(text);
      }
    }
  }

  const drafts: BookletQuestionDraft[] = questions.map(({ lines, nextOption: _next, ...question }) => {
    void _next;
    return { ...question, text: lines.join(" ").replace(/\s+/g, " ").trim() };
  });

  if (drafts.length === 0) {
    return { firstQuestion: 0, lastQuestion: 0, questionCount: 0, optionCount: 0, sections: [], questions: [], hasTextLayer, warnings: ["Nenhuma questão encontrada no caderno."] };
  }

  // Número de alternativas mais comum entre as questões em que foi possível detectá-las.
  const counts = new Map<number, number>();
  for (const draft of drafts) if (draft.options.length >= 2) counts.set(draft.options.length, (counts.get(draft.options.length) ?? 0) + 1);
  const [mostCommon, frequency] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [0, 0];
  let optionCount = mostCommon;
  if (frequency < drafts.length / 2) {
    warnings.push("Não foi possível identificar as alternativas na maior parte das questões.");
    optionCount = options.defaultOptionCount ?? mostCommon;
  }
  const incomplete = drafts.filter((draft) => draft.options.length !== optionCount).map((draft) => draft.number);
  if (incomplete.length > 0) warnings.push(`Alternativas incompletas na extração das questões: ${incomplete.slice(0, 15).join(", ")}${incomplete.length > 15 ? "…" : ""}.`);

  const firstQuestion = drafts[0].number;
  const lastQuestion = drafts[drafts.length - 1].number;

  const sections: BookletSection[] = [];
  for (const draft of drafts) {
    const title = draft.sectionTitle ?? "Prova";
    const last = sections[sections.length - 1];
    if (last && last.title === title) last.lastQuestion = draft.number;
    else {
      const heading = title === "Prova" ? null : matchSectionHeading(title) ?? (options.defaultSection?.title === title ? options.defaultSection : null);
      sections.push({
        id: `secao-${sections.length + 1}`,
        title,
        ...(heading?.subject ? { subject: heading.subject } : {}),
        firstQuestion: draft.number,
        lastQuestion: draft.number,
      });
    }
  }

  return {
    firstQuestion,
    lastQuestion,
    questionCount: lastQuestion - firstQuestion + 1,
    optionCount,
    sections,
    questions: drafts,
    hasTextLayer,
    warnings,
  };
}
