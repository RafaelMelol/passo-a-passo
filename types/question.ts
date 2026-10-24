import type { Difficulty, SubjectId, TopicId } from "@/data/subjects";

export type { Difficulty, SubjectId, TopicId };

export const OPTION_LETTERS = ["A", "B", "C", "D", "E"] as const;
export type OptionLetter = (typeof OPTION_LETTERS)[number];

/** "oficial": questão de prova publicada por banca/órgão, com autorização de uso. */
export type ContentType = "oficial" | "pratica-autoral";

/**
 * verificada: conferida com a fonte (ou revisada, no caso de questão autoral).
 * pendente: ainda não conferida — nunca é usada para pontuar.
 * divergente: há dúvida entre fontes ou recurso em andamento.
 * anulada: anulada pela banca.
 */
export type VerificationStatus = "verificada" | "pendente" | "divergente" | "anulada";

export interface QuestionOption {
  letter: OptionLetter;
  text: string;
  /** Por que esta alternativa não é a correta (opcional, mostrado na explicação). */
  whyWrong?: string;
}

export interface QuestionExplanation {
  /** Por que a alternativa correta é a adequada, em português simples. */
  summary: string;
  /** Passo a passo (usado principalmente em Matemática). */
  steps?: string[];
  /** Regra ou dica para lembrar. */
  tip?: string;
}

export interface SupportText {
  title?: string;
  body: string;
  credit?: string;
}

export interface QuestionSource {
  /** Descrição legível da origem, sempre presente. */
  description: string;
  url?: string;
  /** Banca organizadora. */
  examBoard?: string;
  /** Nome do concurso. */
  exam?: string;
  organization?: string;
  role?: string;
  year?: number;
  originalNumber?: number;
}

export interface QuestionVerification {
  /** O enunciado confere com a fonte original. */
  statement: VerificationStatus;
  /** O gabarito confere com o gabarito definitivo da fonte. */
  answerKey: VerificationStatus;
  /** Data da conferência (AAAA-MM-DD). */
  checkedAt?: string;
  notes?: string;
}

export interface Question {
  id: string;
  subject: SubjectId;
  topic: TopicId;
  difficulty: Difficulty;
  statement: string;
  supportText?: SupportText;
  options: QuestionOption[];
  correctOption: OptionLetter;
  explanation: QuestionExplanation;
  contentType: ContentType;
  source: QuestionSource;
  verification: QuestionVerification;
}
