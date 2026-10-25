import "server-only";
import { CRAWLER_SOURCES, getSourceConfig } from "@/data/crawler-sources";
import { ALL_QUESTIONS } from "@/data/questions";
import { foldText, isNearDuplicate, statementHash } from "@/lib/crawler/normalizers/text";
import { parseAnswerKeyPages } from "@/lib/crawler/parsers/answer-key";
import { parseBookletPages } from "@/lib/crawler/parsers/booklet";
import { extractPdfPages } from "@/lib/crawler/parsers/pdf-text";
import { similarity } from "@/lib/crawler/normalizers/text";
import { examIdFor, processCandidate } from "@/lib/crawler/pipeline";
import { CRAWLER_LOCK } from "@/lib/crawler/scheduler/run";
import { nextDailyRun, readScheduleConfig, startOfZonedDay, utcCronExpression } from "@/lib/crawler/scheduler/schedule";
import { emptySourceStats, type ExamCandidate } from "@/lib/crawler/types";
import { checkProvenance } from "@/lib/crawler/validators/provenance";
import { parseQuestionList } from "@/lib/questions/parse";
import { validateQuestion } from "@/lib/questions/validation";
import { countByStatus, countRecentLoginFailures, insertImportedQuestion, recordLoginAttempt } from "@/lib/server/repositories/admin";
import { listDocuments, resetFailedDocuments } from "@/lib/server/repositories/documents";
import { getLock } from "@/lib/server/repositories/locks";
import { listReviews, resolveReview } from "@/lib/server/repositories/reviews";
import { listRuns } from "@/lib/server/repositories/runs";
import { listSourceStates, setSourceEnabled } from "@/lib/server/repositories/sources";
import {
  LOGIN_WINDOW_MS,
  MAX_LOGIN_FAILURES,
  adminConfig,
  clearSessionCookieHeader,
  clientKey,
  createSessionToken,
  isAdminRequest,
  isSameOriginRequest,
  sessionCookieHeader,
  verifyPassword,
} from "@/lib/security/admin-auth";
import type { ApiDeps } from "../deps";
import { ApiInputError, apiError, enumParam, handleApiError, isRecord, json, pagination, readJsonBody } from "../http";

/** Garante administrador autenticado (e, para alterações, origem do próprio site). */
function guard(request: Request, deps: ApiDeps, mutation: boolean): Response | null {
  const config = adminConfig(deps.env);
  if (!config.enabled) return apiError(503, "admin_desativado", "A área administrativa não está configurada neste ambiente.");
  if (mutation && !isSameOriginRequest(request, deps.env)) return apiError(403, "origem_invalida", "Requisição recusada: origem não permitida.");
  if (!isAdminRequest(request, deps.now(), deps.env)) return apiError(401, "nao_autenticado", "Faça login como administrador.");
  return null;
}

export async function handleSessionStatus(request: Request, deps: ApiDeps): Promise<Response> {
  const config = adminConfig(deps.env);
  return json({ adminEnabled: config.enabled, authenticated: config.enabled && isAdminRequest(request, deps.now(), deps.env) });
}

export async function handleLogin(request: Request, deps: ApiDeps): Promise<Response> {
  try {
    const config = adminConfig(deps.env);
    if (!config.enabled) return apiError(503, "admin_desativado", "A área administrativa não está configurada neste ambiente.");
    if (!isSameOriginRequest(request, deps.env)) return apiError(403, "origem_invalida", "Requisição recusada: origem não permitida.");
    const db = await deps.getDb();
    const key = clientKey(request);
    const now = deps.now();
    const failures = await countRecentLoginFailures(db, key, new Date(now.getTime() - LOGIN_WINDOW_MS));
    if (failures >= MAX_LOGIN_FAILURES) {
      return apiError(429, "muitas_tentativas", "Muitas tentativas. Aguarde 15 minutos.", { "retry-after": String(LOGIN_WINDOW_MS / 1000) });
    }
    const body = await readJsonBody(request, 4_000);
    const password = isRecord(body) && typeof body.password === "string" ? body.password : "";
    if (!password || !verifyPassword(password, config)) {
      await recordLoginAttempt(db, key, false, now);
      return apiError(401, "senha_incorreta", "Senha incorreta.");
    }
    await recordLoginAttempt(db, key, true, now);
    return json({ authenticated: true }, { headers: { "set-cookie": sessionCookieHeader(createSessionToken(config.secret, now), config, deps.env) } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleLogout(request: Request, deps: ApiDeps): Promise<Response> {
  if (!isSameOriginRequest(request, deps.env)) return apiError(403, "origem_invalida", "Requisição recusada: origem não permitida.");
  return json({ authenticated: false }, { headers: { "set-cookie": clearSessionCookieHeader(deps.env) } });
}

export async function handleOverview(request: Request, deps: ApiDeps): Promise<Response> {
  const denied = guard(request, deps, false);
  if (denied) return denied;
  try {
    const db = await deps.getDb();
    const now = deps.now();
    const schedule = readScheduleConfig(deps.env);
    const states = new Map((await listSourceStates(db)).map((state) => [state.id, state]));
    const runs = await listRuns(db, 10, 0);
    const todayStart = startOfZonedDay(now, schedule.timezone).getTime();
    const today = runs.items.filter((run) => run.startedAt && Date.parse(run.startedAt) >= todayStart);
    const sum = (field: "documentsNew" | "examsFound" | "questionsExtracted" | "questionsPublished" | "questionsPending" | "duplicates") =>
      today.reduce((total, run) => total + (run.stats[field] ?? 0), 0);
    const lock = await getLock(db, CRAWLER_LOCK);
    return json({
      schedule: {
        timezone: schedule.timezone,
        dailyHour: schedule.hour,
        nextPlannedRun: nextDailyRun(now, schedule).toISOString(),
        utcCron: utcCronExpression(schedule, now),
        cronSecretConfigured: (deps.env.CRON_SECRET ?? "").length >= 16,
      },
      running: Boolean(lock && Date.parse(lock.expiresAt) > now.getTime()),
      lastRun: runs.items[0] ?? null,
      today: {
        runs: today.length,
        documentsNew: sum("documentsNew"),
        examsFound: sum("examsFound"),
        questionsExtracted: sum("questionsExtracted"),
        questionsPublished: sum("questionsPublished"),
        questionsPending: sum("questionsPending"),
        duplicates: sum("duplicates"),
      },
      counts: await countByStatus(db),
      sources: CRAWLER_SOURCES.map((config) => {
        const state = states.get(config.id);
        return {
          id: config.id,
          name: config.name,
          kind: config.kind,
          homepage: config.homepage,
          allowedHosts: config.allowedHosts,
          frequency: config.frequency,
          strategy: config.strategy,
          automationAllowed: config.automation.allowed,
          automationNote: config.automation.allowed ? null : config.automation.reason,
          reusePolicy: config.reusePolicy,
          robots: config.robots,
          rateLimit: config.rateLimit,
          enabled: state?.enabled ?? false,
          health: state?.health ?? "unknown",
          lastRunAt: state?.lastRunAt ?? null,
          lastSuccessAt: state?.lastSuccessAt ?? null,
          nextRunAt: state?.nextRunAt ?? null,
          consecutiveFailures: state?.consecutiveFailures ?? 0,
          lastError: state?.lastError ?? null,
        };
      }),
      failedDocuments: (await listDocuments(db, { status: "failed", limit: 20 })).map((document) => ({
        id: document.id,
        url: document.url,
        kind: document.kind,
        attempts: document.attempts,
        lastError: document.lastError,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleRuns(request: Request, deps: ApiDeps): Promise<Response> {
  const denied = guard(request, deps, false);
  if (denied) return denied;
  try {
    const page = pagination(new URL(request.url), { defaultSize: 20, maxSize: 50 });
    const result = await listRuns(await deps.getDb(), page.limit, page.offset);
    return json({ items: result.items, page: page.page, pageSize: page.pageSize, total: result.total });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleRunNow(request: Request, deps: ApiDeps): Promise<Response> {
  const denied = guard(request, deps, true);
  if (denied) return denied;
  try {
    const body = await readJsonBody(request, 2_000).catch(() => ({}));
    const sourceId = isRecord(body) && typeof body.sourceId === "string" ? body.sourceId : undefined;
    if (sourceId) {
      const config = getSourceConfig(sourceId);
      if (!config) throw new ApiInputError("Fonte desconhecida.");
      if (!config.automation.allowed) throw new ApiInputError("Esta fonte não permite coleta automatizada. Use a importação manual.", 409, "fonte_sem_permissao");
    }
    const db = await deps.getDb();
    const lock = await getLock(db, CRAWLER_LOCK);
    if (lock && Date.parse(lock.expiresAt) > deps.now().getTime()) {
      return apiError(409, "coleta_em_andamento", "Já existe uma coleta em andamento.");
    }
    deps.runInBackground(async () => {
      await deps.crawl({ db, trigger: "manual", ...(sourceId ? { onlySourceId: sourceId } : {}) });
    });
    return json({ accepted: true, message: "Coleta iniciada. Acompanhe o resultado no histórico de execuções." }, { status: 202 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleToggleSource(request: Request, sourceId: string, deps: ApiDeps): Promise<Response> {
  const denied = guard(request, deps, true);
  if (denied) return denied;
  try {
    const config = getSourceConfig(sourceId);
    if (!config) return apiError(404, "nao_encontrado", "Fonte não encontrada.");
    const body = await readJsonBody(request, 1_000);
    if (!isRecord(body) || typeof body.enabled !== "boolean") throw new ApiInputError('Envie {"enabled": true|false}.');
    if (body.enabled && !config.automation.allowed) {
      throw new ApiInputError(`Não é possível ativar: ${config.automation.reason}`, 409, "fonte_sem_permissao");
    }
    await setSourceEnabled(await deps.getDb(), sourceId, body.enabled);
    return json({ id: sourceId, enabled: body.enabled });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleReprocess(request: Request, deps: ApiDeps): Promise<Response> {
  const denied = guard(request, deps, true);
  if (denied) return denied;
  try {
    const body = await readJsonBody(request, 4_000).catch(() => ({}));
    const ids = isRecord(body) && Array.isArray(body.documentIds) ? body.documentIds.filter((id): id is number => Number.isInteger(id)) : undefined;
    const count = await resetFailedDocuments(await deps.getDb(), ids);
    return json({ reset: count, message: `${count} documento(s) voltam para a fila e serão tentados na próxima coleta.` });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleListReview(request: Request, deps: ApiDeps): Promise<Response> {
  const denied = guard(request, deps, false);
  if (denied) return denied;
  try {
    const url = new URL(request.url);
    const status = enumParam(url, "status", ["open", "approved", "rejected", "dismissed"] as const) ?? "open";
    const page = pagination(url, { defaultSize: 20, maxSize: 100 });
    const result = await listReviews(await deps.getDb(), { status, limit: page.limit, offset: page.offset });
    return json({ items: result.items, page: page.page, pageSize: page.pageSize, total: result.total });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleResolveReview(request: Request, rawId: string, deps: ApiDeps): Promise<Response> {
  const denied = guard(request, deps, true);
  if (denied) return denied;
  try {
    if (!/^\d{1,9}$/.test(rawId)) throw new ApiInputError("Identificador inválido.");
    const body = await readJsonBody(request, 4_000);
    if (!isRecord(body) || (body.action !== "approve" && body.action !== "reject")) throw new ApiInputError('Envie "action": "approve" ou "reject".');
    const note = typeof body.note === "string" ? body.note : "";
    const item = await resolveReview(await deps.getDb(), { id: Number(rawId), action: body.action, note, resolvedBy: "admin" }, deps.now());
    return json(item);
  } catch (error) {
    return handleApiError(error);
  }
}

/** Importação de questões com texto integral (JSON), sempre para a fila de revisão. */
export async function handleImportQuestions(request: Request, deps: ApiDeps): Promise<Response> {
  const denied = guard(request, deps, true);
  if (denied) return denied;
  try {
    const body = await readJsonBody(request, 2_000_000);
    if (!isRecord(body)) throw new ApiInputError("Corpo inválido.");
    const authorization = typeof body.authorization === "string" ? body.authorization.trim() : "";
    const parsed = parseQuestionList(body.questions);
    const staticTexts = ALL_QUESTIONS.map((question) => ({ id: question.id, text: question.statement, hash: statementHash(question.statement, question.options) }));
    const db = await deps.getDb();
    const results: { id: string; status: string; reasons?: string[] }[] = parsed.errors.map((error) => ({ id: "?", status: "rejeitada", reasons: [error] }));

    for (const question of parsed.questions) {
      const validation = validateQuestion(question);
      const reasons = [...validation.errors];
      if (question.contentType === "oficial" && authorization.length < 10) {
        reasons.push("Questões oficiais exigem a descrição da autorização de reutilização (campo authorization).");
      }
      if (reasons.length > 0) {
        results.push({ id: question.id, status: "rejeitada", reasons });
        continue;
      }
      const hash = statementHash(question.statement, question.options);
      const twin = staticTexts.find((item) => item.hash === hash || isNearDuplicate(item.text, question.statement));
      if (twin) {
        results.push({ id: question.id, status: "duplicada", reasons: [`Igual ou quase igual à questão ${twin.id} do banco do site.`] });
        continue;
      }
      const inserted = await insertImportedQuestion(db, { question, statementHash: hash, authorization: authorization || "Questão autoral de prática.", importedBy: "admin" }, deps.now());
      results.push(
        inserted.status === "duplicate"
          ? { id: question.id, status: "duplicada", reasons: [`Já existe no banco central (${inserted.duplicateOf}).`] }
          : { id: inserted.id, status: "na_fila_de_revisao" },
      );
    }
    return json({ results });
  } catch (error) {
    return handleApiError(error);
  }
}

const MAX_PDF_BYTES = 20 * 1024 * 1024;

async function readPdf(form: FormData, field: string): Promise<Uint8Array> {
  const file = form.get(field);
  if (!(file instanceof File)) throw new ApiInputError(`Envie o arquivo "${field}".`);
  if (file.size > MAX_PDF_BYTES) throw new ApiInputError(`O arquivo "${field}" passa de 20 MB.`, 413, "conteudo_grande");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (new TextDecoder("latin1").decode(bytes.subarray(0, 5)) !== "%PDF-") throw new ApiInputError(`O arquivo "${field}" não é um PDF válido.`);
  return bytes;
}

function formText(form: FormData, field: string, required = true, max = 300): string {
  const value = form.get(field);
  const text = typeof value === "string" ? value.trim() : "";
  if (required && !text) throw new ApiInputError(`Preencha o campo "${field}".`);
  if (text.length > max) throw new ApiInputError(`O campo "${field}" é longo demais.`);
  return text;
}

/**
 * Importação manual de prova oficial (ex.: FGV, cujos termos proíbem coleta automatizada):
 * o administrador envia o caderno e o gabarito baixados do site oficial. O sistema lê os PDFs
 * com os mesmos validadores do coletor e coloca a prova na fila de revisão.
 */
export async function handleImportExam(request: Request, deps: ApiDeps): Promise<Response> {
  const denied = guard(request, deps, true);
  if (denied) return denied;
  try {
    const form = await request.formData();
    const sourceId = formText(form, "sourceId", true, 60);
    const source = getSourceConfig(sourceId);
    if (!source || source.automation.allowed || !source.automation.manualImport) {
      throw new ApiInputError("Escolha uma fonte que aceite importação manual.");
    }
    const examPageUrl = formText(form, "examPageUrl");
    const bookletUrl = formText(form, "bookletUrl");
    const answerKeyUrl = formText(form, "answerKeyUrl");
    const provenance = checkProvenance([examPageUrl, bookletUrl, answerKeyUrl], source);
    if (!provenance.ok) throw new ApiInputError(`Links fora do site oficial da fonte: ${provenance.errors.join(" ")}`);
    const role = formText(form, "role", true, 120);
    const bookletType = formText(form, "bookletType", false, 30) || "Tipo 1";
    const title = formText(form, "title", true, 200);
    const year = Number(formText(form, "year", true, 4));
    if (!Number.isInteger(year) || year < 1990 || year > 2100) throw new ApiInputError("Ano inválido.");
    const version = formText(form, "answerKeyVersion", true, 20);
    if (version !== "definitivo" && version !== "preliminar") throw new ApiInputError('Versão do gabarito deve ser "definitivo" ou "preliminar".');
    if (formText(form, "level", true, 20) !== "fundamental") throw new ApiInputError("Somente provas de nível fundamental.");

    const bookletBytes = await readPdf(form, "bookletPdf");
    const keyBytes = await readPdf(form, "answerKeyPdf");
    const booklet = parseBookletPages(await extractPdfPages(bookletBytes));
    const keyDocument = parseAnswerKeyPages(await extractPdfPages(keyBytes));

    // Escolhe o bloco do gabarito pelo nome do cargo e pelo tipo de caderno.
    const wantedRole = foldText(role);
    const ranked = keyDocument.blocks
      .map((block) => ({
        block,
        score: similarity(foldText(block.label), wantedRole) * (block.bookletType === null || foldText(block.bookletType) === foldText(bookletType) ? 1 : 0.5),
      }))
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    if (!best) throw new ApiInputError("Não foi possível ler o gabarito (nenhum bloco de respostas encontrado).");

    const { createHash } = await import("node:crypto");
    const hash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
    const candidate: ExamCandidate = {
      sourceId,
      dedupeKey: `${sourceId}|${examPageUrl}|${wantedRole}|${foldText(bookletType)}`,
      title,
      examBoard: source.examBoard,
      organization: formText(form, "organization", false, 200) || undefined,
      role,
      educationLevel: "fundamental",
      year,
      bookletType,
      examPageUrl,
      bookletUrl,
      booklet: { ...booklet, url: bookletUrl, sha256: hash(bookletBytes) },
      answerKey: {
        url: answerKeyUrl,
        sha256: hash(keyBytes),
        version,
        entries: best.block.entries,
        ...(keyDocument.headerVersion ? { headerVersion: keyDocument.headerVersion } : {}),
        blockLabel: `${best.block.label}${best.block.bookletType ? ` – ${best.block.bookletType}` : ""}`,
        matchConfidence: Number(best.score.toFixed(2)),
      },
      laterRectifications: [],
      sectionNotes: ["Prova importada manualmente pelo administrador a partir dos PDFs oficiais."],
      warnings: keyDocument.warnings,
    };
    const stats = emptySourceStats();
    const outcome = await processCandidate(await deps.getDb(), candidate, source, stats, deps.now(), {
      forceReview: { reason: "importacao_manual", details: `Bloco do gabarito usado: "${candidate.answerKey?.blockLabel}".` },
    });
    return json({
      outcome,
      examId: outcome.examId ?? examIdFor(sourceId, candidate.dedupeKey),
      questions: booklet.questionCount,
      sections: booklet.sections,
      answerKeyBlock: candidate.answerKey?.blockLabel,
      matchConfidence: candidate.answerKey?.matchConfidence,
      warnings: [...booklet.warnings, ...keyDocument.warnings],
    });
  } catch (error) {
    return handleApiError(error);
  }
}
