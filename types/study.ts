import type { Difficulty, OptionLetter, SubjectId, TopicId } from "./question";

export type StudyMode = "pratica" | "simulado";

/** Uma resposta dada a uma questão do banco. */
export interface AnswerAttempt {
  questionId: string;
  subject: SubjectId;
  topic: TopicId;
  difficulty: Difficulty;
  selected: OptionLetter;
  isCorrect: boolean;
  answeredAt: string;
  mode: StudyMode;
  /** Versão da questão respondida (o histórico não muda se a questão for atualizada depois). */
  questionVersion?: number;
}

export interface ScoreSummary {
  total: number;
  answered: number;
  correct: number;
  wrong: number;
  blank: number;
  /** Aproveitamento de 0 a 100, sobre o total de questões. */
  percentage: number;
}

export interface PracticeFilters {
  subject: SubjectId;
  topic: TopicId | "todos";
  difficulty: Difficulty | "todas";
  /** Origem das questões: todas, só oficiais verificadas ou só de prática. Ausente = todas. */
  origin?: "todas" | "oficiais" | "pratica";
}

/** Lista de prática em andamento — permite retomar de onde parou. */
export interface PracticeProgress {
  filterKey: string;
  filters: PracticeFilters;
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, OptionLetter>;
  startedAt: string;
  updatedAt: string;
}

export interface SimuladoConfig {
  questionCount: number;
  /** Lista vazia = todas as disciplinas misturadas. */
  subjects: SubjectId[];
  difficulty: Difficulty | "todas";
  timerEnabled: boolean;
}

export interface SimuladoSession {
  id: string;
  config: SimuladoConfig;
  questionIds: string[];
  answers: Record<string, OptionLetter>;
  currentIndex: number;
  startedAt: string;
  /** Tempo acumulado com a tela do simulado aberta. */
  elapsedMs: number;
}

export interface SimuladoItemResult {
  questionId: string;
  subject: SubjectId;
  topic: TopicId;
  selected: OptionLetter | null;
  correctOption: OptionLetter;
  isCorrect: boolean;
}

export interface TopicReview {
  subject: SubjectId;
  topic: TopicId;
  wrong: number;
  total: number;
}

export interface SimuladoResult {
  id: string;
  config: SimuladoConfig;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  items: SimuladoItemResult[];
  score: ScoreSummary;
  topicsToReview: TopicReview[];
}

export interface OfficialExamDraft {
  examId: string;
  sectionIds: string[];
  answers: Record<string, OptionLetter>;
  updatedAt: string;
}

export interface OfficialExamAttempt {
  id: string;
  examId: string;
  sectionIds: string[];
  answers: Record<string, OptionLetter>;
  finishedAt: string;
  score: ScoreSummary;
}

export interface LastActivity {
  kind: "pratica" | "simulado" | "prova-oficial";
  title: string;
  href: string;
  at: string;
}

export interface StudySettings {
  name: string;
}

export interface StudyData {
  version: 1;
  attempts: AnswerAttempt[];
  practice: PracticeProgress | null;
  activeSimulado: SimuladoSession | null;
  simulados: SimuladoResult[];
  officialDrafts: Record<string, OfficialExamDraft>;
  officialAttempts: OfficialExamAttempt[];
  lastActivity: LastActivity | null;
  settings: StudySettings;
}
