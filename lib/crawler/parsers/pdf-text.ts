/**
 * Extração de texto de PDF com posição de cada trecho (pdf.js via unpdf).
 * O PDF é tratado como dado não confiável: só lemos o texto, sem executar scripts
 * nem seguir links, e com limite de páginas.
 */

export interface PdfTextItem {
  text: string;
  x: number;
  y: number;
  width: number;
}

export interface PdfLine {
  y: number;
  x: number;
  items: PdfTextItem[];
  text: string;
}

export interface PdfPage {
  number: number;
  width: number;
  height: number;
  items: PdfTextItem[];
}

export async function extractPdfPages(data: Uint8Array, maxPages = 80): Promise<PdfPage[]> {
  const { getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(data), { verbosity: 0 });
  const pages: PdfPage[] = [];
  try {
    const total = Math.min(pdf.numPages, maxPages);
    for (let number = 1; number <= total; number++) {
      const page = await pdf.getPage(number);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      const items: PdfTextItem[] = [];
      for (const raw of content.items) {
        if (!("str" in raw)) continue;
        const text = raw.str.replace(/\s+/g, " ");
        if (!text.trim()) continue;
        items.push({ text, x: raw.transform[4], y: raw.transform[5], width: raw.width });
      }
      pages.push({ number, width: viewport.width, height: viewport.height, items });
      page.cleanup();
    }
  } finally {
    // Libera a memória do documento (o nome do método varia entre versões do pdf.js).
    const disposable = pdf as unknown as { destroy?: () => Promise<void>; cleanup?: () => Promise<void> };
    if (typeof disposable.destroy === "function") await disposable.destroy();
    else if (typeof disposable.cleanup === "function") await disposable.cleanup();
  }
  return pages;
}

/** Agrupa trechos na mesma altura (tolerância em pontos) em linhas, da esquerda para a direita. */
export function buildLines(items: readonly PdfTextItem[], tolerance = 2.5): PdfLine[] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: PdfLine[] = [];
  for (const item of sorted) {
    const line = lines.find((candidate) => Math.abs(candidate.y - item.y) <= tolerance);
    if (line) line.items.push(item);
    else lines.push({ y: item.y, x: item.x, items: [item], text: "" });
  }
  for (const line of lines) {
    line.items.sort((a, b) => a.x - b.x);
    line.x = line.items[0].x;
    let text = "";
    let end = -Infinity;
    for (const item of line.items) {
      const gap = item.x - end;
      text += text && gap > 1 && !text.endsWith(" ") && !item.text.startsWith(" ") ? ` ${item.text}` : item.text;
      end = item.x + item.width;
    }
    line.text = text.replace(/\s+/g, " ").trim();
  }
  return lines.sort((a, b) => b.y - a.y);
}

/**
 * Ordem de leitura de uma página: detecta layout em duas colunas
 * (muitas linhas estreitas à esquerda e muitas linhas começando à direita).
 */
export function readingOrderLines(page: PdfPage): PdfLine[] {
  const middle = page.width / 2;
  const all = buildLines(page.items);
  // Duas colunas: há linhas dos dois lados do meio e quase nenhum trecho atravessa o meio da página.
  const leftItems = page.items.filter((item) => item.x < middle - 5);
  const rightItems = page.items.filter((item) => item.x >= middle - 5);
  const crossing = page.items.filter((item) => item.x < middle - 8 && item.x + item.width > middle + 8).length;
  const leftRows = new Set(leftItems.filter((item) => item.x + item.width < middle + 10).map((item) => Math.round(item.y))).size;
  const rightRows = new Set(rightItems.map((item) => Math.round(item.y))).size;
  const narrowLeftLines = all.filter((line) => {
    const last = line.items[line.items.length - 1];
    return line.x < middle - 10 && last.x + last.width < middle + 10;
  }).length;
  const rightStartLines = all.filter((line) => line.x > middle - 5).length;
  const twoColumns =
    (narrowLeftLines >= 5 && rightStartLines >= 5) || (leftRows >= 2 && rightRows >= 2 && crossing <= Math.max(1, page.items.length * 0.05));
  if (!twoColumns) return all;
  return [...buildLines(leftItems), ...buildLines(rightItems)];
}

/** Divide trechos com espaços em "tokens", estimando a posição horizontal de cada um. */
export function lineTokens(line: PdfLine): { text: string; x: number }[] {
  const tokens: { text: string; x: number }[] = [];
  for (const item of line.items) {
    const charWidth = item.text.length > 0 ? item.width / item.text.length : 0;
    const regex = /\S+/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(item.text))) {
      tokens.push({ text: match[0], x: item.x + match.index * charWidth + (match[0].length * charWidth) / 2 });
    }
  }
  return tokens;
}
