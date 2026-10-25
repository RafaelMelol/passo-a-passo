import "server-only";
import { topicName } from "@/data/subjects";
import type { SqlClient } from "@/lib/server/db/client";
import {
  countFailedChildren,
  getDocumentByUrl,
  markDocumentFailed,
  markDocumentStatus,
  markDocumentFetched,
  markDocumentProcessed,
  upsertDiscoveredDocument,
} from "@/lib/server/repositories/documents";
import { persistExam, type PersistQuestionInput } from "@/lib/server/repositories/exams";
import { dismissResolvedReviews, enqueueReview, type ReviewReason } from "@/lib/server/repositories/reviews";
import type { AdapterContext, SourceAdapter } from "./adapters/types";
import { CLASSIFIER_METHOD, DIFFICULTY_METHOD, classifyQuestion } from "./classification/classify";
import type { Fetcher } from "./http/fetcher";
import { sha256, statementHash } from "./normalizers/text";
import type { ExamCandidate, SourceConfig, SourceRunStats } from "./types";
import { validateExamCandidate } from "./validators/exam";

export function examIdFor(sourceId: string, dedupeKey: string): string {
  return `${sourceId}-${sha256(dedupeKey).slice(0, 12)}`;
}

export interface CandidateOutcome {
  status: "published" | "pending" | "skipped";
  examId?: string;
  reason?: string;
}

/** Valida, classifica e grava uma prova candidata. Nunca grava o texto das questões quando a política não permite. */
export async function processCandidate(
  db: SqlClient,
  candidate: ExamCandidate,
  source: SourceConfig,
  stats: SourceRunStats,
  now: Date,
  options: { forceReview?: { reason: ReviewReason; details: string } } = {},
): Promise<CandidateOutcome> {
  stats.examsFound++;
  const decision = validateExamCandidate(candidate, source);
  if (decision.action === "skip" || !candidate.booklet) {
    return { status: "skipped", reason: decision.skipReason ?? "Caderno indisponível." };
  }
  if (options.forceReview) {
    // Importações manuais nunca são publicadas sem a aprovação do administrador.
    decision.reviews.push({ ...options.forceReview, priority: 1 });
    decision.publicationStatus = "pending_validation";
    if (decision.verificationStatus === "verified_official") decision.verificationStatus = "pending";
  }

  const booklet = candidate.booklet;
  const key = candidate.answerKey ?? candidate.preliminaryKey ?? null;
  const keyByNumber = new Map((key?.entries ?? []).map((entry) => [entry.number, entry.answer]));
  const preliminary =
    candidate.answerKey && candidate.preliminaryKey
      ? new Map(candidate.preliminaryKey.entries.map((entry) => [entry.number, entry.answer]))
      : null;
  const verified = decision.verificationStatus === "verified_official";
  const finalKey = key?.version === "definitivo" || key?.version === "oficial-unico";
  const draftsByNumber = new Map(booklet.questions.map((question) => [question.number, question]));
  const sectionFor = (n: number) => booklet.sections.find((section) => n >= section.firstQuestion && n <= section.lastQuestion);

  const questions: PersistQuestionInput[] = [];
  for (let number = booklet.firstQuestion; number <= booklet.lastQuestion; number++) {
    const draft = draftsByNumber.get(number);
    const section = sectionFor(number);
    const fullText = draft ? `${draft.text} ${draft.options.map((option) => option.text).join(" ")}` : "";
    const classification = classifyQuestion({
      text: fullText,
      sectionTitle: section?.title,
      sectionSubject: section?.subject,
      optionCount: booklet.optionCount,
    });
    const hasAnswer = keyByNumber.has(number);
    const answer = hasAnswer ? (keyByNumber.get(number) ?? null) : null;
    const annulled = hasAnswer && answer === null && finalKey;
    const optionsComplete = draft ? draft.options.length === booklet.optionCount : false;
    questions.push({
      number,
      subject: classification.subject,
      topic: classification.topic,
      difficulty: classification.difficulty,
      classificationMethod: CLASSIFIER_METHOD,
      classificationConfidence: classification.topicConfidence,
      difficultyMethod: DIFFICULTY_METHOD,
      difficultyConfidence: classification.difficultyConfidence,
      levelFlags: classification.levelFlags,
      correctOption: answer,
      ...(preliminary && preliminary.has(number) && preliminary.get(number) !== answer ? { preliminaryOption: preliminary.get(number) ?? null } : {}),
      verificationStatus: annulled ? "annulled" : verified && hasAnswer ? "verified_official" : "pending",
      // O hash usa só o texto em memória; o texto em si não é gravado (política "metadados e gabarito").
      statementHash: draft && draft.text.length >= 30 ? statementHash(draft.text, draft.options) : null,
      extractionConfidence: !draft ? 0 : optionsComplete ? 0.9 : 0.6,
      page: draft?.page ?? null,
      topicLabel: classification.topic ? topicName(classification.topic) : (section?.title ?? null),
    });
  }

  const examId = examIdFor(candidate.sourceId, candidate.dedupeKey);
  const result = await persistExam(
    db,
    {
      examId,
      sourceId: candidate.sourceId,
      dedupeKey: candidate.dedupeKey,
      title: candidate.title,
      examBoard: candidate.examBoard,
      organization: candidate.organization ?? null,
      role: candidate.role,
      educationLevel: candidate.educationLevel,
      year: candidate.year ?? null,
      examDate: candidate.examDate ?? null,
      bookletType: candidate.bookletType,
      questionCount: booklet.questionCount,
      optionCount: Math.max(2, Math.min(5, booklet.optionCount || 4)),
      examPageUrl: candidate.examPageUrl,
      bookletUrl: candidate.bookletUrl,
      bookletSha256: booklet.sha256,
      answerKeyUrl: key?.url ?? null,
      answerKeySha256: key?.sha256 ?? null,
      answerKeyVersion: key?.version ?? "nenhum",
      sections: booklet.sections,
      reusePolicy: source.reusePolicy.mode,
      publicationStatus: decision.publicationStatus === "rejected" ? "rejected" : decision.publicationStatus,
      verificationStatus: decision.verificationStatus,
      confidence: decision.confidence,
      notes: decision.notes,
      questions,
    },
    now,
  );

  for (const review of decision.reviews) {
    await enqueueReview(db, { itemType: "exam", itemId: result.examId, reason: review.reason, details: review.details, priority: review.priority });
  }
  await dismissResolvedReviews(db, "exam", result.examId, decision.reviews.map((review) => review.reason), now);

  for (const url of [candidate.bookletUrl, candidate.answerKey?.url, candidate.preliminaryKey?.url]) {
    if (url) await markDocumentProcessed(db, url, now);
  }

  stats.questionsExtracted += questions.length;
  stats.revisions += result.revisions;
  stats.duplicates += result.duplicates;
  const countable = questions.filter((question) => question.verificationStatus !== "annulled").length;
  if (decision.publicationStatus === "published") {
    stats.questionsApproved += countable;
    stats.questionsPublished += countable;
    return { status: "published", examId: result.examId };
  }
  stats.questionsPending += countable;
  return { status: "pending", examId: result.examId };
}

/** Contexto entregue ao adaptador: downloads protegidos e registrados, orçamento de tempo e de downloads. */
export function createAdapterContext(input: {
  db: SqlClient;
  source: SourceConfig;
  fetcher: Fetcher;
  now: () => Date;
  deadline: number;
  stats: SourceRunStats;
  warnings: string[];
}): AdapterContext {
  let downloads = 0;
  return {
    source: input.source,
    db: input.db,
    fetcher: input.fetcher,
    now: input.now,
    stats: input.stats,
    timeLeftMs: () => input.deadline - input.now().getTime(),
    warn: (message) => input.warnings.push(`[${input.source.id}] ${message}`),
    downloadsLeft: () => input.source.rateLimit.maxDownloadsPerRun - downloads,
    failedChildren: (parentUrl) => countFailedChildren(input.db, parentUrl),
    async documentStatus(url) {
      const document = await getDocumentByUrl(input.db, url);
      return document ? { status: document.status, processedAt: document.processedAt, lastCheckedAt: document.lastCheckedAt } : null;
    },
    async fetchDocument({ url, kind, accept, title, parentUrl }) {
      const { document, isNew } = await upsertDiscoveredDocument(input.db, { sourceId: input.source.id, url, kind, title, parentUrl });
      input.stats.documentsFound++;
      if (isNew) input.stats.documentsNew++;
      const previouslyProcessed = document.status === "processed" || document.status === "unchanged";
      if (accept === "pdf") {
        if (downloads >= input.source.rateLimit.maxDownloadsPerRun) throw new Error("Limite de downloads desta execução atingido.");
        downloads++;
      }
      try {
        const resource = await input.fetcher.fetch(url, { source: input.source, accept });
        const { changed } = await markDocumentFetched(
          input.db,
          url,
          { sha256: resource.sha256, contentType: resource.contentType, byteSize: resource.body.length },
          input.now(),
        );
        input.stats.documentsFetched++;
        if (!changed) input.stats.documentsUnchanged++;
        if (kind === "listing" || kind === "exam_page") await markDocumentProcessed(input.db, url, input.now());
        return { resource, changed, isNew, previouslyProcessed };
      } catch (error) {
        await markDocumentFailed(input.db, url, error, input.now());
        throw error;
      } finally {
        input.stats.requests = input.fetcher.requestsFor(input.source.id);
      }
    },
  };
}

/** Executa um adaptador; falhas em uma prova não interrompem as outras. */
export async function runAdapter(
  adapter: SourceAdapter,
  context: AdapterContext,
  db: SqlClient,
  now: () => Date,
  onProgress?: () => Promise<void>,
): Promise<{ published: number; pending: number; skipped: number; errors: string[] }> {
  const outcome = { published: 0, pending: 0, skipped: 0, errors: [] as string[] };
  for await (const candidate of adapter.run(context)) {
    try {
      const result = await processCandidate(db, candidate, context.source, context.stats, now());
      if (result.status === "published") outcome.published++;
      else if (result.status === "pending") outcome.pending++;
      else {
        outcome.skipped++;
        context.warn(`${candidate.title}: ${result.reason}`);
        // Não baixa de novo todos os dias: volta a conferir depois de 30 dias.
        for (const url of [candidate.bookletUrl, candidate.answerKey?.url]) if (url) await markDocumentStatus(db, url, "skipped", now(), result.reason);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      outcome.errors.push(`${candidate.title}: ${message}`);
      for (const url of [candidate.bookletUrl, candidate.answerKey?.url]) if (url) await markDocumentFailed(db, url, error, now());
    }
    if (onProgress) await onProgress();
  }
  return outcome;
}
