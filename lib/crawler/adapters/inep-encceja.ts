import { parse, type HTMLElement } from "node-html-parser";
import { BudgetExceededError } from "../http/fetcher";
import { foldText } from "../normalizers/text";
import { parseAnswerKeyPages } from "../parsers/answer-key";
import { parseBookletPages } from "../parsers/booklet";
import { extractPdfPages } from "../parsers/pdf-text";
import type { ExamCandidate, ParsedAnswerKey } from "../types";
import type { AdapterContext, SourceAdapter } from "./types";

/**
 * Adaptador do Inep (Encceja Ensino Fundamental).
 * Fluxo: página oficial de provas e gabaritos → páginas por ano → para cada área de
 * Matemática e Língua Portuguesa, o caderno ("Prova") e o gabarito oficial.
 * Variantes acessíveis (ampliada, ledor, Libras) são ignoradas para não duplicar a mesma prova.
 */

export interface InepYearLink {
  year: number;
  url: string;
}

export interface InepExamGroup {
  year: number;
  title: string;
  level: "fundamental" | "medio" | "outro";
  area: "matematica" | "portugues" | "outra";
  areaName: string;
  application: string;
  bookletUrl: string | null;
  answerKeyUrl: string | null;
}

const MAX_YEAR_PAGES_PER_RUN = 4;
const RECHECK_PROCESSED_AFTER_DAYS = 30;

function cleanText(text: string): string {
  return text.replace(/ /g, " ").replace(/\s+/g, " ").trim();
}

function absolute(href: string, base: string): string | null {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

/** Lê os links das abas por ano (atributo data-url) na página principal. */
export function parseInepIndex(html: string, baseUrl: string): InepYearLink[] {
  const root = parse(html);
  const links: InepYearLink[] = [];
  for (const element of root.querySelectorAll("[data-url]")) {
    const year = Number(element.getAttribute("data-id"));
    const url = absolute(element.getAttribute("data-url") ?? "", baseUrl);
    if (Number.isInteger(year) && year >= 2000 && year <= 2100 && url) links.push({ year, url });
  }
  const unique = new Map(links.map((link) => [link.url, link]));
  return [...unique.values()].sort((a, b) => b.year - a.year);
}

/** Lê os grupos "Ensino fundamental – Matemática – Aplicação regular" e seus links de prova e gabarito. */
export function parseInepYearPage(html: string, baseUrl: string, year: number): InepExamGroup[] {
  const root = parse(html);
  const container = root.querySelector("#parent-fieldname-text") ?? root.querySelector("#content-core") ?? root;
  const groups: InepExamGroup[] = [];
  let currentHeading = "";
  let current: InepExamGroup | null = null;

  const visit = (element: HTMLElement) => {
    const tag = element.tagName?.toLowerCase();
    if (tag === "h2" || tag === "h3" || tag === "h4") {
      currentHeading = cleanText(element.text);
      return;
    }
    if (tag === "p" && element.classList.contains("callout")) {
      const title = cleanText(element.text);
      const parts = title.split(/\s+[–—-]\s+/);
      const folded = foldText(title);
      const areaPart = foldText(parts[1] ?? "");
      current = {
        year,
        title,
        level: folded.startsWith("ensino fundamental") ? "fundamental" : folded.startsWith("ensino medio") ? "medio" : "outro",
        area: areaPart.includes("matematica") ? "matematica" : areaPart.includes("lingua portuguesa") ? "portugues" : "outra",
        areaName: cleanText(parts[1] ?? ""),
        application: cleanText(parts[2] ?? currentHeading ?? ""),
        bookletUrl: null,
        answerKeyUrl: null,
      };
      // Variantes acessíveis da mesma prova ficam de fora.
      if (/\((ampliada|superampliada|ledor|libras|braille)\)/i.test(title)) current = null;
      else groups.push(current);
      return;
    }
    if (tag === "a" && current) {
      const label = cleanText(element.text);
      const href = absolute(element.getAttribute("href") ?? "", baseUrl);
      if (!href || !/\.pdf($|\?)/i.test(href)) return;
      const foldedLabel = foldText(label);
      if (foldedLabel === "prova" && !current.bookletUrl) current.bookletUrl = href;
      else if (foldedLabel === "gabarito" && !current.answerKeyUrl) current.answerKeyUrl = href;
      return;
    }
    for (const child of element.childNodes) {
      if ((child as HTMLElement).tagName) visit(child as HTMLElement);
    }
  };
  visit(container);
  return groups;
}

function daysSince(iso: string | null, now: Date): number {
  if (!iso) return Infinity;
  return (now.getTime() - Date.parse(iso)) / 86_400_000;
}

async function chooseYearPages(context: AdapterContext, years: InepYearLink[]): Promise<InepYearLink[]> {
  // Sempre os dois anos mais recentes; depois, anos com documentos que falharam (nova tentativa),
  // os nunca vistos e os conferidos há mais tempo.
  const chosen = years.slice(0, 2);
  const rest: { link: InepYearLink; checked: number; failed: number }[] = [];
  for (const link of years.slice(2)) {
    const status = await context.documentStatus(link.url);
    rest.push({ link, checked: status?.lastCheckedAt ? Date.parse(status.lastCheckedAt) : 0, failed: await context.failedChildren(link.url) });
  }
  rest.sort((a, b) => b.failed - a.failed || a.checked - b.checked);
  return [...chosen, ...rest.map((item) => item.link)].slice(0, MAX_YEAR_PAGES_PER_RUN);
}

export const inepEnccejaAdapter: SourceAdapter = {
  id: "inep-encceja",
  async *run(context) {
    const indexUrl = context.source.startUrls[0];
    const index = await context.fetchDocument({ url: indexUrl, kind: "listing", accept: "html", title: "Encceja — provas e gabaritos" });
    const years = parseInepIndex(index.resource.text ?? "", indexUrl);
    if (years.length === 0) {
      context.warn("A página do Inep não trouxe links por ano; a estrutura pode ter mudado.");
      return;
    }

    for (const yearLink of await chooseYearPages(context, years)) {
      if (context.timeLeftMs() < 30_000) {
        context.warn("Tempo da execução quase esgotado; os demais anos ficam para a próxima coleta.");
        return;
      }
      let pageText: string;
      try {
        const page = await context.fetchDocument({ url: yearLink.url, kind: "exam_page", accept: "html", title: `Encceja ${yearLink.year}`, parentUrl: indexUrl });
        pageText = page.resource.text ?? "";
      } catch (error) {
        if (error instanceof BudgetExceededError) {
          context.warn(`${error.message} A coleta continua na próxima execução.`);
          return;
        }
        context.warn(`Página de ${yearLink.year} indisponível (${error instanceof Error ? error.message : "erro"}); será tentada na próxima coleta.`);
        continue;
      }
      const groups = parseInepYearPage(pageText, yearLink.url, yearLink.year).filter(
        (group) => group.level === "fundamental" && group.area !== "outra" && group.bookletUrl && group.answerKeyUrl,
      );

      for (const group of groups) {
        const bookletUrl = group.bookletUrl as string;
        const answerKeyUrl = group.answerKeyUrl as string;
        const bookletStatus = await context.documentStatus(bookletUrl);
        const keyStatus = await context.documentStatus(answerKeyUrl);
        const recentlyProcessed = [bookletStatus, keyStatus].every(
          (status) =>
            status && (status.status === "processed" || status.status === "unchanged" || status.status === "skipped") && daysSince(status.processedAt ?? status.lastCheckedAt, context.now()) < RECHECK_PROCESSED_AFTER_DAYS,
        );
        if (recentlyProcessed) continue;
        if (context.downloadsLeft() < 2 || context.timeLeftMs() < 45_000) {
          context.warn("Limite de downloads ou de tempo desta execução atingido; a coleta continua na próxima execução.");
          return;
        }

        let candidate: ExamCandidate;
        try {
          candidate = await readGroup(context, group, yearLink.url);
        } catch (error) {
          // Uma prova com problema não interrompe as demais; o documento fica marcado para nova tentativa.
          if (error instanceof BudgetExceededError) {
            context.warn(`${error.message} A coleta continua na próxima execução.`);
            return;
          }
          context.warn(`${group.title}: ${error instanceof Error ? error.message : "erro"} (será tentada na próxima coleta).`);
          continue;
        }
        yield candidate;
      }
    }
  },
};

/** Baixa e lê o gabarito e o caderno de uma área de um ano. */
async function readGroup(context: AdapterContext, group: InepExamGroup, yearUrl: string): Promise<ExamCandidate> {
  const key = await context.fetchDocument({
    url: group.answerKeyUrl as string,
    kind: "answer_key",
    accept: "pdf",
    title: `Gabarito — ${group.title}`,
    parentUrl: yearUrl,
  });
  const bookletFetch = await context.fetchDocument({
    url: group.bookletUrl as string,
    kind: "booklet",
    accept: "pdf",
    title: `Prova — ${group.title}`,
    parentUrl: yearUrl,
  });

  const areaHeading =
    group.area === "matematica"
      ? { title: "Matemática", subject: "matematica" as const }
      : { title: "Língua Portuguesa (com língua estrangeira, artes e educação física)", subject: "portugues" as const };
  const keyDocument = parseAnswerKeyPages(await extractPdfPages(key.resource.body), group.areaName);
  const bookletContent = parseBookletPages(await extractPdfPages(bookletFetch.resource.body), { defaultSection: areaHeading, defaultOptionCount: 4 });

  const block = keyDocument.blocks[0];
  const answerKey: ParsedAnswerKey | null = block
    ? {
        url: key.resource.url,
        sha256: key.resource.sha256,
        version: "oficial-unico",
        entries: block.entries,
        ...(keyDocument.headerVersion ? { headerVersion: keyDocument.headerVersion } : {}),
        blockLabel: block.label,
        // Um PDF por área: confiança alta quando há um único bloco de respostas.
        matchConfidence: keyDocument.blocks.length === 1 ? 1 : 0.5,
      }
    : null;

  return {
    sourceId: context.source.id,
    dedupeKey: `inep-encceja|${group.year}|${foldText(group.application)}|fundamental|${group.area}`,
    title: `Encceja ${group.year} — ${group.application || "Aplicação regular"} — Ensino Fundamental — ${group.area === "matematica" ? "Matemática" : "Língua Portuguesa e Linguagens"}`,
    examBoard: "Inep",
    organization: context.source.organization,
    role: `Exame de certificação do Ensino Fundamental (${group.application || "aplicação regular"})`,
    educationLevel: "fundamental",
    year: group.year,
    bookletType: "Caderno único",
    examPageUrl: yearUrl,
    bookletUrl: bookletFetch.resource.url,
    booklet: { ...bookletContent, url: bookletFetch.resource.url, sha256: bookletFetch.resource.sha256 },
    answerKey,
    answerKeyHasText: keyDocument.hasText,
    laterRectifications: [],
    sectionNotes:
      group.area === "portugues" ? ["A área de Linguagens do Encceja também traz questões de língua estrangeira, artes e educação física."] : [],
    warnings: [...keyDocument.warnings],
  };
}
