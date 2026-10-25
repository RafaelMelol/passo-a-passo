import { createHash } from "node:crypto";
import { OPTION_LETTERS, type OptionLetter } from "@/types/question";

/** Remove acentos, deixa minúsculo e junta espaços (para comparar textos). */
export function foldText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Limpa o texto extraído: hifenização no fim da linha, espaços repetidos e caracteres de controle. */
export function normalizeExtractedText(text: string): string {
  return text
    .normalize("NFC")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/(\p{L})-\s*\n\s*(\p{Ll})/gu, "$1$2")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, " ")
    .trim();
}

/** Forma canônica para hash: sem acentos, pontuação ou diferenças de espaço. */
export function canonicalForHash(text: string): string {
  return foldText(normalizeExtractedText(text))
    .replace(/[“”"'‘’`´]/g, "")
    .replace(/[^\p{L}\p{N}%]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

/** Hash do enunciado + alternativas normalizados (detecta a mesma questão vinda de outra fonte). */
export function statementHash(statement: string, options: readonly { text: string }[] = []): string {
  return sha256(`${canonicalForHash(statement)}|${options.map((option) => canonicalForHash(option.text)).join("|")}`);
}

/**
 * Separa enunciado e alternativas de um texto corrido como
 * "Quanto é 2+2? (A) 3 (B) 4 (C) 5 (D) 6". `complete` indica sequência A, B, C… sem falhas.
 */
export function extractOptions(text: string): { stem: string; options: { letter: OptionLetter; text: string }[]; complete: boolean } {
  const normalized = normalizeExtractedText(text);
  const markers = [...normalized.matchAll(/(?:^|\s)\(?([A-E])\)\s+/g)];
  const options: { letter: OptionLetter; text: string }[] = [];
  let expectedIndex = 0;
  let stemEnd = normalized.length;
  const accepted: { letter: OptionLetter; start: number; contentStart: number }[] = [];
  for (const marker of markers) {
    const letter = marker[1] as OptionLetter;
    if (letter !== OPTION_LETTERS[expectedIndex]) continue;
    const start = marker.index ?? 0;
    accepted.push({ letter, start, contentStart: start + marker[0].length });
    expectedIndex++;
  }
  if (accepted.length > 0) stemEnd = accepted[0].start;
  accepted.forEach((entry, index) => {
    const end = index + 1 < accepted.length ? accepted[index + 1].start : normalized.length;
    options.push({ letter: entry.letter, text: normalized.slice(entry.contentStart, end).trim() });
  });
  const complete = options.length >= 2 && options.every((option) => option.text.length > 0);
  return { stem: normalized.slice(0, stemEnd).trim(), options, complete };
}

function trigrams(text: string): Map<string, number> {
  const padded = `  ${canonicalForHash(text)} `;
  const grams = new Map<string, number>();
  for (let i = 0; i < padded.length - 2; i++) {
    const gram = padded.slice(i, i + 3);
    grams.set(gram, (grams.get(gram) ?? 0) + 1);
  }
  return grams;
}

/** Semelhança de 0 a 1 (coeficiente de Dice sobre trigramas). */
export function similarity(a: string, b: string): number {
  const ga = trigrams(a);
  const gb = trigrams(b);
  let overlap = 0;
  let total = 0;
  for (const [gram, count] of ga) {
    overlap += Math.min(count, gb.get(gram) ?? 0);
    total += count;
  }
  for (const count of gb.values()) total += count;
  return total === 0 ? 0 : (2 * overlap) / total;
}

function numbersIn(text: string): string {
  return (normalizeExtractedText(text).match(/\d+(?:[.,]\d+)*/g) ?? []).join("|");
}

/**
 * Duas questões só são consideradas a mesma quando o texto é praticamente igual
 * E os números citados são idênticos (evita juntar "10% de 200" com "10% de 250").
 */
export function isNearDuplicate(a: string, b: string, threshold = 0.92): boolean {
  if (numbersIn(a) !== numbersIn(b)) return false;
  return similarity(a, b) >= threshold;
}
