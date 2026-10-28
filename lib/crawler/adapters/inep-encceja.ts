import { parse, type HTMLElement } from "node-html-parser";
import { BudgetExceededError } from "../http/fetcher";
import { foldText } from "../normalizers/text";
import { parseAnswerKeyPages } from "../parsers/answer-key";
import { parseBookletPages } from "../parsers/booklet";
import { extractPdfPages } from "../parsers/pdf-text";
import type { SubjectId } from "@/types/question";
import type { ExamCandidate, ParsedAnswerKey } from "../types";
import type { AdapterContext, SourceAdapter } from "./types";

/**
 * Adaptador do Inep (Encceja Ensino Fundamental).
 * Fluxo: página oficial de provas e gabaritos → páginas por ano → para cada área
 * (Matemática, Língua Portuguesa, Ciências Naturais, História e Geografia), o caderno ("Prova")
 * e o gabarito oficial. Ciências e História/Geografia entram no site como Conhecimentos gerais.
 * Variantes acessíveis (ampliada, ledor, Libras) são ignoradas para não duplicar a mesma prova.
 */

type InepArea = "matematica" | "portugues" | "ciencias" | "historia-geografia";

const AREAS: Record<InepArea, { match: RegExp; heading: { title: string; subject: SubjectId }; name: string; note?: string }> = {
  matematica: { match: /matematica/, heading: { title: "Matemática", subject: "matematica" }, name: "Matemática" },
  portugues: {
    match: /lingua portuguesa/,
    heading: { title: "Língua Portuguesa (com língua estrangeira, artes e educação física)", subject: "portugues" },
    name: "Língua Portuguesa e Linguagens",
    note: "A área de Linguagens do Encceja também traz questões de língua estrangeira, artes e educação física.",
  },
  ciencias: {
    match: /ciencias naturais/,
    heading: { title: "Ciências Naturais", subject: "conhecimentos-gerais" },
    name: "Ciências Naturais",
    note: "No site, a área de Ciências Naturais do Encceja faz parte de Conhecimentos gerais.",
  },
  "historia-geografia": {
    match: /historia e geografia/,
    heading: { title: "História e Geografia", subject: "conhecimentos-gerais" },
    name: "História e Geografia",
    note: "No site, a área de História e Geografia do Encceja faz parte de Conhecimentos gerais.",
  },
};

function areaOf(foldedAreaName: string): InepArea | "outra" {
  return (Object.keys(AREAS) as InepArea[]).find((area) => AREAS[area].match.test(foldedAreaName)) ?? "outra";
}

export interface InepYearLink {
  year: number;
  url: string;
}

export interface InepExamGroup {
  year: number;
  title: string;
  level: "fundamental" | "medio" | "outro";
  area: InepArea | "outra";
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
        area: areaOf(areaPart),
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

/**
 * Quando o adaptador passou a ler Ciências Naturais e História e Geografia. Anos com cadernos conferidos
 * antes disso são revisitados primeiro, uma vez, para encontrar as provas dessas áreas.
 */
const AREAS_EXPANDED_AT = Date.parse("2026-10-28T00:00:00Z");

export async function chooseYearPages(context: AdapterContext, years: InepYearLink[]): Promise<InepYearLink[]> {
  // Sempre os dois anos mais recentes; depois, anos com documentos que falharam (nova tentativa),
  // anos com cadernos que ainda não foram lidos com as áreas novas, os nunca vistos e os conferidos há mais tempo.
  const chosen = years.slice(0, 2);
  const rest: { link: InepYearLink; checked: number; failed: number; revisit: boolean }[] = [];
  for (const link of years.slice(2)) {
    const status = await context.documentStatus(link.url);
    const checked = status?.lastCheckedAt ? Date.parse(status.lastCheckedAt) : 0;
    const revisit = checked > 0 && checked < AREAS_EXPANDED_AT && (await context.bookletChildren(link.url)) > 0;
    rest.push({ link, checked, failed: await context.failedChildren(link.url), revisit });
  }
  rest.sort((a, b) => b.failed - a.failed || Number(b.revisit) - Number(a.revisit) || a.checked - b.checked);
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

  if (group.area === "outra") throw new Error("Área do Encceja não usada pelo site.");
  const area = AREAS[group.area];
  const areaHeading = area.heading;
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
    title: `Encceja ${group.year} — ${group.application || "Aplicação regular"} — Ensino Fundamental — ${area.name}`,
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
    answerKeyDocumentUrl: key.resource.url,
    laterRectifications: [],
    sectionNotes: area.note ? [area.note] : [],
    warnings: [...keyDocument.warnings],
  };
}
