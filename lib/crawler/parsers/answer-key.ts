import { OPTION_LETTERS, type OptionLetter } from "@/types/question";
import type { AnswerKeyEntry } from "../types";
import { buildLines, lineTokens, type PdfPage } from "./pdf-text";

/**
 * Leitura de gabaritos oficiais em PDF. Suporta os dois formatos encontrados:
 * - linhas de números seguidas de linhas de letras (FGV), alinhadas pela posição horizontal;
 * - tabela "QUESTÃO  GABARITO" com número e letra na mesma linha (Inep).
 * Marcas de anulação ("*", "X", "ANULADA") viram resposta nula.
 */

export interface AnswerKeyBlock {
  label: string;
  bookletType: string | null;
  entries: AnswerKeyEntry[];
  page: number;
}

export interface ParsedAnswerKeyDocument {
  headerVersion: "preliminar" | "definitivo" | null;
  blocks: AnswerKeyBlock[];
  hasText: boolean;
  warnings: string[];
}

const ANNUL_MARKERS = new Set(["*", "X", "ANULADA", "ANULADO", "NULA", "ANUL", "ANUL."]);
const HEADER_REGEX = /^(.{3,120}?)\s*[-–—]\s*tipo\s*0?(\d{1,2})\b/i;

function normalizeMarker(token: string): OptionLetter | null | undefined {
  const upper = token.toUpperCase().replace(/[()]/g, "");
  if ((OPTION_LETTERS as readonly string[]).includes(upper)) return upper as OptionLetter;
  if (ANNUL_MARKERS.has(upper)) return null;
  return undefined; // não é marca de gabarito
}

function isInteger(token: string): boolean {
  return /^\d{1,3}$/.test(token);
}

function finalizeBlock(block: { label: string; bookletType: string | null; map: Map<number, OptionLetter | null>; page: number } | null, out: AnswerKeyBlock[]) {
  if (!block || block.map.size === 0) return;
  const entries = [...block.map.entries()].sort((a, b) => a[0] - b[0]).map(([number, answer]) => ({ number, answer }));
  out.push({ label: block.label, bookletType: block.bookletType, entries, page: block.page });
}

export function parseAnswerKeyPages(pages: readonly PdfPage[], defaultLabel = "Gabarito"): ParsedAnswerKeyDocument {
  const blocks: AnswerKeyBlock[] = [];
  const warnings: string[] = [];
  let headerVersion: "preliminar" | "definitivo" | null = null;
  let hasText = false;
  let current: { label: string; bookletType: string | null; map: Map<number, OptionLetter | null>; page: number } | null = null;
  const titleLines: string[] = [];

  for (const page of pages) {
    const lines = buildLines(page.items);
    if (lines.length > 0) hasText = true;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const upper = line.text.toUpperCase();
      if (!headerVersion && /\bDEFINITIV[OA]S?\b/.test(upper)) headerVersion = "definitivo";
      else if (!headerVersion && /\bPRELIMINAR(ES)?\b/.test(upper)) headerVersion = "preliminar";

      const header = HEADER_REGEX.exec(line.text);
      if (header && !/^\d/.test(line.text)) {
        finalizeBlock(current, blocks);
        current = { label: header[1].trim(), bookletType: `Tipo ${Number(header[2])}`, map: new Map(), page: page.number };
        continue;
      }

      const tokens = lineTokens(line);
      if (tokens.length === 0) continue;

      // Formato FGV: linha só com números crescentes, seguida da linha de letras.
      if (tokens.length >= 3 && tokens.every((token) => isInteger(token.text))) {
        const numbers = tokens.map((token) => ({ n: Number(token.text), x: token.x }));
        const ascending = numbers.every((entry, index) => index === 0 || entry.n === numbers[index - 1].n + 1);
        const next = lines[i + 1];
        const letterTokens = next ? lineTokens(next) : [];
        const allMarkers = letterTokens.length > 0 && letterTokens.every((token) => normalizeMarker(token.text) !== undefined);
        if (ascending && allMarkers) {
          // Uma nova sequência que recomeça (ex.: de novo a partir do 1) é outro bloco, mesmo sem cabeçalho legível.
          if (current && current.map.size > 0 && numbers[0].n <= Math.max(...current.map.keys())) {
            finalizeBlock(current, blocks);
            current = { label: `${defaultLabel} (bloco ${blocks.length + 1})`, bookletType: null, map: new Map(), page: page.number };
          }
          if (!current) current = { label: titleLines.join(" ") || defaultLabel, bookletType: null, map: new Map(), page: page.number };
          for (const letter of letterTokens) {
            let best: { n: number; distance: number } | null = null;
            for (const number of numbers) {
              const distance = Math.abs(number.x - letter.x);
              if (!best || distance < best.distance) best = { n: number.n, distance };
            }
            if (best && best.distance <= 18) current.map.set(best.n, normalizeMarker(letter.text) ?? null);
          }
          if (letterTokens.length !== numbers.length) {
            warnings.push(`Linha de gabarito com ${numbers.length} números e ${letterTokens.length} marcações (página ${page.number}).`);
          }
          i++;
          continue;
        }
      }

      // Formato Inep: pares "número letra" na mesma linha (pode haver mais de um par por linha).
      if (tokens.length >= 2 && tokens.length % 2 === 0) {
        const pairs: [number, OptionLetter | null][] = [];
        let valid = true;
        for (let t = 0; t < tokens.length; t += 2) {
          const marker = normalizeMarker(tokens[t + 1].text);
          if (!isInteger(tokens[t].text) || marker === undefined) {
            valid = false;
            break;
          }
          pairs.push([Number(tokens[t].text), marker]);
        }
        if (valid) {
          if (!current) current = { label: titleLines.join(" ") || defaultLabel, bookletType: null, map: new Map(), page: page.number };
          for (const [n, answer] of pairs) current.map.set(n, answer);
          continue;
        }
      }

      // Linhas de título antes do primeiro bloco ajudam a nomear o gabarito (ex.: "Matemática").
      if (!current && line.text.length <= 120 && !/\d{2,}/.test(line.text)) titleLines.push(line.text);
    }
  }
  finalizeBlock(current, blocks);
  return { headerVersion, blocks, hasText, warnings };
}

/** Verifica se os números do bloco formam uma sequência contínua. */
export function isContiguous(entries: readonly AnswerKeyEntry[]): boolean {
  return entries.every((entry, index) => index === 0 || entry.number === entries[index - 1].number + 1);
}
