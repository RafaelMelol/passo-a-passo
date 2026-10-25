import "server-only";
import { SUBJECTS, isTopicId, isTopicOfSubject } from "@/data/subjects";
import { readScheduleConfig, nextDailyRun } from "@/lib/crawler/scheduler/schedule";
import { gradeOfficialExam } from "@/lib/official";
import {
  getPublicFilters,
  getPublishedAnswerKey,
  getPublishedExam,
  getUpdateStatus,
  listPublishedExams,
  listPublishedQuestions,
  listRecentUpdates,
  type PublicExam,
} from "@/lib/server/repositories/public";
import type { OfficialExam } from "@/types/official";
import { OPTION_LETTERS, type OptionLetter, type TopicId } from "@/types/question";
import type { ApiDeps } from "../deps";
import { ApiInputError, enumParam, handleApiError, intParam, isRecord, json, pagination, readJsonBody, textParam, apiError } from "../http";

const SUBJECT_IDS = SUBJECTS.map((subject) => subject.id);
const EXAM_ID = /^[a-z0-9][a-z0-9-]{2,80}$/;

export async function handleListQuestions(request: Request, deps: ApiDeps): Promise<Response> {
  try {
    const url = new URL(request.url);
    const subject = enumParam(url, "disciplina", SUBJECT_IDS);
    const topic = textParam(url, "assunto", 40);
    if (topic && (!isTopicId(topic) || (subject && !isTopicOfSubject(subject, topic)))) throw new ApiInputError('Assunto inválido para "assunto".');
    const difficulty = enumParam(url, "dificuldade", ["facil", "medio", "dificil"] as const);
    const type = enumParam(url, "tipo", ["oficial", "pratica"] as const);
    const page = pagination(url, { defaultSize: 50, maxSize: 500 });
    const db = await deps.getDb();
    const result = await listPublishedQuestions(
      db,
      {
        subject,
        topic,
        difficulty,
        contentType: type === "oficial" ? "oficial" : type === "pratica" ? "pratica-autoral" : undefined,
        examBoard: textParam(url, "banca"),
        year: intParam(url, "ano", { min: 1990, max: 2100 }),
        recentDays: intParam(url, "recentes", { min: 1, max: 365 }),
        limit: page.limit,
        offset: page.offset,
      },
      deps.now(),
    );
    return json({ items: result.items, page: page.page, pageSize: page.pageSize, total: result.total });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleQuestionFilters(_request: Request, deps: ApiDeps): Promise<Response> {
  try {
    return json(await getPublicFilters(await deps.getDb()));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleUpdateStatus(_request: Request, deps: ApiDeps): Promise<Response> {
  try {
    const status = await getUpdateStatus(await deps.getDb(), deps.now());
    const schedule = readScheduleConfig(deps.env);
    return json({
      ...status,
      schedule: { timezone: schedule.timezone, dailyHour: schedule.hour, nextPlannedRun: nextDailyRun(deps.now(), schedule).toISOString() },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleRecentUpdates(request: Request, deps: ApiDeps): Promise<Response> {
  try {
    const limit = intParam(new URL(request.url), "limite", { min: 1, max: 50, fallback: 10 }) as number;
    return json({ items: await listRecentUpdates(await deps.getDb(), limit) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleListExams(request: Request, deps: ApiDeps): Promise<Response> {
  try {
    const url = new URL(request.url);
    const page = pagination(url, { defaultSize: 20, maxSize: 100 });
    const result = await listPublishedExams(
      await deps.getDb(),
      {
        examBoard: textParam(url, "banca"),
        year: intParam(url, "ano", { min: 1990, max: 2100 }),
        recentDays: intParam(url, "recentes", { min: 1, max: 365 }),
        limit: page.limit,
        offset: page.offset,
      },
      deps.now(),
    );
    return json({ items: result.items, page: page.page, pageSize: page.pageSize, total: result.total });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleGetExam(_request: Request, id: string, deps: ApiDeps): Promise<Response> {
  try {
    if (!EXAM_ID.test(id)) throw new ApiInputError("Identificador de prova inválido.");
    const exam = await getPublishedExam(await deps.getDb(), id);
    if (!exam) return apiError(404, "nao_encontrado", "Prova não encontrada.");
    return json(exam);
  } catch (error) {
    return handleApiError(error);
  }
}

function toOfficialExam(exam: PublicExam, key: Awaited<ReturnType<typeof getPublishedAnswerKey>>): OfficialExam {
  return {
    id: exam.id,
    title: exam.title,
    examBoard: exam.examBoard,
    organization: exam.organization ?? exam.examBoard,
    role: exam.role,
    level: exam.educationLevel,
    year: exam.year ?? 0,
    examDate: exam.examDate ?? "",
    bookletType: exam.bookletType,
    questionCount: exam.questionCount,
    optionCount: exam.optionCount === 4 ? 4 : 5,
    links: { examPage: exam.examPageUrl, booklet: exam.bookletUrl, answerKeyFinal: exam.answerKeyUrl ?? exam.examPageUrl },
    sections: exam.sections,
    answerKey: key.map((entry) => ({
      number: entry.number,
      answer: entry.answer,
      status: entry.status,
      ...(entry.topic && isTopicId(entry.topic) ? { topic: entry.topic as TopicId } : {}),
      ...(entry.topicLabel ? { topicLabel: entry.topicLabel } : {}),
    })),
    verification: { checkedAt: (exam.publishedAt ?? "").slice(0, 10), method: "Gabarito oficial", notes: exam.notes },
  };
}

/** Corrige o cartão-resposta no servidor: o gabarito só é revelado depois do envio. */
export async function handleGradeExam(request: Request, id: string, deps: ApiDeps): Promise<Response> {
  try {
    if (!EXAM_ID.test(id)) throw new ApiInputError("Identificador de prova inválido.");
    const body = await readJsonBody(request, 64_000);
    if (!isRecord(body) || !isRecord(body.answers) || !Array.isArray(body.sectionIds)) {
      throw new ApiInputError('Envie "answers" (objeto) e "sectionIds" (lista).');
    }
    const db = await deps.getDb();
    const exam = await getPublishedExam(db, id);
    if (!exam) return apiError(404, "nao_encontrado", "Prova não encontrada.");
    const validSections = new Set(exam.sections.map((section) => section.id));
    const sectionIds = body.sectionIds.filter((value): value is string => typeof value === "string" && validSections.has(value));
    const answers: Record<string, OptionLetter> = {};
    for (const [number, letter] of Object.entries(body.answers)) {
      if (!/^\d{1,3}$/.test(number) || !(OPTION_LETTERS as readonly unknown[]).includes(letter)) {
        throw new ApiInputError(`Resposta inválida para a questão ${number.slice(0, 5)}.`);
      }
      answers[number] = letter as OptionLetter;
    }
    const key = await getPublishedAnswerKey(db, id);
    return json(gradeOfficialExam(toOfficialExam(exam, key), answers, sectionIds));
  } catch (error) {
    return handleApiError(error);
  }
}
