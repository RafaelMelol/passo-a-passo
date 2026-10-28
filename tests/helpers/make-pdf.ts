/**
 * Gera PDFs mínimos (texto em posições fixas, fonte Helvetica) para os testes.
 * Assim os testes não dependem de documentos baixados da internet.
 */

export interface PdfTextLine {
  x: number;
  y: number;
  text: string;
  size?: number;
}

function escapePdfText(text: string): string {
  // Travessões não existem em Latin-1: usa os códigos da codificação WinAnsi (em octal).
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/–/g, "\\226")
    .replace(/—/g, "\\227");
}

export function makePdf(pages: PdfTextLine[][], options: { width?: number; height?: number } = {}): Uint8Array {
  const width = options.width ?? 595;
  const height = options.height ?? 842;
  const objects: string[] = [];
  const pageCount = pages.length;
  const fontId = 3 + pageCount * 2;

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pages.map((_, i) => `${3 + i * 2} 0 R`).join(" ")}] /Count ${pageCount} >>`;
  pages.forEach((lines, i) => {
    const pageId = 3 + i * 2;
    const contentId = pageId + 1;
    const content = lines
      .map((line) => `BT /F1 ${line.size ?? 10} Tf 1 0 0 1 ${line.x} ${line.y} Tm (${escapePdfText(line.text)}) Tj ET`)
      .join("\n");
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`;
  });
  objects[fontId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";

  let body = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let id = 1; id < objects.length; id++) {
    offsets[id] = Buffer.byteLength(body, "latin1");
    body += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(body, "latin1");
  body += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id++) body += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  body += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(body, "latin1"));
}

/** Gabarito no formato do Inep: "QUESTÕES GABARITO" e pares número/letra. */
export function inepAnswerKeyPdf(first: number, answers: string, area = "Matemática"): Uint8Array {
  const lines: PdfTextLine[] = [
    { x: 200, y: 800, text: "Ensino Fundamental" },
    { x: 200, y: 785, text: area },
    { x: 150, y: 760, text: "QUESTÕES" },
    { x: 260, y: 760, text: "GABARITO" },
  ];
  [...answers].forEach((letter, index) => {
    const y = 740 - index * 16;
    lines.push({ x: 160, y, text: String(first + index) });
    lines.push({ x: 270, y, text: letter });
  });
  return makePdf([lines]);
}

/** Caderno no formato do Inep: título, número de página solto e "QUESTÃO N" com alternativas em trechos separados. */
export function inepBookletPdf(
  first: number,
  count: number,
  options = 4,
  statement = (n: number) => `Uma loja vendeu ${n} cadernos por R$ 5,00 cada. Quanto recebeu no total?`,
  heading = "Matemática",
): Uint8Array {
  const letters = ["A", "B", "C", "D", "E"].slice(0, options);
  const pages: PdfTextLine[][] = [[{ x: 250, y: 800, text: heading }, { x: 290, y: 30, text: "1" }]];
  let page: PdfTextLine[] = [{ x: 290, y: 30, text: "2" }];
  let y = 800;
  for (let n = first; n < first + count; n++) {
    if (y < 200) {
      pages.push(page);
      page = [{ x: 290, y: 30, text: String(pages.length + 1) }];
      y = 800;
    }
    page.push({ x: 30, y, text: `QUESTÃO ${n}` });
    page.push({ x: 30, y: y - 20, text: statement(n) });
    letters.forEach((letter, index) => {
      page.push({ x: 30, y: y - 40 - index * 16, text: letter });
      page.push({ x: 47, y: y - 40 - index * 16, text: `${(index + 1) * n} reais` });
    });
    y -= 40 + letters.length * 16 + 30;
  }
  pages.push(page);
  return makePdf(pages);
}
