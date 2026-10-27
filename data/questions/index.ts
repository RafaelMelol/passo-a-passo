import { parseQuestionList } from "@/lib/questions/parse";
import type { Question } from "@/types/question";
import importadas from "./importadas.json";
import { informaticaQuestions } from "./informatica";
import { lote202610Questions } from "./lote-2026-10";
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
  ...lote202610Questions,
  ...imported.questions,
];
