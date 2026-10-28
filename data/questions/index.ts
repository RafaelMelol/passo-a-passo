import { parseQuestionList } from "@/lib/questions/parse";
import type { Question } from "@/types/question";
import { conhecimentosGeraisQuestions } from "./conhecimentos-gerais";
import importadas from "./importadas.json";
import { informaticaQuestions } from "./informatica";
import { lote202610Questions } from "./lote-2026-10";
import { lote202610bQuestions } from "./lote-2026-10-b";
import { matematicaQuestions } from "./matematica";
import { portuguesQuestions } from "./portugues";

/**
 * Ponto único de entrada das questões.
 * Para adicionar questões, edite os arquivos por disciplina ou inclua
 * objetos no arquivo importadas.json (veja o README). Todas passam pela
 * validação em lib/questions/bank.ts antes de aparecer no site.
 */
const imported = parseQuestionList(importadas);

export const IMPORT_ERRORS: readonly string[] = imported.errors;

export const ALL_QUESTIONS: readonly Question[] = [
  ...portuguesQuestions,
  ...matematicaQuestions,
  ...informaticaQuestions,
  ...conhecimentosGeraisQuestions,
  ...lote202610Questions,
  ...lote202610bQuestions,
  ...imported.questions,
];
