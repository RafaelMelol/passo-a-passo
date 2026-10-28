import type { OptionLetter, SubjectId, TopicId } from "@/types/question";

/** Como o conteúdo de uma fonte pode ser reutilizado neste site. */
export interface ReusePolicy {
  /**
   * metadata-and-answer-key: guarda só metadados, gabarito oficial e link para o documento original.
   * full-text-authorized: o texto integral pode ser armazenado (licença ou autorização comprovada).
   * none: nada é armazenado automaticamente.
   */
  mode: "metadata-and-answer-key" | "full-text-authorized" | "none";
  summary: string;
  license?: string;
  licenseUrl?: string;
  termsUrl?: string;
  checkedAt: string;
}

export interface SourceConfig {
  id: string;
  name: string;
  examBoard: string;
  organization: string;
  kind: "repositorio-oficial" | "banca-oficial" | "manual";
  homepage: string;
  startUrls: readonly string[];
  /** Somente estes hosts podem ser acessados pelo coletor desta fonte. */
  allowedHosts: readonly string[];
  strategy: string;
  formats: readonly ("text/html" | "application/pdf")[];
  frequency: "diaria" | "semanal" | "manual";
  rateLimit: {
    minIntervalMs: number;
    maxRequestsPerRun: number;
    maxDownloadsPerRun: number;
    maxBytes: number;
    timeoutMs: number;
  };
  /** Se a coleta automatizada é permitida e o adaptador existe. */
  automation:
    | { allowed: true; adapter: string }
    | { allowed: false; reason: string; manualImport: boolean };
  defaultEnabled: boolean;
  reusePolicy: ReusePolicy;
  robots: { checkedAt: string; summary: string };
}

export type EducationLevel = "fundamental" | "medio" | "superior" | "desconhecido";

export interface AnswerKeyEntry {
  number: number;
  /** null = questão anulada. */
  answer: OptionLetter | null;
}

export interface ParsedAnswerKey {
  url: string;
  sha256: string;
  version: "preliminar" | "definitivo" | "oficial-unico";
  entries: AnswerKeyEntry[];
  /** Texto de versão encontrado no cabeçalho do PDF, quando houver (pode divergir do link). */
  headerVersion?: "preliminar" | "definitivo";
  /** Rótulo do bloco (cargo/área) de onde o gabarito foi lido. */
  blockLabel: string;
  matchConfidence: number;
}

export interface BookletQuestionDraft {
  number: number;
  /** Texto usado só em memória para classificar e calcular hash. Nunca é gravado se a política não permitir. */
  text: string;
  options: { letter: OptionLetter; text: string }[];
  page: number;
  sectionTitle?: string;
}

export interface BookletSection {
  id: string;
  title: string;
  subject?: SubjectId;
  firstQuestion: number;
  lastQuestion: number;
}

export interface ParsedBooklet {
  url: string;
  sha256: string;
  firstQuestion: number;
  lastQuestion: number;
  questionCount: number;
  optionCount: number;
  sections: BookletSection[];
  questions: BookletQuestionDraft[];
  hasTextLayer: boolean;
  warnings: string[];
}

/** Uma prova encontrada e lida por um adaptador, antes da validação. */
export interface ExamCandidate {
  sourceId: string;
  /** Chave estável usada para evitar duplicidade entre execuções. */
  dedupeKey: string;
  title: string;
  examBoard: string;
  organization?: string;
  role: string;
  educationLevel: EducationLevel;
  year?: number;
  examDate?: string;
  bookletType: string;
  examPageUrl: string;
  bookletUrl: string;
  booklet: ParsedBooklet | null;
  answerKey: ParsedAnswerKey | null;
  /** Gabarito preliminar, quando também publicado (para registrar diferenças). */
  preliminaryKey?: ParsedAnswerKey | null;
  /** false quando o PDF do gabarito não tem texto selecionável (escaneado). */
  answerKeyHasText?: boolean;
  /** Endereço do PDF do gabarito baixado, mesmo quando não foi possível lê-lo (para não baixá-lo de novo a cada coleta). */
  answerKeyDocumentUrl?: string;
  /** Retificações publicadas depois do gabarito usado (exigem revisão humana). */
  laterRectifications: { url: string; title: string }[];
  sectionNotes?: string[];
  warnings: string[];
}

export interface ClassificationResult {
  subject: SubjectId | null;
  topic: TopicId | null;
  topicConfidence: number;
  difficulty: "facil" | "medio" | "dificil";
  difficultyConfidence: number;
  levelFlags: string[];
  method: string;
}

export interface SourceRunStats {
  requests: number;
  documentsFound: number;
  documentsNew: number;
  documentsFetched: number;
  documentsUnchanged: number;
  examsFound: number;
  questionsExtracted: number;
  questionsApproved: number;
  questionsPublished: number;
  questionsPending: number;
  questionsRejected: number;
  duplicates: number;
  revisions: number;
}

export function emptySourceStats(): SourceRunStats {
  return {
    requests: 0,
    documentsFound: 0,
    documentsNew: 0,
    documentsFetched: 0,
    documentsUnchanged: 0,
    examsFound: 0,
    questionsExtracted: 0,
    questionsApproved: 0,
    questionsPublished: 0,
    questionsPending: 0,
    questionsRejected: 0,
    duplicates: 0,
    revisions: 0,
  };
}
