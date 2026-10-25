// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiDeps } from "@/lib/api/deps";
import {
  handleImportQuestions,
  handleListReview,
  handleLogin,
  handleOverview,
  handleResolveReview,
  handleRunNow,
  handleToggleSource,
} from "@/lib/api/handlers/admin";
import { handleCron } from "@/lib/api/handlers/cron";
import { handleGetExam, handleGradeExam, handleListExams, handleListQuestions, handleUpdateStatus } from "@/lib/api/handlers/public";
import { emptySourceStats, type ExamCandidate } from "@/lib/crawler/types";
import { processCandidate } from "@/lib/crawler/pipeline";
import type { SqlClient } from "@/lib/server/db/client";
import { listPublishedExams } from "@/lib/server/repositories/public";
import { INEP_BOOKLET, INEP_KEY, INEP_YEAR, createTestDb, inepSource } from "../helpers/crawler";
import { makeQuestion } from "../fixtures";

const ORIGIN = "http://localhost:3000";
const ENV = { ADMIN_PASSWORD: "senha-forte-de-teste", ADMIN_SESSION_SECRET: "s".repeat(40), CRON_SECRET: "c".repeat(24), NODE_ENV: "test" };
let db: SqlClient;
let deps: ApiDeps;

function request(path: string, init: { method?: string; body?: unknown; cookie?: string; origin?: string | null; headers?: Record<string, string> } = {}) {
  const headers: Record<string, string> = { ...init.headers };
  if (init.body !== undefined) headers["content-type"] = "application/json";
  if (init.cookie) headers.cookie = init.cookie;
  if (init.origin !== null && init.method && init.method !== "GET") headers.origin = init.origin ?? ORIGIN;
  return new Request(`${ORIGIN}${path}`, { method: init.method ?? "GET", headers, body: init.body === undefined ? undefined : JSON.stringify(init.body) });
}

async function login(): Promise<string> {
  const response = await handleLogin(request("/api/admin/session", { method: "POST", body: { password: ENV.ADMIN_PASSWORD } }), deps);
  expect(response.status).toBe(200);
  const cookie = response.headers.get("set-cookie") ?? "";
  expect(cookie).toMatch(/HttpOnly/);
  expect(cookie).toMatch(/SameSite=Strict/);
  return cookie.split(";")[0];
}

function candidate(overrides: Partial<ExamCandidate> = {}): ExamCandidate {
  const questions = [1, 2, 3].map((number) => ({
    number,
    text: `Questão ${number} de teste sobre porcentagem: quanto é ${number}0% de 300 reais?`,
    options: (["A", "B", "C", "D"] as const).map((letter) => ({ letter, text: `${letter}-${number}` })),
    page: 1,
    sectionTitle: "Matemática",
  }));
  return {
    sourceId: "inep-encceja",
    dedupeKey: "api|prova",
    title: "Prova da API",
    examBoard: "Inep",
    role: "Teste",
    educationLevel: "fundamental",
    year: 2024,
    bookletType: "Caderno único",
    examPageUrl: INEP_YEAR,
    bookletUrl: INEP_BOOKLET,
    booklet: {
      url: INEP_BOOKLET,
      sha256: "b",
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
      sha256: "k",
      version: "oficial-unico",
      entries: [
        { number: 1, answer: "A" },
        { number: 2, answer: null },
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

beforeEach(async () => {
  db = await createTestDb();
  deps = {
    getDb: async () => db,
    now: () => new Date("2026-10-25T12:00:00Z"),
    env: ENV,
    runInBackground: vi.fn(),
    crawl: vi.fn(async () => ({ status: "succeeded" as const, runId: "x", stats: { ...emptySourceStats(), sourcesChecked: 0, sourcesOk: 0, sourcesFailed: [] }, errors: [], warnings: [] })),
  };
});
afterEach(async () => {
  await db.close();
});

describe("proteção da área administrativa", () => {
  it("bloqueia requisições sem login", async () => {
    expect((await handleOverview(request("/api/admin/crawler/overview"), deps)).status).toBe(401);
    expect((await handleRunNow(request("/api/admin/crawler/run", { method: "POST", body: {} }), deps)).status).toBe(401);
    expect((await handleListReview(request("/api/admin/review"), deps)).status).toBe(401);
    expect(deps.runInBackground).not.toHaveBeenCalled();
  });

  it("fica desativada quando as variáveis do administrador não existem", async () => {
    const response = await handleOverview(request("/api/admin/crawler/overview"), { ...deps, env: {} });
    expect(response.status).toBe(503);
  });

  it("recusa senha errada e limita tentativas", async () => {
    for (let i = 0; i < 5; i++) {
      const response = await handleLogin(request("/api/admin/session", { method: "POST", body: { password: "errada" } }), deps);
      expect(response.status).toBe(401);
    }
    const blocked = await handleLogin(request("/api/admin/session", { method: "POST", body: { password: ENV.ADMIN_PASSWORD } }), deps);
    expect(blocked.status).toBe(429);
  });

  it("com login, permite consultar; alterações de outra origem são recusadas (CSRF)", async () => {
    const cookie = await login();
    const overview = await handleOverview(request("/api/admin/crawler/overview", { cookie }), deps);
    expect(overview.status).toBe(200);
    const body = (await overview.json()) as { sources: { id: string; automationAllowed: boolean }[]; schedule: { utcCron: string } };
    expect(body.sources.find((source) => source.id === "fgv-conhecimento")?.automationAllowed).toBe(false);
    expect(body.schedule.utcCron).toBe("0 6 * * *");
    expect(JSON.stringify(body)).not.toContain(ENV.ADMIN_PASSWORD);

    const crossSite = await handleRunNow(request("/api/admin/crawler/run", { method: "POST", body: {}, cookie, origin: "https://site-malicioso.com" }), deps);
    expect(crossSite.status).toBe(403);
    const ok = await handleRunNow(request("/api/admin/crawler/run", { method: "POST", body: {}, cookie }), deps);
    expect(ok.status).toBe(202);
    expect(deps.runInBackground).toHaveBeenCalledTimes(1);
  });

  it("cookie adulterado não vale", async () => {
    const cookie = await login();
    const tampered = cookie.replace(/.$/, (char) => (char === "a" ? "b" : "a"));
    expect((await handleOverview(request("/api/admin/crawler/overview", { cookie: tampered }), deps)).status).toBe(401);
  });

  it("não deixa ativar fonte cujos termos proíbem coleta automatizada", async () => {
    const cookie = await login();
    const response = await handleToggleSource(request("/api/admin/crawler/sources/fgv-conhecimento", { method: "PATCH", body: { enabled: true }, cookie }), "fgv-conhecimento", deps);
    expect(response.status).toBe(409);
  });
});

describe("rota do agendador", () => {
  it("exige o segredo do agendamento", async () => {
    expect((await handleCron(request("/api/cron/crawl"), deps)).status).toBe(401);
    expect((await handleCron(request("/api/cron/crawl", { headers: { authorization: "Bearer errado" } }), deps)).status).toBe(401);
    expect((await handleCron(request("/api/cron/crawl", { headers: { authorization: `Bearer ${ENV.CRON_SECRET}` } }), { ...deps, env: {} })).status).toBe(401);
  });

  it("com o segredo, executa a coleta agendada", async () => {
    const response = await handleCron(request("/api/cron/crawl", { headers: { authorization: `Bearer ${ENV.CRON_SECRET}` } }), deps);
    expect(response.status).toBe(200);
    expect(deps.crawl).toHaveBeenCalledWith(expect.objectContaining({ trigger: "cron" }));
  });
});

describe("APIs públicas", () => {
  it("valida parâmetros e limites de paginação", async () => {
    expect((await handleListQuestions(request("/api/questions?disciplina=quimica"), deps)).status).toBe(400);
    expect((await handleListQuestions(request("/api/questions?porPagina=1000"), deps)).status).toBe(400);
    expect((await handleListQuestions(request("/api/questions?disciplina=portugues&assunto=porcentagem"), deps)).status).toBe(400);
    expect((await handleListExams(request("/api/exams?ano=abc"), deps)).status).toBe(400);
    const ok = await handleListQuestions(request("/api/questions?disciplina=matematica&pagina=1&porPagina=10"), deps);
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ items: [], page: 1, pageSize: 10, total: 0 });
  });

  it("responde 503 claro quando o banco central não está configurado", async () => {
    const { DatabaseNotConfiguredError } = await import("@/lib/server/db");
    const response = await handleUpdateStatus(request("/api/updates/status"), { ...deps, getDb: async () => Promise.reject(new DatabaseNotConfiguredError()) });
    expect(response.status).toBe(503);
  });

  it("não expõe provas pendentes nem o gabarito; corrige no servidor ignorando a anulada", async () => {
    const pending = candidate({ dedupeKey: "api|pendente", answerKey: { ...candidate().answerKey!, version: "preliminar" } });
    const pendingOutcome = await processCandidate(db, pending, inepSource(), emptySourceStats(), new Date());
    const published = await processCandidate(db, candidate(), inepSource(), emptySourceStats(), new Date());

    const list = (await (await handleListExams(request("/api/exams"), deps)).json()) as { items: { id: string }[]; total: number };
    expect(list.items.map((item) => item.id)).toEqual([published.examId]);
    expect((await handleGetExam(request("/x"), pendingOutcome.examId!, deps)).status).toBe(404);

    const exam = await (await handleGetExam(request("/x"), published.examId!, deps)).json();
    expect(JSON.stringify(exam)).not.toMatch(/correct|answerKey"?:\s*\[/i);
    expect(exam.annulled).toEqual([2]);

    const graded = await handleGradeExam(
      request(`/api/exams/${published.examId}/grade`, { method: "POST", body: { answers: { "1": "A", "2": "B", "3": "D" }, sectionIds: ["secao-1"] } }),
      published.examId!,
      deps,
    );
    expect(graded.status).toBe(200);
    const result = (await graded.json()) as { score: { correct: number; wrong: number; total: number }; annulled: number[] };
    expect(result.score).toMatchObject({ correct: 1, wrong: 1, total: 2 });
    expect(result.annulled).toEqual([2]);

    const invalid = await handleGradeExam(
      request(`/api/exams/${published.examId}/grade`, { method: "POST", body: { answers: { "1": "Z" }, sectionIds: [] } }),
      published.examId!,
      deps,
    );
    expect(invalid.status).toBe(400);
  });

  it("informa a última atualização sem inventar novidades", async () => {
    const status = (await (await handleUpdateStatus(request("/api/updates/status"), deps)).json()) as { lastSuccessfulUpdateAt: string | null; newExamsLast7Days: number };
    expect(status).toMatchObject({ lastSuccessfulUpdateAt: null, newExamsLast7Days: 0 });
  });
});

describe("fila de revisão e importação manual", () => {
  it("não aprova como oficial uma prova que só tem gabarito preliminar", async () => {
    const cookie = await login();
    await processCandidate(db, candidate({ answerKey: { ...candidate().answerKey!, version: "preliminar" } }), inepSource(), emptySourceStats(), new Date());
    const queue = (await (await handleListReview(request("/api/admin/review", { cookie }), deps)).json()) as { items: { id: number; reason: string }[] };
    const item = queue.items.find((entry) => entry.reason === "gabarito_preliminar");
    expect(item).toBeDefined();
    const response = await handleResolveReview(request(`/api/admin/review/${item!.id}`, { method: "POST", body: { action: "approve" }, cookie }), String(item!.id), deps);
    expect(response.status).toBe(409);
    expect((await listPublishedExams(db, { limit: 5, offset: 0 }, new Date())).total).toBe(0);
  });

  it("importa questões com validação, recusa duplicadas e atribuições falsas, e publica após aprovação", async () => {
    const cookie = await login();
    const valid = makeQuestion({ id: "nova-pratica-01", statement: "Quanto é 15% de 400 reais em uma promoção da feira?" });
    const fake = makeQuestion({ id: "falsa-01", statement: "Questão autoral fingindo ser de concurso oficial?", source: { description: "x", examBoard: "FGV" } });
    const response = await handleImportQuestions(
      request("/api/admin/import/questions", { method: "POST", cookie, body: { questions: [valid, fake, { id: 1 }], authorization: "" } }),
      deps,
    );
    const { results } = (await response.json()) as { results: { id: string; status: string }[] };
    expect(results.map((result) => result.status)).toEqual(["rejeitada", "na_fila_de_revisao", "rejeitada"]);

    const again = await handleImportQuestions(request("/api/admin/import/questions", { method: "POST", cookie, body: { questions: [valid] } }), deps);
    expect(((await again.json()) as { results: { status: string }[] }).results[0].status).toBe("duplicada");

    expect(((await (await handleListQuestions(request("/api/questions"), deps)).json()) as { total: number }).total).toBe(0);
    const queue = (await (await handleListReview(request("/api/admin/review", { cookie }), deps)).json()) as { items: { id: number; itemId: string }[] };
    const item = queue.items.find((entry) => entry.itemId === "importada-nova-pratica-01")!;
    await handleResolveReview(request(`/api/admin/review/${item.id}`, { method: "POST", body: { action: "approve" }, cookie }), String(item.id), deps);
    const listed = (await (await handleListQuestions(request("/api/questions"), deps)).json()) as { items: { id: string; statement: string }[] };
    expect(listed.items.map((question) => question.id)).toEqual(["importada-nova-pratica-01"]);
  });
});
