import { OPTION_LETTERS } from "@/types/question";
import type { ReviewReason } from "@/lib/server/repositories/reviews";
import { isContiguous } from "../parsers/answer-key";
import type { ExamCandidate, SourceConfig } from "../types";
import { checkProvenance } from "./provenance";

export interface ExamDecision {
  action: "persist" | "skip";
  skipReason?: string;
  publicationStatus: "published" | "pending_validation" | "rejected";
  verificationStatus: "verified_official" | "pending" | "disputed" | "rejected";
  confidence: number;
  reviews: { reason: ReviewReason; details: string; priority: number }[];
  /** Observações públicas exibidas junto da prova. */
  notes: string[];
  /** Avisos internos (painel de administração). */
  warnings: string[];
}

/** Pendências que impedem a publicação automática. */
const BLOCKING: ReadonlySet<ReviewReason> = new Set([
  "gabarito_preliminar",
  "contagem_divergente",
  "letra_invalida",
  "bloco_incerto",
  "sem_texto_no_pdf",
  "retificacao_posterior",
  "estrutura_incompleta",
  "nivel_nao_confirmado",
  "importacao_manual",
]);

function skip(reason: string): ExamDecision {
  return {
    action: "skip",
    skipReason: reason,
    publicationStatus: "rejected",
    verificationStatus: "rejected",
    confidence: 0,
    reviews: [],
    notes: [],
    warnings: [reason],
  };
}

/**
 * Decide o destino de uma prova encontrada. Só publica automaticamente quando:
 * a procedência é a fonte oficial autorizada; o gabarito é o oficial final; caderno e gabarito
 * têm exatamente as mesmas questões; as letras existem no caderno; não há retificação posterior.
 */
export function validateExamCandidate(candidate: ExamCandidate, source: SourceConfig): ExamDecision {
  const provenance = checkProvenance(
    [candidate.examPageUrl, candidate.bookletUrl, candidate.answerKey?.url, candidate.preliminaryKey?.url].filter(
      (url): url is string => Boolean(url),
    ),
    source,
  );
  if (!provenance.ok) return skip(`Procedência não verificável: ${provenance.errors.join(" ")}`);
  if (source.reusePolicy.mode === "none") return skip("A política da fonte não permite armazenar dados desta prova.");
  if (candidate.educationLevel !== "fundamental" && candidate.educationLevel !== "desconhecido") {
    return skip(`Prova de nível ${candidate.educationLevel}: fora do escopo (nível fundamental).`);
  }
  if (!candidate.booklet) return skip("Caderno de prova indisponível.");

  const booklet = candidate.booklet;
  const reviews: ExamDecision["reviews"] = [];
  const notes: string[] = [...(candidate.sectionNotes ?? [])];
  const warnings: string[] = [...candidate.warnings, ...booklet.warnings];
  let confidence = 1;

  if (!booklet.sections.some((section) => section.subject)) {
    return skip("O caderno não tem seções de Português, Matemática ou Informática.");
  }
  if (candidate.educationLevel === "desconhecido") {
    reviews.push({ reason: "nivel_nao_confirmado", details: "A escolaridade exigida não foi confirmada nos documentos.", priority: 2 });
  }
  if (!booklet.hasTextLayer || booklet.questionCount === 0) {
    reviews.push({ reason: "sem_texto_no_pdf", details: "O caderno não tem texto selecionável; seria necessário OCR.", priority: 2 });
  }

  const key = candidate.answerKey ?? candidate.preliminaryKey ?? null;
  if (!key) {
    if (candidate.answerKeyHasText !== false) return skip("Nenhum gabarito encontrado para o caderno.");
    // Gabarito escaneado: nada é inventado; a prova fica pendente até alguém conferir (ou haver OCR).
    reviews.push({ reason: "sem_texto_no_pdf", details: "O PDF do gabarito não tem texto selecionável (documento escaneado).", priority: 2 });
    return {
      action: "persist",
      publicationStatus: "pending_validation",
      verificationStatus: "pending",
      confidence: 0,
      reviews,
      notes,
      warnings,
    };
  }
  if (key.version === "preliminar") {
    reviews.push({ reason: "gabarito_preliminar", details: "Só o gabarito preliminar foi publicado; aguardando o definitivo.", priority: 3 });
  }

  const entries = key.entries;
  const keyFirst = entries[0]?.number;
  const keyLast = entries[entries.length - 1]?.number;
  if (!isContiguous(entries) || keyFirst !== booklet.firstQuestion || keyLast !== booklet.lastQuestion) {
    reviews.push({
      reason: "contagem_divergente",
      details: `Caderno: questões ${booklet.firstQuestion} a ${booklet.lastQuestion}. Gabarito: ${keyFirst ?? "?"} a ${keyLast ?? "?"} (${entries.length} respostas).`,
      priority: 1,
    });
    confidence -= 0.5;
  }

  const allowed = OPTION_LETTERS.slice(0, Math.max(2, booklet.optionCount));
  const invalid = entries.filter((entry) => entry.answer !== null && !allowed.includes(entry.answer));
  if (invalid.length > 0) {
    reviews.push({
      reason: "letra_invalida",
      details: `Letras sem alternativa correspondente no caderno (${booklet.optionCount} alternativas): questões ${invalid.map((e) => e.number).join(", ")}.`,
      priority: 1,
    });
    confidence -= 0.4;
  }

  if (key.matchConfidence < 0.85) {
    reviews.push({ reason: "bloco_incerto", details: `Correspondência entre caderno e bloco "${key.blockLabel}" com confiança ${key.matchConfidence.toFixed(2)}.`, priority: 1 });
    confidence -= 0.3;
  }

  const incomplete = booklet.questions.filter((question) => question.options.length !== booklet.optionCount).length;
  const incompleteRatio = booklet.questions.length > 0 ? incomplete / booklet.questions.length : 1;
  if (incompleteRatio > 0.3) {
    reviews.push({ reason: "estrutura_incompleta", details: `${incomplete} questões com alternativas incompletas na extração.`, priority: 2 });
  }
  confidence -= incompleteRatio * 0.2;

  if (candidate.laterRectifications.length > 0) {
    reviews.push({
      reason: "retificacao_posterior",
      details: `Conferir: ${candidate.laterRectifications.map((item) => item.title).join("; ")}.`,
      priority: 1,
    });
  }

  const flagged = booklet.questions.filter((question) => /\b(logaritm|exponencial|seno|cosseno|matriz|derivada)/i.test(question.text)).length;
  if (flagged >= 3) {
    reviews.push({ reason: "conteudo_acima_do_nivel", details: `${flagged} questões citam conteúdos típicos do ensino médio.`, priority: 3 });
  }

  if (key.headerVersion && key.version !== "oficial-unico" && key.headerVersion !== key.version) {
    notes.push(
      `O arquivo publicado como gabarito ${key.version} traz "${key.headerVersion}" no cabeçalho; foi considerado o rótulo do link na página oficial.`,
    );
  }
  if (key.version === "oficial-unico") notes.push("A instituição publica um único gabarito oficial para esta aplicação.");
  const annulled = entries.filter((entry) => entry.answer === null).map((entry) => entry.number);
  if (annulled.length > 0) notes.push(`Questões anuladas: ${annulled.join(", ")}. Elas não contam na correção.`);

  const blocking = reviews.some((review) => BLOCKING.has(review.reason));
  const disputed = reviews.some((review) => review.reason === "letra_invalida" || review.reason === "contagem_divergente");
  const finalKey = key.version === "definitivo" || key.version === "oficial-unico";
  const publish = !blocking && finalKey;

  return {
    action: "persist",
    publicationStatus: publish ? "published" : "pending_validation",
    verificationStatus: publish ? "verified_official" : disputed ? "disputed" : "pending",
    confidence: Math.max(0, Number(confidence.toFixed(2))),
    reviews,
    notes,
    warnings,
  };
}
