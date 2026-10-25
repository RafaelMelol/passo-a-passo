// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { inepEnccejaAdapter } from "@/lib/crawler/adapters/inep-encceja";
import type { SourceAdapter } from "@/lib/crawler/adapters/types";
import { processCandidate } from "@/lib/crawler/pipeline";
import { CRAWLER_LOCK, runCrawl, scheduledRunAlreadyToday } from "@/lib/crawler/scheduler/run";
import { emptySourceStats, type ExamCandidate, type SourceConfig } from "@/lib/crawler/types";
import type { SqlClient } from "@/lib/server/db/client";
import { getExamQuestions, listRevisions } from "@/lib/server/repositories/exams";
import { acquireLock } from "@/lib/server/repositories/locks";
import { getPublishedAnswerKey, listPublishedExams } from "@/lib/server/repositories/public";
import { listReviews } from "@/lib/server/repositories/reviews";
import { createRun, listRuns } from "@/lib/server/repositories/runs";
import { getSourceState, setSourceEnabled } from "@/lib/server/repositories/sources";
import { CRAWLER_SOURCES } from "@/data/crawler-sources";
import {
  INEP_BOOKLET,
  INEP_INDEX,
  INEP_INDEX_HTML,
  INEP_KEY,
  INEP_YEAR,
  INEP_YEAR_HTML,
  createTestDb,
  fakeTransport,
  html,
  inepSource,
  pdf,
  status,
  testFetcher,
  type Route,
} from "../helpers/crawler";
import { inepAnswerKeyPdf, inepBookletPdf } from "../helpers/make-pdf";

const DAY = 86_400_000;
let db: SqlClient;

function inepRoutes(answers = "BCDAB"): Record<string, Route> {
  return {
    "https://www.gov.br/robots.txt": html("User-agent: *\nDisallow: /economia/"),
    "https://download.inep.gov.br/robots.txt": status(404),
    [INEP_INDEX]: html(INEP_INDEX_HTML),
    [INEP_YEAR]: html(INEP_YEAR_HTML),
    [INEP_KEY]: pdf(inepAnswerKeyPdf(31, answers)),
    [INEP_BOOKLET]: pdf(inepBookletPdf(31, 5)),
  };
}

async function crawl(routes: Record<string, Route>, at: Date, extra: { sources?: SourceConfig[]; adapters?: Record<string, SourceAdapter>; trigger?: "cron" | "manual" } = {}) {
  const { transport, calls } = fakeTransport(routes);
  const { fetcher } = testFetcher(transport);
  let clock = at.getTime();
  const outcome = await runCrawl({
    db,
    trigger: extra.trigger ?? "manual",
    sources: extra.sources ?? [inepSource()],
    adapters: extra.adapters ?? { "inep-encceja": inepEnccejaAdapter },
    fetcher,
    now: () => new Date((clock += 10)),
  });
  return { outcome, calls };
}

beforeEach(async () => {
  db = await createTestDb();
});
afterEach(async () => {
  await db.close();
});

describe("importação ponta a ponta (fonte simulada do Inep)", () => {
  it("importa uma prova válida, publica com gabarito oficial e não guarda o texto das questões", async () => {
    const { outcome } = await crawl(inepRoutes("BCDAB"), new Date("2026-10-25T06:00:00Z"));
    expect(outcome.status).toBe("succeeded");
    if (outcome.status === "skipped") throw new Error("não deveria pular");
    expect(outcome.stats).toMatchObject({ examsFound: 1, questionsExtracted: 5, questionsPublished: 5, questionsPending: 0 });

    const published = await listPublishedExams(db, { limit: 10, offset: 0 }, new Date());
    expect(published.total).toBe(1);
    const exam = published.items[0];
    expect(exam).toMatchObject({ examBoard: "Inep", questionCount: 5, optionCount: 4, bookletUrl: INEP_BOOKLET, answerKeyUrl: INEP_KEY });

    const key = await getPublishedAnswerKey(db, exam.id);
    expect(key.map((entry) => entry.answer).join("")).toBe("BCDAB");

    const stored = await db.query<{ n: number }>("SELECT count(*)::int AS n FROM questions WHERE statement IS NOT NULL OR options IS NOT NULL");
    expect(stored[0].n).toBe(0);
    const hashes = await db.query<{ n: number }>("SELECT count(*)::int AS n FROM questions WHERE statement_hash IS NOT NULL");
    expect(hashes[0].n).toBe(5);
  });

  it("rodar de novo não duplica provas nem questões (idempotente)", async () => {
    await crawl(inepRoutes(), new Date("2026-10-25T06:00:00Z"));
    await crawl(inepRoutes(), new Date("2026-10-26T06:00:00Z"));
    await crawl(inepRoutes(), new Date("2026-12-01T06:00:00Z")); // depois de 30 dias: baixa de novo, mesmo conteúdo
    const exams = await db.query<{ n: number }>("SELECT count(*)::int AS n FROM exams");
    const questions = await db.query<{ n: number }>("SELECT count(*)::int AS n FROM questions");
    const revisions = await db.query<{ n: number }>("SELECT count(*)::int AS n FROM question_revisions");
    expect([exams[0].n, questions[0].n, revisions[0].n]).toEqual([1, 5, 0]);
  });

  it("registra a alteração oficial do gabarito (inclusive anulação) com histórico de versões", async () => {
    await crawl(inepRoutes("BCDAB"), new Date("2026-10-25T06:00:00Z"));
    await crawl(inepRoutes("BADA*"), new Date("2026-12-01T06:00:00Z"));
    const exam = (await listPublishedExams(db, { limit: 1, offset: 0 }, new Date())).items[0];
    const questions = await getExamQuestions(db, exam.id);
    expect(questions.find((question) => question.number === 32)).toMatchObject({ correctOption: "A", version: 2 });
    expect(questions.find((question) => question.number === 35)).toMatchObject({ correctOption: null, verificationStatus: "annulled" });
    const revisions = await listRevisions(db, exam.id);
    expect(revisions.map((revision) => [revision.questionId.endsWith("q32") ? 32 : 35, revision.field, revision.previousValue, revision.newValue])).toEqual(
      expect.arrayContaining([
        [32, "correct_option", "C", "A"],
        [35, "correct_option", "B", null],
      ]),
    );
    expect(exam.annulled).toEqual([35]);
  });

  it("uma falha temporária deixa o documento para nova tentativa e a coleta seguinte recupera", async () => {
    const failing = { ...inepRoutes(), [INEP_BOOKLET]: status(503) };
    const first = await crawl(failing, new Date("2026-10-25T06:00:00Z"));
    expect(first.outcome.status === "skipped" ? 0 : first.outcome.stats.examsFound).toBe(0);
    const failed = await db.query<{ status: string }>("SELECT status FROM documents WHERE url = $1", [INEP_BOOKLET]);
    expect(failed[0].status).toBe("failed");

    const second = await crawl(inepRoutes(), new Date("2026-10-26T06:00:00Z"));
    expect(second.outcome.status === "skipped" ? 0 : second.outcome.stats.questionsPublished).toBe(5);
  });
});

describe("isolamento de falhas, travas e histórico", () => {
  it("a falha de uma fonte não interrompe as outras", async () => {
    const broken: SourceConfig = { ...inepSource(), id: "fonte-quebrada", automation: { allowed: true, adapter: "quebrado" } };
    await db.query("INSERT INTO sources (id, enabled) VALUES ('fonte-quebrada', true)");
    const brokenAdapter: SourceAdapter = {
      id: "quebrado",
      async *run() {
        throw new Error("site fora do ar");
      },
    };
    const { outcome } = await crawl(inepRoutes(), new Date("2026-10-25T06:00:00Z"), {
      sources: [broken, inepSource()],
      adapters: { quebrado: brokenAdapter, "inep-encceja": inepEnccejaAdapter },
    });
    if (outcome.status === "skipped") throw new Error("não deveria pular");
    expect(outcome.status).toBe("partial");
    expect(outcome.stats.sourcesFailed).toEqual(["fonte-quebrada"]);
    expect(outcome.stats.questionsPublished).toBe(5);
    const state = await getSourceState(db, "fonte-quebrada");
    expect(state).toMatchObject({ consecutiveFailures: 1, health: "degraded" });
    expect(Date.parse(state!.nextRunAt!)).toBeGreaterThan(Date.parse("2026-10-25T11:00:00Z"));
  });

  it("não roda duas coletas ao mesmo tempo", async () => {
    await acquireLock(db, CRAWLER_LOCK, "outra-execucao", new Date("2026-10-25T06:00:00Z"), 60 * 60_000);
    const { outcome, calls } = await crawl(inepRoutes(), new Date("2026-10-25T06:01:00Z"));
    expect(outcome).toEqual({ status: "skipped", reason: "Outra coleta já está em andamento." });
    expect(calls).toEqual([]);
  });

  it("execução que parou sem terminar é marcada como interrompida e a trava expirada é retomada", async () => {
    const crashed = new Date("2026-10-25T06:00:00Z");
    await createRun(db, "coleta-que-caiu", "cron", crashed);
    await acquireLock(db, CRAWLER_LOCK, "coleta-que-caiu", crashed, 5 * 60_000);
    const { outcome } = await crawl(inepRoutes(), new Date(crashed.getTime() + 60 * 60_000));
    expect(outcome.status).toBe("succeeded");
    const runs = await listRuns(db, 10, 0);
    expect(runs.items.find((run) => run.id === "coleta-que-caiu")?.status).toBe("interrupted");
  });

  it("dia sem novidades: execução bem-sucedida, sem inventar questões", async () => {
    const quiet: SourceAdapter = {
      id: "silencioso",
      async *run() {
        return;
      },
    };
    const { outcome } = await crawl({}, new Date("2026-10-25T06:00:00Z"), {
      sources: [{ ...inepSource(), automation: { allowed: true, adapter: "silencioso" } }],
      adapters: { silencioso: quiet },
    });
    if (outcome.status === "skipped") throw new Error("não deveria pular");
    expect(outcome.status).toBe("succeeded");
    expect(outcome.stats.questionsExtracted).toBe(0);
    const runs = await listRuns(db, 5, 0);
    expect(runs.items[0]).toMatchObject({ status: "succeeded", trigger: "manual" });
  });

  it("guarda o histórico e evita duas coletas agendadas no mesmo dia", async () => {
    const morning = new Date("2026-10-25T06:00:00Z");
    expect(await scheduledRunAlreadyToday(db, morning)).toBe(false);
    await crawl(inepRoutes(), morning, { trigger: "cron" });
    expect(await scheduledRunAlreadyToday(db, new Date("2026-10-25T20:00:00Z"))).toBe(true);
    expect(await scheduledRunAlreadyToday(db, new Date("2026-10-26T06:00:00Z"))).toBe(false);
    const runs = await listRuns(db, 5, 0);
    expect(runs.items[0]).toMatchObject({ trigger: "cron", status: "succeeded" });
    expect(runs.items[0].sources[0]).toMatchObject({ sourceId: "inep-encceja", status: "ok" });
  });

  it("fontes sem permissão de coleta automatizada nunca são executadas", async () => {
    await setSourceEnabled(db, "fgv-conhecimento", true); // mesmo se alguém tentar ligar no banco
    const { calls } = await crawl({}, new Date("2026-10-25T06:00:00Z"), { sources: [...CRAWLER_SOURCES].filter((s) => s.id !== "inep-encceja") });
    expect(calls.some((url) => url.includes("fgv.br"))).toBe(false);
  });
});

describe("regras do núcleo (processCandidate)", () => {
  function baseCandidate(overrides: Partial<ExamCandidate> = {}): ExamCandidate {
    const questions = [1, 2, 3].map((number) => ({
      number,
      text: `Questão ${number}: quanto é 10% de ${number * 100} reais em uma compra?`,
      options: (["A", "B", "C", "D"] as const).map((letter) => ({ letter, text: `${letter}${number}` })),
      page: 1,
      sectionTitle: "Matemática",
    }));
    return {
      sourceId: "inep-encceja",
      dedupeKey: `teste|${Math.random()}`,
      title: "Prova sintética",
      examBoard: "Inep",
      role: "Teste",
      educationLevel: "fundamental",
      year: 2024,
      bookletType: "Caderno único",
      examPageUrl: INEP_YEAR,
      bookletUrl: INEP_BOOKLET,
      booklet: {
        url: INEP_BOOKLET,
        sha256: "x",
        firstQuestion: 1,
        lastQuestion: 3,
        questionCount: 3,
        optionCount: 4,
        sections: [{ id: "secao-1", title: "Matemática", subject: "matematica", firstQuestion: 1, lastQuestion: 3 }],
        questions,
        hasTextLayer: true,
        warnings: [],
      },
      answerKey: {
        url: INEP_KEY,
        sha256: "y",
        version: "definitivo",
        entries: [
          { number: 1, answer: "A" },
          { number: 2, answer: "B" },
          { number: 3, answer: "C" },
        ],
        blockLabel: "Teste",
        matchConfidence: 1,
      },
      laterRectifications: [],
      warnings: [],
      ...overrides,
    };
  }

  it("rejeita questão sem referência verificável (documento fora da fonte oficial)", async () => {
    const outcome = await processCandidate(db, baseCandidate({ bookletUrl: "https://site-de-terceiros.com/prova.pdf" }), inepSource(), emptySourceStats(), new Date());
    expect(outcome.status).toBe("skipped");
    const exams = await db.query<{ n: number }>("SELECT count(*)::int AS n FROM exams");
    expect(exams[0].n).toBe(0);
  });

  it("gabarito inconsistente não é publicado e vai para a fila de revisão", async () => {
    const candidate = baseCandidate();
    candidate.answerKey!.entries = candidate.answerKey!.entries.slice(0, 2);
    const outcome = await processCandidate(db, candidate, inepSource(), emptySourceStats(), new Date());
    expect(outcome.status).toBe("pending");
    expect((await listPublishedExams(db, { limit: 5, offset: 0 }, new Date())).total).toBe(0);
    const reviews = await listReviews(db, { status: "open", limit: 10, offset: 0 });
    expect(reviews.items.map((item) => item.reason)).toContain("contagem_divergente");
  });

  it("gabarito preliminar diferente do definitivo gera revisão registrada", async () => {
    const candidate = baseCandidate({
      preliminaryKey: {
        url: "https://download.inep.gov.br/preliminar.pdf",
        sha256: "p",
        version: "preliminar",
        entries: [
          { number: 1, answer: "A" },
          { number: 2, answer: "D" },
          { number: 3, answer: "C" },
        ],
        blockLabel: "Teste",
        matchConfidence: 1,
      },
    });
    const outcome = await processCandidate(db, candidate, inepSource(), emptySourceStats(), new Date());
    const revisions = await listRevisions(db, outcome.examId!);
    expect(revisions).toHaveLength(1);
    expect(revisions[0]).toMatchObject({ field: "correct_option", previousValue: "D", newValue: "B", reason: "Gabarito definitivo diferente do preliminar" });
  });

  it("detecta a mesma questão vinda de outra prova e mantém o registro canônico", async () => {
    const stats = emptySourceStats();
    await processCandidate(db, baseCandidate({ dedupeKey: "prova-a" }), inepSource(), stats, new Date());
    await processCandidate(db, baseCandidate({ dedupeKey: "prova-b" }), inepSource(), stats, new Date());
    expect(stats.duplicates).toBe(3);
    const linked = await db.query<{ n: number }>("SELECT count(*)::int AS n FROM questions WHERE duplicate_of IS NOT NULL");
    expect(linked[0].n).toBe(3);
  });

  it("importação manual nunca é publicada sem aprovação", async () => {
    const outcome = await processCandidate(db, baseCandidate(), inepSource(), emptySourceStats(), new Date(), {
      forceReview: { reason: "importacao_manual", details: "teste" },
    });
    expect(outcome.status).toBe("pending");
  });
});

describe("prazos", () => {
  it("documento processado há menos de 30 dias não é baixado de novo", async () => {
    await crawl(inepRoutes(), new Date("2026-10-25T06:00:00Z"));
    const { calls } = await crawl(inepRoutes(), new Date(Date.parse("2026-10-25T06:00:00Z") + 5 * DAY));
    expect(calls).not.toContain(INEP_BOOKLET);
    expect(calls).not.toContain(INEP_KEY);
  });
});
