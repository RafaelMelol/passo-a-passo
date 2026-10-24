import type { OptionLetter, SubjectId, TopicId } from "./question";

/**
 * Prova oficial disponível apenas por link.
 * Os enunciados NÃO são copiados (direitos autorais da banca): guardamos só
 * os dados de referência e o gabarito definitivo, que permite a correção
 * automática pelo cartão-resposta.
 */
export interface OfficialExamSection {
  id: string;
  title: string;
  /** Disciplina do site correspondente, quando houver. */
  subject?: SubjectId;
  firstQuestion: number;
  lastQuestion: number;
}

export interface OfficialAnswerKeyItem {
  number: number;
  /** null quando a questão foi anulada. */
  answer: OptionLetter | null;
  status: "valida" | "anulada";
  /** Assunto do site para indicar prática, quando houver correspondência. */
  topic?: TopicId;
  /** Descrição curta do assunto (escrita por nós, não copiada da prova). */
  topicLabel?: string;
}

export interface OfficialExam {
  id: string;
  title: string;
  examBoard: string;
  organization: string;
  role: string;
  level: string;
  year: number;
  examDate: string;
  bookletType: string;
  questionCount: number;
  optionCount: 4 | 5;
  links: {
    examPage: string;
    booklet: string;
    answerKeyFinal: string;
    answerKeyPreliminary?: string;
  };
  sections: OfficialExamSection[];
  answerKey: OfficialAnswerKeyItem[];
  verification: {
    checkedAt: string;
    method: string;
    notes: string[];
  };
}

export interface OfficialRepository {
  name: string;
  description: string;
  url: string;
  /** "verificado": o link respondeu normalmente na data indicada. */
  linkStatus: "verificado" | "nao-verificado";
  checkedAt: string;
}
